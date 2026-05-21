-- Pool's day — P3-C2/C3 RLS·Storage 최종 하드닝 (0060 후속).
--
-- 0060 (P2 마무리) 가 profiles/friend_requests/friendships/blocks/
-- user_schedules/notifications 의 write 정책을 본인 검증으로 잠궜다.
-- 출시 직전 P3 에서 남은 두 영역을 마저 잠근다:
--
--   1) notifications.select_any → **본인 행만**
--      (user_code = profiles.id where auth_uid = auth.uid())
--   2) avatars Storage 개방 정책 → **본인 폴더만** (0020 원형 복원)
--
-- ⚠️ notifications.insert_any 는 의도적으로 유지.
--    dispatchMessageTo(상대 user_code 로 알림 적재) 패턴이 RPC 로
--    리팩토링되기 전까지 insert 를 본인 행으로 잠그면 알림 발송 자체가
--    깨짐. P3 후속: dispatchMessageTo → security_definer RPC 함수 +
--    insert 정책 좁히기.
--
-- ⚠️ Apple TEST MODE 사용자는 auth.uid 가 없어 본 정책 하에서 알림 fetch /
--    아바타 업로드 불가. NotificationsTab 은 0 rows → mock 갤러리 폴백.
--    실 출시 후엔 Apple TEST MODE 자체를 비활성화 + 정식 Apple 로그인 전환.

-- ─────────────────────────────────────────────────────────────────────
-- 1) notifications.select — 본인 행만
-- ─────────────────────────────────────────────────────────────────────
drop policy if exists notifications_select_any on public.notifications;
drop policy if exists notifications_select_own on public.notifications;
create policy notifications_select_own on public.notifications
  for select using (
    user_code in (select id from public.profiles where auth_uid = auth.uid())
  );

-- ─────────────────────────────────────────────────────────────────────
-- 2) avatars Storage — 본인 폴더만 (0020 원형 복원, 0045 개방 폐기)
--
-- 경로 규약: '{auth.uid()}/avatar.jpg' + '{auth.uid()}/avatar_thumb.jpg'
-- (storage.foldername(name))[1] = auth.uid()::text 매칭으로 본인 폴더 검증.
-- ─────────────────────────────────────────────────────────────────────
drop policy if exists "avatars p1 open insert" on storage.objects;
drop policy if exists "avatars p1 open update" on storage.objects;
drop policy if exists "avatars p1 open delete" on storage.objects;
drop policy if exists "avatar owner insert" on storage.objects;
drop policy if exists "avatar owner update" on storage.objects;
drop policy if exists "avatar owner delete" on storage.objects;

create policy "avatar owner insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatar owner update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatar owner delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
