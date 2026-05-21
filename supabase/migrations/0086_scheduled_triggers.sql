-- Pool's day — 시스템 cron 트리거 3종 (P3 후속, 2026-05-22).
--
-- 시간 기반 자동 발화 알림:
--   1) schedule_reminder_prev_day — 매일 18:00 KST: 내일 일정 보유자
--   2) schedule_reminder_1h       — 매 5분: 1시간 후 시작 일정 보유자
--   3) invite_auto_expired        — 매 시간: 72h 무응답 친구신청 만료
--
-- ## 알림 인지 흐름
--
-- 본 함수는 `notifications` row 적재까지만 책임. 사용자 인지는 두 경로:
--   · 앱 열린 상태 → `useNotificationsRealtime` (0085) 가 즉시 카드 갱신
--   · 앱 닫힌 상태 → ❌ OS 푸시 아직 미연결 (pg_net + send-push 통합 후속)
--
-- 출시 전 후속: pg_net.http_post 로 send-push Edge Function 호출 →
-- 푸시까지 자동. 본 버전은 in-app realtime 만.
--
-- ## 시간대
--
-- 모든 시간 비교는 KST(Asia/Seoul) 기준. user_schedules.date 는 YYYY-MM-DD
-- 텍스트(timezone-naive, 의미는 KST), start_time/end_time 도 HH:MM 텍스트(KST).
--
-- ## Dedup
--
-- 같은 schedule + kind 조합으로 이미 notifications 적재됐으면 skip.
-- related.scheduleId 매칭으로 확인.

-- ─────────────────────────────────────────────────────────────────────
-- 1) schedule_reminder_prev_day
--
-- 호출: 매일 18:00 KST (UTC 09:00).
-- 대상: user_schedules.date 가 내일(KST) 인 자가 일정.
-- ─────────────────────────────────────────────────────────────────────
create or replace function public.send_schedule_reminder_prev_day()
returns bigint
language plpgsql
security definer
as $$
declare
  v_now_kst timestamptz := now() at time zone 'Asia/Seoul';
  v_tomorrow text := to_char((v_now_kst + interval '1 day')::date, 'YYYY-MM-DD');
  v_inserted bigint := 0;
begin
  with target as (
    select s.id as schedule_id, s.profile_id, s.pool_name, s.start_time
      from public.user_schedules s
     where s.date = v_tomorrow
       and s.completed = false
       and not exists (
         select 1 from public.notifications n
          where n.user_code = s.profile_id
            and n.kind = 'schedule_reminder_prev_day'
            and n.related->>'scheduleId' = s.id
       )
  ),
  ins as (
    insert into public.notifications
      (user_code, kind, title, body, params, actions, related)
    select
      t.profile_id,
      'schedule_reminder_prev_day',
      '내일 수영 일정',
      jsonb_build_array(coalesce(t.pool_name, '') || ' ' || coalesce(t.start_time, '')),
      jsonb_build_object('pool', t.pool_name, 'time', t.start_time),
      '[]'::jsonb,
      jsonb_build_object('scheduleId', t.schedule_id)
    from target t
    returning 1
  )
  select count(*) into v_inserted from ins;
  return v_inserted;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────
-- 2) schedule_reminder_1h
--
-- 호출: 매 5분.
-- 대상: 지금부터 60~65분 후 시작하는 일정(KST). 5분 tolerance = cron 주기.
-- ─────────────────────────────────────────────────────────────────────
create or replace function public.send_schedule_reminder_1h()
returns bigint
language plpgsql
security definer
as $$
declare
  v_now_kst timestamptz := now() at time zone 'Asia/Seoul';
  v_target_start timestamptz := v_now_kst + interval '60 minutes';
  v_target_end   timestamptz := v_now_kst + interval '65 minutes';
  v_inserted bigint := 0;
