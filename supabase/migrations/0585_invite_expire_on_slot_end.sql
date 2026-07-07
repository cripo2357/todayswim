-- Pool's day — 일정 초대 만료 조건에 "슬롯 종료 지남" 추가 (2026-07-07).
--
-- 문제: 0296 expire_schedule_invites는 '보낸 지 72h'만 봤음. 그래서 이미 끝난
--   슬롯의 초대가 며칠(72h) 뒤에야 만료되는 비직관 동작. (수영 끝났는데 pending)
-- 변경: 만료 = (created_at < now()-72h) OR (슬롯 종료시각(KST) < 지금). 슬롯이
--   끝나면 초대도 자동 만료. cron 매시간이라 종료 후 1시간 내 처리. 72h는 폴백.
-- 함수 본문은 0296 그대로, WHERE 한 줄만 확장(create or replace).

create or replace function public.expire_schedule_invites()
returns bigint
language plpgsql
security definer
as $func$
declare
  v_inserted bigint := 0;
begin
  with expired as (
    update public.schedule_invites si
       set status = 'expired',
           responded_at = now()
     where si.status = 'pending'
       and (
         si.created_at < now() - interval '72 hours'
         or (si.date || ' ' || si.end_time)::timestamp
              < (now() at time zone 'Asia/Seoul')
       )
    returning si.id, si.inviter_id, si.invitee_id, si.pool_id, si.pool_name,
              si.date, si.start_time, si.end_time
  ),
  enriched as (
    select e.*,
           pi.nickname as inviter_nick,
           pv.nickname as invitee_nick
      from expired e
      left join public.profiles pi on pi.id = e.inviter_id
      left join public.profiles pv on pv.id = e.invitee_id
  ),
  ins_invitee as (
    insert into public.notifications
      (user_code, kind, title, body, params, actions, related, category)
    select
      en.invitee_id,
      'invite_auto_expired',
      '초대 만료',
      jsonb_build_array(
        coalesce(en.inviter_nick, '상대') || '님의 ' || en.date || ' 수영 일정 초대를 놓쳤어요.'
      ),
      jsonb_build_object('name', en.inviter_nick, 'date', en.date),
      '[]'::jsonb,
      jsonb_build_object(
        'senderUserId', en.inviter_id, 'inviteId', en.id, 'poolId', en.pool_id,
        'date', en.date, 'start', en.start_time, 'end', en.end_time
      ),
      'friend'
    from enriched en
    returning 1
  ),
  ins_inviter as (
    insert into public.notifications
      (user_code, kind, title, body, params, actions, related, category)
    select
      en.inviter_id,
      'invite_auto_expired',
      '초대 만료',
      jsonb_build_array(
        coalesce(en.invitee_nick, '상대') || '님이 ' || en.date || ' 수영 일정 초대에 응답하지 않았어요.'
      ),
      jsonb_build_object('name', en.invitee_nick, 'date', en.date),
      '[]'::jsonb,
      jsonb_build_object(
        'senderUserId', en.invitee_id, 'inviteId', en.id, 'poolId', en.pool_id,
        'date', en.date, 'start', en.start_time, 'end', en.end_time
      ),
      'friend'
    from enriched en
    returning 1
  )
  select (select count(*) from ins_invitee) + (select count(*) from ins_inviter)
    into v_inserted;
  return v_inserted;
end;
$func$;
