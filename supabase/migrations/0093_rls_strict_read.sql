-- Pool's day — P3 prod 출시 전 RLS read 정책 strict 화 (2026-05-26).
--
-- 분석 ([[P3-DEPLOY-CHECKLIST]] + P3-ENV-PROD-SETUP):
-- 0060(P2) 은 INSERT/UPDATE/DELETE 만 본인화, SELECT 는 대부분 (true) 유지.
-- 0081(P3) 가 notifications + storage avatars 본인화. 다음 5개 테이블은 여전히
-- SELECT (true) → 누구나 친구관계·차단목록·일정 그래프 조회 가능 (데이터 누설).
--
-- 본 마이그 = prod 출시 전 마지막 RLS 게이트.
--
-- 적용 대상:
--   1. friendships         — 본인이 양쪽 어느쪽이든 포함된 행만
--   2. friend_requests     — 본인이 송수신자인 행만
--   3. blocks              — 본인이 차단자인 행만
--   4. user_schedules      — 본인 + visibility=public + visibility=friends 인 친구 일정 (차단자 제외)
--   5. donations           — hidden=false (공개) 또는 본인 행
--
-- 미적용 (이미 적정):
--   - profiles: SELECT (true) 유지 — 닉네임 검색·친구코드 공유에 필수. 민감
--     정보(생년월일 등)는 클라 UI 가 자체 필터(공개범위 prefs).
--   - notifications, terms_agreements, push_tokens, donation_payments: 이미 strict.

-- ─────────────────────────────────────────────────────────────────────
-- Helper: 현재 인증 사용자의 profile.id(친구코드) 반환
-- ─────────────────────────────────────────────────────────────────────
create or replace function public.current_profile_id()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select id from public.profiles where auth_uid = auth.uid() limit 1
$$;

grant execute on function public.current_profile_id() to authenticated, anon;

-- ─────────────────────────────────────────────────────────────────────
-- 1. friendships — 본인 관여 행만
-- ─────────────────────────────────────────────────────────────────────
drop policy if exists friendships_select_any on public.friendships;
drop policy if exists friendships_select_owner on public.friendships;

create policy friendships_select_owner on public.friendships
  for select using (
    profile_id = public.current_profile_id()
    or friend_id = public.current_profile_id()
  );

-- ─────────────────────────────────────────────────────────────────────
-- 2. friend_requests — 본인 송수신만
-- ─────────────────────────────────────────────────────────────────────
drop policy if exists friend_requests_select_any on public.friend_requests;
drop policy if exists friend_requests_select_owner on public.friend_requests;

create policy friend_requests_select_owner on public.friend_requests
  for select using (
    from_profile_id = public.current_profile_id()
    or to_profile_id = public.current_profile_id()
  );

-- ─────────────────────────────────────────────────────────────────────
-- 3. blocks — 본인 차단 행만
-- ─────────────────────────────────────────────────────────────────────
drop policy if exists blocks_select_any on public.blocks;
drop policy if exists blocks_select_owner on public.blocks;

create policy blocks_select_owner on public.blocks
  for select using (
    blocker_id = public.current_profile_id()
  );

-- ─────────────────────────────────────────────────────────────────────
-- 4. user_schedules — 본인 + 공개 + 친구공개(친구 관계 있을 때)
--    private 자동 제외. blocked 사용자 일정 제외.
-- ─────────────────────────────────────────────────────────────────────
drop policy if exists user_schedules_select_any on public.user_schedules;
drop policy if exists user_schedules_select_visible on public.user_schedules;

create policy user_schedules_select_visible on public.user_schedules
  for select using (
    -- (a) 본인 일정
    profile_id = public.current_profile_id()
    or (
      -- (b) 차단되지 않은 사용자 + visibility 충족
      profile_id not in (
        select blocked_id from public.blocks
        where blocker_id = public.current_profile_id()
      )
      and (
        visibility = 'public'
        or (
          visibility = 'friends'
          and exists (
            select 1 from public.friendships
            where profile_id = user_schedules.profile_id
              and friend_id = public.current_profile_id()
          )
        )
      )
    )
  );

-- ─────────────────────────────────────────────────────────────────────
-- 5. donations — 공개(hidden=false) 또는 본인
-- ─────────────────────────────────────────────────────────────────────
drop policy if exists donations_select_any on public.donations;
drop policy if exists donations_select_visible on public.donations;

create policy donations_select_visible on public.donations
  for select using (
    hidden = false
    or profile_id = public.current_profile_id()
  );
