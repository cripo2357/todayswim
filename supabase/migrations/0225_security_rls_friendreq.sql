-- Pool's day — 보안 RLS 하드닝 + 친구 신청 받기 서버 강제 (2026-06-07).
--
-- RLS 전수 감사(라이브 DB)에서 발견:
--  1) profiles_select_any USING(true) — anon 포함 누구나 전 프로필 크롤(닉네임·자기
--     소개·친구코드·auth_uid). 친구신청 프라이버시 불가의 근본 원인.
--  2) notifications_insert_any CHECK(true) — 누구나 아무에게 가짜 알림 삽입(스팸/피싱).
--  3) push_debug — 디버그 테이블이 프로덕션에 열려 있음(클라/함수 미사용).
--  4) pool/schedule submissions 비로그인 insert 가능(스팸).
--
-- 이 마이그레이션:
--  · profiles 읽기 = 로그인(authenticated) 전용 — anon 크롤 차단. (앱의 profiles
--    읽기는 전부 로그인 경로라 영향 없음. 발견(검색)은 아래 RPC로.)
--  · friend_request_mode 컬럼(off/id/all) + 검색 RPC가 서버에서 강제 — "신청 안 받기"·
--    "ID로만"이 실제 작동(클라 우회 불가).
--  · notifications/submissions insert = 로그인 전용.
--  · push_debug 드롭.
--
-- 후속(이 마이그레이션 범위 밖): auth_uid 컬럼은 dispatch.ts가 푸시 발송에 읽어
--   v1에선 유지(푸시 친구코드→토큰 해소를 send-push 서버로 옮긴 뒤 revoke).
--   raw API 레벨 완전 차단(관계기반 profiles 정책)도 후속 — 현재는 앱 경로 강제 + anon 차단.

-- 1) 디버그 테이블 제거
drop table if exists public.push_debug cascade;

-- 2) profiles 읽기 = 로그인 전용
drop policy if exists profiles_select_any on public.profiles;
create policy profiles_select_auth on public.profiles
  for select to authenticated using (true);

-- 3) 친구 신청 받기 모드 컬럼 (기본 all = 기존 'nickname' 대체)
alter table public.profiles
  add column if not exists friend_request_mode text not null default 'all';
alter table public.profiles
  drop constraint if exists profiles_friend_request_mode_chk;
alter table public.profiles
  add constraint profiles_friend_request_mode_chk
  check (friend_request_mode in ('off','id','all'));

-- 4) 검색 RPC — SECURITY DEFINER로 friend_request_mode 서버 강제(우회 불가).
--    닉네임 검색 = mode 'all' 만 노출. 자기 자신 제외.
create or replace function public.search_friends_by_nickname(q text)
returns table (id text, nickname text, bio text, photo_uri text)
language sql stable security definer set search_path = public as $$
  select p.id, p.nickname, p.bio, p.photo_uri
  from public.profiles p
  where p.nickname ilike '%' || q || '%'
    and p.friend_request_mode = 'all'
    and p.id <> coalesce(current_profile_id(), '')
  order by p.nickname
  limit 20;
$$;

-- ID(친구코드) 검색 = mode 'id' 또는 'all'. 정확 일치.
create or replace function public.find_friend_by_code(c text)
returns table (id text, nickname text, bio text, photo_uri text)
language sql stable security definer set search_path = public as $$
  select p.id, p.nickname, p.bio, p.photo_uri
  from public.profiles p
  where p.id = c
    and p.friend_request_mode in ('id','all')
    and p.id <> coalesce(current_profile_id(), '')
  limit 1;
$$;

revoke all on function public.search_friends_by_nickname(text) from public;
revoke all on function public.find_friend_by_code(text) from public;
grant execute on function public.search_friends_by_nickname(text) to authenticated;
grant execute on function public.find_friend_by_code(text) to authenticated;

-- 5) notifications insert = 로그인 전용 (익명 가짜 알림 스팸 차단)
drop policy if exists notifications_insert_any on public.notifications;
create policy notifications_insert_auth on public.notifications
  for insert to authenticated with check (true);

-- 6) 제보 insert = 로그인 전용 (익명 스팸 차단)
drop policy if exists pool_submissions_insert_any on public.pool_submissions;
create policy pool_submissions_insert_auth on public.pool_submissions
  for insert to authenticated with check (true);
drop policy if exists schedule_submissions_insert_any on public.schedule_submissions;
create policy schedule_submissions_insert_auth on public.schedule_submissions
  for insert to authenticated with check (true);
