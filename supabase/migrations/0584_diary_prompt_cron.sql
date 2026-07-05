-- Pool's day — 수영 일기 작성 유도 알림 (schedule_completion_prompt) 발송 cron.
-- (2026-07-05)
--
-- 슬롯 종료 1시간 후, 아직 일기를 안 쓴 슬롯의 소유자에게 "오늘 수영 어땠어요?" 알림.
--   버튼: 못 감(일정 삭제) / 나중에(닫기) / 일기 작성(작성 화면 딥링크).
--   category='report'? → 'schedule'(일정 리마인더 계열). notif_prefs['schedule']로 게이팅.
--
-- ## 시각/윈도
--   매 5분 실행. 종료시각(KST)이 지금부터 60~65분 전인 슬롯 = "종료 1시간 후" 근사.
--   5분 tolerance = cron 주기. 이미 발송(dedup)·이미 일기작성(swim_diaries)이면 스킵.
--
-- ## 제외
--   · swim_diaries에 해당 schedule_id 있으면(이미 작성) 스킵.
--   · notifications에 같은 schedule_id로 schedule_completion_prompt 있으면(이미 발송) 스킵.

create or replace function public.send_diary_prompt()
returns bigint
language plpgsql
security definer
as $$
declare
  v_now_kst timestamp := now() at time zone 'Asia/Seoul';
  v_lo timestamp := v_now_kst - interval '65 minutes';
  v_hi timestamp := v_now_kst - interval '60 minutes';
  v_inserted bigint := 0;
begin
  with target as (
    select s.id as schedule_id, s.profile_id, s.pool_name
      from public.user_schedules s
     where (s.date || ' ' || s.end_time)::timestamp >= v_lo
       and (s.date || ' ' || s.end_time)::timestamp <  v_hi
       and not exists (
         select 1 from public.swim_diaries d
          where d.schedule_id = s.id
       )
       and not exists (
         select 1 from public.notifications n
          where n.user_code = s.profile_id
            and n.kind = 'schedule_completion_prompt'
            and n.related->>'scheduleId' = s.id
       )
  ),
  ins as (
    insert into public.notifications
      (user_code, kind, title, body, params, actions, related, category)
    select
      t.profile_id,
      'schedule_completion_prompt',
      '오늘 수영 어땠어요?',
      jsonb_build_array(coalesce(t.pool_name, '')),
      jsonb_build_object('pool', t.pool_name),
      jsonb_build_array('못 감', '나중에', '일기 작성'),
      jsonb_build_object('scheduleId', t.schedule_id),
      'schedule'
    from target t
    returning 1
  )
  select count(*) into v_inserted from ins;
  return v_inserted;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────
-- pg_cron 등록 — 0086 패턴(중복 방지 do block). 매 5분.
-- ─────────────────────────────────────────────────────────────────────
create extension if not exists pg_cron;

do $$
begin
  if not exists (
    select 1 from cron.job where jobname = 'diary_prompt_5min'
  ) then
    perform cron.schedule(
      'diary_prompt_5min',
      '*/5 * * * *',
      $sql$select public.send_diary_prompt();$sql$
    );
  end if;
exception
  when undefined_table or undefined_function then
    raise notice 'pg_cron not available — schedule manually via Dashboard';
end $$;