begin
  with target as (
    select s.id as schedule_id, s.profile_id, s.pool_name
      from public.user_schedules s
     where s.completed = false
       -- s.date + s.start_time 을 KST timestamp 로 조합해 비교.
       and (s.date || ' ' || s.start_time)::timestamp
             between v_target_start::timestamp and v_target_end::timestamp
       and not exists (
         select 1 from public.notifications n
          where n.user_code = s.profile_id
            and n.kind = 'schedule_reminder_1h'
            and n.related->>'scheduleId' = s.id
       )
  ),
  ins as (
    insert into public.notifications
      (user_code, kind, title, body, params, actions, related)
    select
      t.profile_id,
      'schedule_reminder_1h',
      '곧 수영 일정',
      jsonb_build_array(coalesce(t.pool_name, '')),
      jsonb_build_object('pool', t.pool_name),
      '[]'::jsonb,
      jsonb_build_object('scheduleId', t.schedule_id)
    from target t
    returning 1
  )
  select count(*) into v_inserted from ins;
  return v_inserted;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────
-- 3) invite_auto_expired
--
-- 호출: 매 시간.
-- 대상: friend_requests.status='pending' AND created_at < now() - 72h.
-- 동작:
--   · friend_requests.status='expired', responded_at=now() UPDATE
--   · notifications insert — 룰 recipients='both' 라 from + to 양쪽 적재
-- ─────────────────────────────────────────────────────────────────────
create or replace function public.expire_pending_invites()
returns bigint
language plpgsql
security definer
as $$
declare
  v_inserted bigint := 0;
begin
  with expired as (
    update public.friend_requests
       set status = 'expired',
           responded_at = now()
     where status = 'pending'
       and created_at < now() - interval '72 hours'
    returning id, from_profile_id, to_profile_id
  ),
  -- 본인(from) 행 — title/body 는 rules.invite_auto_expired.build 와 일치 톤
  ins_from as (
    insert into public.notifications
      (user_code, kind, title, body, params, actions, related)
    select
      e.from_profile_id,
      'invite_auto_expired',
      '친구 신청 만료',
      jsonb_build_array('72시간 동안 응답이 없어 자동 취소됐어요.'),
      '{}'::jsonb,
      '[]'::jsonb,
      jsonb_build_object('senderUserId', e.from_profile_id, 'requestId', e.id)
    from expired e
    returning 1
  ),
  -- 상대(to) 행
  ins_to as (
    insert into public.notifications
      (user_code, kind, title, body, params, actions, related)
    select
      e.to_profile_id,
      'invite_auto_expired',
      '친구 신청 만료',
      jsonb_build_array('72시간 동안 응답이 없어 자동 취소됐어요.'),
      '{}'::jsonb,
      '[]'::jsonb,
      jsonb_build_object('senderUserId', e.from_profile_id, 'requestId', e.id)
    from expired e
    returning 1
  )
  select (select count(*) from ins_from) + (select count(*) from ins_to)
    into v_inserted;
  return v_inserted;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────
-- pg_cron 스케줄 — 0084 와 동일 패턴 (extension already enabled).
-- 중복 등록 방지 do block.
-- ─────────────────────────────────────────────────────────────────────
create extension if not exists pg_cron;

do $$
begin
  if not exists (
    select 1 from cron.job where jobname = 'schedule_reminder_prev_day_daily'
  ) then
    perform cron.schedule(
      'schedule_reminder_prev_day_daily',
      '0 9 * * *',   -- UTC 09:00 = KST 18:00 (내일 일정 사용자에게 저녁 알림)
      $sql$select public.send_schedule_reminder_prev_day();$sql$
    );
  end if;

  if not exists (
    select 1 from cron.job where jobname = 'schedule_reminder_1h_5min'
  ) then
    perform cron.schedule(
      'schedule_reminder_1h_5min',
      '*/5 * * * *', -- 매 5분
      $sql$select public.send_schedule_reminder_1h();$sql$
    );
  end if;

  if not exists (
    select 1 from cron.job where jobname = 'expire_pending_invites_hourly'
  ) then
    perform cron.schedule(
      'expire_pending_invites_hourly',
      '0 * * * *',   -- 매 시각 정시
      $sql$select public.expire_pending_invites();$sql$
    );
  end if;
exception
  when undefined_table or undefined_function then
    raise notice 'pg_cron not available — schedule manually via Dashboard';
end$$;
