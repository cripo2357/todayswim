-- Pool's day — 회원 탈퇴 후 90일 보존 자동 파기 (P3-B.2, 2026-05-22).
--
-- delete-account Edge Function (P3-A1) 가 즉시 삭제하는 것:
--   auth.users / profiles (CASCADE → donations) / Storage avatars
--
-- 90일 보존하는 것 (개인정보 처리방침 §3, 약관 §12):
--   notifications (user_code, profiles FK 없음)
--   profile_nicknames (nickname PK, profiles FK 없음 — 재가입 부정이용 방지)
--
-- 본 마이그레이션은:
--   1) deleted_users tombstone 테이블 — 탈퇴 시각·user_code·nicknames 보관
--   2) cleanup_expired_data() SQL 함수 — 90일 경과 tombstone 의 데이터 일괄 삭제
--   3) pg_cron 매일 03:00 KST(=18:00 UTC) 실행 스케줄
--
-- delete-account Edge Function 도 함께 갱신 (별도 commit) — profile DELETE
-- 직전에 tombstone INSERT 추가.
--
-- 정확한 retention: "탈퇴 후 90일" — created_at 기반 proxy 대신 deleted_at
-- 기준이라 (재가입 부정이용 방지 + 회계 기록 등) 법령 의도와 일치.

-- ─────────────────────────────────────────────────────────────────────
-- 1) deleted_users — 탈퇴 tombstone
-- ─────────────────────────────────────────────────────────────────────
create table if not exists public.deleted_users (
  user_code   text        primary key, -- 옛 profile.id(6자 친구코드)
  -- 탈퇴 시점에 사용 중이던 닉네임(들). 통상 1개, 닉네임 변경 이력 추적 시 N개.
  nicknames   text[]      not null default '{}',
  deleted_at  timestamptz not null default now()
);

create index if not exists deleted_users_deleted_at_idx
  on public.deleted_users (deleted_at);

-- RLS: service_role 전용. 사용자 접근 정책 없음 → anon/authenticated 차단.
alter table public.deleted_users enable row level security;

-- ─────────────────────────────────────────────────────────────────────
-- 2) cleanup_expired_data() — 90일 경과분 일괄 파기
--
-- 반환: 삭제 count 3종(검증·로깅용).
-- security definer 이라 service_role 권한 사용 — RLS 우회.
-- ─────────────────────────────────────────────────────────────────────
create or replace function public.cleanup_expired_data()
returns table (notifs_deleted bigint, nicknames_deleted bigint, tombstones_cleared bigint)
language plpgsql
security definer
as $$
declare
  v_threshold timestamptz := now() - interval '90 days';
  v_notifs bigint;
  v_nicks  bigint;
  v_tombs  bigint;
begin
  -- notifications: 90일 경과 tombstone 의 user_code 매칭분 삭제.
  with notif_del as (
    delete from public.notifications
     where user_code in (
       select user_code from public.deleted_users where deleted_at < v_threshold
     )
    returning 1
  )
  select count(*) into v_notifs from notif_del;

  -- profile_nicknames: 90일 경과 tombstone 의 nicknames 배열 매칭분 삭제.
  -- unnest 로 배열 → 행 펼친 후 IN 매칭.
  with expired_nicks as (
    select unnest(nicknames) as nickname
      from public.deleted_users
     where deleted_at < v_threshold
  ),
  nick_del as (
    delete from public.profile_nicknames
     where nickname in (select nickname from expired_nicks)
    returning 1
  )
  select count(*) into v_nicks from nick_del;

  -- tombstone 자체 정리(역할 끝남).
  with tomb_del as (
    delete from public.deleted_users
     where deleted_at < v_threshold
    returning 1
  )
  select count(*) into v_tombs from tomb_del;

  return query select v_notifs, v_nicks, v_tombs;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────
-- 3) pg_cron 스케줄 — 매일 03:00 KST (= UTC 18:00)
--
-- pg_cron Supabase Pro+ 기본 활성. Free 는 Dashboard > Database > Extensions
-- 에서 토글. CREATE EXTENSION IF NOT EXISTS 는 권한 없으면 skip(silent fail
-- 회피 위해 try/catch 패턴).
-- ─────────────────────────────────────────────────────────────────────
create extension if not exists pg_cron;

-- 같은 jobname 중복 등록 방지.
do $$
begin
  if not exists (
    select 1 from cron.job where jobname = 'cleanup_expired_data_daily'
  ) then
    perform cron.schedule(
      'cleanup_expired_data_daily',
      '0 18 * * *',  -- UTC 18:00 = KST 03:00
      $sql$select public.cleanup_expired_data();$sql$
    );
  end if;
exception
  when undefined_table or undefined_function then
    -- pg_cron 미활성 환경(Free tier 등). Dashboard 에서 Extension 활성 후
    -- 본 마이그 재실행 또는 cron.schedule 별도 수동 호출.
    raise notice 'pg_cron not available — schedule manually via Dashboard';
end$$;
