-- Pool's day — 일정 초대 관계 영속화 (2026-06-12).
--
-- 배경: 지금까지 일정 초대는 "초대-수락 관계"를 어디에도 저장하지 않았다.
-- 수락 = 그저 내 캘린더에 같은 슬롯을 추가하는 것이고, 참여자는 순전히 슬롯
-- 일치(pool+date+start+end)로만 계산됐다(scheduleParticipants). 그 결과
--  · 초대자에게 "누가 수락/거절/대기 중인지" 영구 상태가 없었고(일회성 알림뿐),
--  · 우연히 같은 슬롯을 가진 사람과 "초대받아 수락한 사람"을 구분하지 못했다.
--
-- 이 마이그레이션: friend_requests(0048)와 같은 패턴으로 초대 관계 테이블을 만들고,
-- 72h 무응답 자동 만료 cron(0086의 expire_pending_invites 복제)을 붙인다.
-- 참여자 판정은 슬롯매칭을 그대로 유지 — 이 테이블은 "초대 이력·상태"용.
--
-- ## 설계 결정 (0049 user_schedules / 0048 friends 와 일관)
--  1) id uuid PK — 서버 발급(초대 행은 클라가 id 관리할 필요 없음, notifications 와 동일).
--  2) FK 는 모두 profiles.id(text, 친구코드) on update cascade on delete cascade.
--  3) 슬롯은 캐시 스냅샷(pool_name NOT NULL) — 풀 삭제돼도 초대 이력 표시 가능.
--     pool_id references pools(id) on delete set null.
--  4) status enum text: pending|accepted|rejected|canceled|expired.
--  5) inviter_schedule_id / accepted_schedule_id — 양측 "일정 보기" 딥링크용(nullable).
--  6) 부분 unique(중복 pending 방지) — 거절/취소/만료 후 재초대 허용(friend_requests 와 일관).

create table if not exists public.schedule_invites (
  id                   uuid        primary key default gen_random_uuid(),
  inviter_id           text        not null references public.profiles(id)
                                     on update cascade on delete cascade,
  invitee_id           text        not null references public.profiles(id)
                                     on update cascade on delete cascade,
  inviter_schedule_id  text,                              -- 초대자 원본 일정 id(딥링크용)
  pool_id              text        references public.pools(id) on delete set null,
  pool_name            text        not null,              -- 캐시(풀 삭제 보호)
  pool_photo_url       text,                              -- 캐시
  date                 text        not null,              -- YYYY-MM-DD
  start_time           text        not null,              -- HH:MM (24h)
  end_time             text        not null,              -- HH:MM (24h)
  status               text        not null default 'pending'
                                     check (status in ('pending', 'accepted', 'rejected', 'canceled', 'expired')),
  accepted_schedule_id text,                              -- 수락 시 invitee 본인 일정 id(딥링크용)
  created_at           timestamptz not null default now(),
  responded_at         timestamptz
);

-- 중복 pending 방지(같은 초대자→피초대자→슬롯). 거절/취소/만료 후엔 재초대 허용.
create unique index if not exists schedule_invites_pending_uniq
  on public.schedule_invites (inviter_id, invitee_id, pool_id, date, start_time)
  where status = 'pending';

-- invitee 의 대기 초대 조회
create index if not exists schedule_invites_invitee_status_idx
  on public.schedule_invites (invitee_id, status);

-- 초대자가 슬롯 취소 시 조회
create index if not exists schedule_invites_inviter_date_idx
  on public.schedule_invites (inviter_id, date);

-- ─────────────────────────────────────────────────────────────────────
-- RLS — 양 당사자 본인 행만(0060/0225 하드닝 톤). profiles.auth_uid 매핑.
-- service_role 은 RLS 우회(cron/관리). delete 정책 미정의 = service_role 만.
-- ─────────────────────────────────────────────────────────────────────
alter table public.schedule_invites enable row level security;

-- select: 초대자 또는 피초대자 = 나
drop policy if exists schedule_invites_select_party on public.schedule_invites;
create policy schedule_invites_select_party on public.schedule_invites
  for select using (
    (select auth_uid from public.profiles where id = inviter_id) = auth.uid()
    or (select auth_uid from public.profiles where id = invitee_id) = auth.uid()
  );

-- insert: 초대자 = 나 (발송)
drop policy if exists schedule_invites_insert_inviter on public.schedule_invites;
create policy schedule_invites_insert_inviter on public.schedule_invites
  for insert with check (
    (select auth_uid from public.profiles where id = inviter_id) = auth.uid()
  );

-- update: 양 당사자(피초대자=수락/거절, 초대자=취소) 중 하나 = 나
drop policy if exists schedule_invites_update_party on public.schedule_invites;
create policy schedule_invites_update_party on public.schedule_invites
  for update using (
    (select auth_uid from public.profiles where id = inviter_id) = auth.uid()
    or (select auth_uid from public.profiles where id = invitee_id) = auth.uid()
  ) with check (
    (select auth_uid from public.profiles where id = inviter_id) = auth.uid()
    or (select auth_uid from public.profiles where id = invitee_id) = auth.uid()
  );

-- ─────────────────────────────────────────────────────────────────────
-- 72h 자동 만료 — 0086 expire_pending_invites(friend_requests)의 일정초대판.
--
-- 대상: schedule_invites.status='pending' AND created_at < now() - 72h.
-- 동작: status='expired', responded_at=now() UPDATE + 양측 notifications insert.
--   · kind='invite_auto_expired'(category='friend'). rules.ts 와 톤 일치.
--   · cron 컨텍스트(auth.uid() IS NULL)이므로 0195 notify_push_on_insert 트리거가
--     자동으로 send-push 호출 — 추가 코드 불필요(받는 사람 notif_prefs.friend 게이팅).
-- ─────────────────────────────────────────────────────────────────────
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
       and si.created_at < now() - interval '72 hours'
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

-- ─────────────────────────────────────────────────────────────────────
-- pg_cron — 매 시각 정시(0086 dedup do-block 패턴, extension already enabled).
-- ─────────────────────────────────────────────────────────────────────
create extension if not exists pg_cron;

do $do$
begin
  if not exists (
    select 1 from cron.job where jobname = 'expire_schedule_invites_hourly'
  ) then
    perform cron.schedule(
      'expire_schedule_invites_hourly',
      '0 * * * *',
      $sql$select public.expire_schedule_invites();$sql$
    );
  end if;
exception
  when undefined_table or undefined_function then
    raise notice 'pg_cron not available — schedule manually via Dashboard';
end$do$;
