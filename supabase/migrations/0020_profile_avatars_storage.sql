-- 프로필 아바타 Storage — 가입/내 정보에서 올린 프로필 사진 영구 보관.
--
-- 버킷 'avatars' (public read): 아바타는 지도 마커·사람들 탭에서 타 유저에게 공개.
-- 경로 규약: '{auth.uid()}/avatar.jpg' 고정 + upsert → 유저당 1파일(덮어쓰기),
--           orphan/누적 없음, 청소 로직 불필요.
-- 쓰기/수정/삭제는 본인 폴더에만 (RLS, auth.uid 기준). read는 public 버킷이라
-- 공개 URL fetch에 별도 SELECT 정책 불필요.

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

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
  );

create policy "avatar owner delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
