-- Pool's day — 아바타 Storage RLS 최종 정정: upsert(덮어쓰기)용 SELECT 정책 추가.
--
-- ■ 증상: prod 안드로이드 앱에서 프로필 사진을 바꿔도 avatars 버킷에 파일이
--   안 올라감. API 재현 시 'new row violates row-level security policy'.
--
-- ■ 근본 원인(라이브 검증으로 확정, 2026-06-05):
--   앱은 아바타를 `{auth.uid()}/avatar.jpg` 고정 경로에 **upsert(x-upsert)** 로
--   올린다. upsert = `INSERT ... ON CONFLICT DO UPDATE` 라서 Postgres가 기존
--   행을 **SELECT 로 조회**해야 하는데, storage.objects 에 SELECT RLS 정책이
--   하나도 없어(0020 은 insert/update/delete 만 생성) 그 조회가 막혀 업로드
--   전체가 실패했다. 에러 메시지가 인증 문제처럼 보였을 뿐 실제는 SELECT 누락.
--   (공개 읽기는 public 버킷 CDN 경로라 SELECT 정책 없이도 정상이었음.)
--
--   ※ storage 의 JWT 인증 자체는 정상으로 확인됨 — 인증 유저는 본인 폴더
--     업로드 OK, 타 폴더/anon 은 거부. 따라서 0045 의 "개방형 전환" 가설은
--     폐기하고 owner-scoped(본인 폴더 한정)를 유지한다.
--
-- ■ 조치: 개방/디버그 정책을 모두 제거하고, owner insert/update/delete 를
--   재보장한 뒤 **누락됐던 owner SELECT 정책을 추가**한다. (멱등)
--   public read 는 public 버킷이라 별도 SELECT 정책 불필요(본 SELECT 는
--   upsert 의 ON CONFLICT 조회 + 본인 아바타 조회용).

-- 1) 개방형/디버그 정책 정리 (0045 잔재 + 진단 중 추가분, 멱등).
drop policy if exists "avatars p1 open insert" on storage.objects;
drop policy if exists "avatars p1 open update" on storage.objects;
drop policy if exists "avatars p1 open delete" on storage.objects;
drop policy if exists "avatars debug open insert" on storage.objects;
drop policy if exists "avatars debug open update" on storage.objects;
drop policy if exists "avatars debug open delete" on storage.objects;
drop policy if exists "avatars debug open select" on storage.objects;

-- 2) owner insert/update/delete 재보장 (0020 과 동일 정의, 멱등 재생성).
drop policy if exists "avatar owner insert" on storage.objects;
create policy "avatar owner insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatar owner update" on storage.objects;
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

drop policy if exists "avatar owner delete" on storage.objects;
create policy "avatar owner delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 3) ★ 누락됐던 SELECT 정책 — upsert 의 ON CONFLICT 조회 + 본인 아바타 조회.
drop policy if exists "avatar owner select" on storage.objects;
create policy "avatar owner select" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
