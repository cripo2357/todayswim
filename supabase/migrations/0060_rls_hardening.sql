-- Pool's day — Phase 2 마무리: RLS 보수적 하드닝.
--
-- ## 정책
--
-- 6개 테이블(profiles / friend_requests / friendships / blocks / user_schedules /
-- notifications)의 RLS를 P1 톤(`(true)`)에서 **본인 검증 write**로 강화.
-- select은 (true) 유지 — 친구코드 공유·검색·다른 사용자 프로필 노출 등 P2
-- UX 기능 보존. 더 빡센 read 정책은 P3 prod 분리 시점에 검토.
--
-- ## 본인 식별
--
-- profile_id (친구코드 6자리 text) ↔ auth.uid() (uuid) 매핑은 profiles.auth_uid
-- 컬럼(0059)으로. write 정책은 다음 패턴으로 검증:
--
--   (select auth_uid from public.profiles where id = <profile_id 컬럼>) = auth.uid()
--
-- ## mock 시드 호환
--
-- profiles에는 mock 친구 61명이 auth_uid=null로 시드돼 있음. profiles.insert/
-- update 정책은 `auth_uid is null or auth_uid = auth.uid()`로 null 허용 — 시드
-- upsert 재시도가 정책 통과. 실 가입자는 본인 auth_uid 매칭만 통과.
--
-- ## friendships 양방향 insert
--
-- accept 시 클라가 (me→other) + (other→me) 두 행 동시 insert. 보수적이면
-- (other→me)는 정책 위반(profile_id의 auth_uid가 본인 아님) → friendships.insert
-- 정책은 **양쪽 어느 한 쪽이라도 본인**이면 허용으로 완화. P3에서 RPC
-- security-definer 함수로 이관 시 strict 가능.
--
-- ## notifications 'other' 적재
--
-- dispatchMessageTo가 상대 user_code로 알림 적재. 본인 검증하면 막힘 → insert는
-- (true) 유지. update/delete만 본인 user_code 행. 스팸 방지는 P3 RPC.

-- ─────────────────────────────────────────────────────────────────────
-- profiles
-- ─────────────────────────────────────────────────────────────────────
drop policy if exists profiles_select_any on public.profiles;
create policy profiles_select_any on public.profiles
  for select using (true);

drop policy if exists profiles_insert_any on public.profiles;
drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self on public.profiles
  for insert with check (
    auth_uid is null
    or auth_uid = auth.uid()
  );

drop policy if exists profiles_update_any on public.profiles;
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update
    using (auth_uid is null or auth_uid = auth.uid())
    with check (auth_uid is null or auth_uid = auth.uid());
-- delete 정책 없음 → service_role 전용(탈퇴 처리는 auth.users on delete cascade로).

-- ─────────────────────────────────────────────────────────────────────
-- friend_requests
-- ─────────────────────────────────────────────────────────────────────
drop policy if exists friend_requests_select_any on public.friend_requests;
create policy friend_requests_select_any on public.friend_requests
  for select using (true);

drop policy if exists friend_requests_insert_any on public.friend_requests;
drop policy if exists friend_requests_insert_from_self on public.friend_requests;
create policy friend_requests_insert_from_self on public.friend_requests
  for insert with check (
    (select auth_uid from public.profiles where id = from_profile_id) = auth.uid()
  );

drop policy if exists friend_requests_update_any on public.friend_requests;
drop policy if exists friend_requests_update_party on public.friend_requests;
create policy friend_requests_update_party on public.friend_requests
  for update using (
    (select auth_uid from public.profiles where id = from_profile_id) = auth.uid()
    or (select auth_uid from public.profiles where id = to_profile_id) = auth.uid()
  );

drop policy if exists friend_requests_delete_any on public.friend_requests;
drop policy if exists friend_requests_delete_party on public.friend_requests;
create policy friend_requests_delete_party on public.friend_requests
  for delete using (
    (select auth_uid from public.profiles where id = from_profile_id) = auth.uid()
    or (select auth_uid from public.profiles where id = to_profile_id) = auth.uid()
  );

-- ─────────────────────────────────────────────────────────────────────
-- friendships — 양방향 insert 허용을 위해 "어느 한 쪽이라도 본인"
-- ─────────────────────────────────────────────────────────────────────
drop policy if exists friendships_select_any on public.friendships;
create policy friendships_select_any on public.friendships
  for select using (true);

drop policy if exists friendships_insert_any on public.friendships;
drop policy if exists friendships_insert_related on public.friendships;
create policy friendships_insert_related on public.friendships
  for insert with check (
    (select auth_uid from public.profiles where id = profile_id) = auth.uid()
    or (select auth_uid from public.profiles where id = friend_id) = auth.uid()
  );

drop policy if exists friendships_delete_any on public.friendships;
drop policy if exists friendships_delete_related on public.friendships;
create policy friendships_delete_related on public.friendships
  for delete using (
    (select auth_uid from public.profiles where id = profile_id) = auth.uid()
    or (select auth_uid from public.profiles where id = friend_id) = auth.uid()
  );

-- ─────────────────────────────────────────────────────────────────────
-- blocks
-- ─────────────────────────────────────────────────────────────────────
drop policy if exists blocks_select_any on public.blocks;
create policy blocks_select_any on public.blocks
  for select using (true);

drop policy if exists blocks_insert_any on public.blocks;
drop policy if exists blocks_insert_self on public.blocks;
create policy blocks_insert_self on public.blocks
  for insert with check (
    (select auth_uid from public.profiles where id = blocker_id) = auth.uid()
  );

drop policy if exists blocks_delete_any on public.blocks;
drop policy if exists blocks_delete_self on public.blocks;
create policy blocks_delete_self on public.blocks
  for delete using (
    (select auth_uid from public.profiles where id = blocker_id) = auth.uid()
  );

-- ─────────────────────────────────────────────────────────────────────
-- user_schedules
-- ─────────────────────────────────────────────────────────────────────
drop policy if exists user_schedules_select_any on public.user_schedules;
create policy user_schedules_select_any on public.user_schedules
  for select using (true);

drop policy if exists user_schedules_insert_any on public.user_schedules;
drop policy if exists user_schedules_insert_self on public.user_schedules;
create policy user_schedules_insert_self on public.user_schedules
  for insert with check (
    (select auth_uid from public.profiles where id = profile_id) = auth.uid()
  );

drop policy if exists user_schedules_update_any on public.user_schedules;
drop policy if exists user_schedules_update_self on public.user_schedules;
create policy user_schedules_update_self on public.user_schedules
  for update
    using (
      (select auth_uid from public.profiles where id = profile_id) = auth.uid()
    )
    with check (
      (select auth_uid from public.profiles where id = profile_id) = auth.uid()
    );

drop policy if exists user_schedules_delete_any on public.user_schedules;
drop policy if exists user_schedules_delete_self on public.user_schedules;
create policy user_schedules_delete_self on public.user_schedules
  for delete using (
    (select auth_uid from public.profiles where id = profile_id) = auth.uid()
  );

-- ─────────────────────────────────────────────────────────────────────
-- notifications — insert는 (true) 유지(dispatchMessageTo other 적재), 본인 행 update/delete만
-- ─────────────────────────────────────────────────────────────────────
drop policy if exists notifications_select_any on public.notifications;
create policy notifications_select_any on public.notifications
  for select using (true);

drop policy if exists notifications_insert_any on public.notifications;
create policy notifications_insert_any on public.notifications
  for insert with check (true);

drop policy if exists notifications_update_self on public.notifications;
create policy notifications_update_self on public.notifications
  for update using (
    user_code in (select id from public.profiles where auth_uid = auth.uid())
  );

drop policy if exists notifications_delete_self on public.notifications;
create policy notifications_delete_self on public.notifications
  for delete using (
    user_code in (select id from public.profiles where auth_uid = auth.uid())
  );
