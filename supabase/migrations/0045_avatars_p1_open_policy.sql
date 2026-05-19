-- Pool's Day — 아바타 Storage 정책 P1 개방형 전환 (0020 재정의).
--
-- 배경: 0020은 avatars 버킷 쓰기를 본인 폴더 한정(`to authenticated`,
--   `(storage.foldername(name))[1] = auth.uid()::text`)으로 잠갔다. 그러나
--   현행(P1)은 실 인증 기반이 아직 불완전 — 신규 Supabase 프로젝트의
--   storage-api가 user JWT 를 authenticated 로 못 잡고 anon 으로 처리해
--   `to authenticated` 정책이 항상 거부(new row violates RLS). 결과적으로
--   아바타 업로드가 단 한 번도 동작한 적 없음(뭄바이엔 버킷 자체가 없었음).
--
-- 결정: 이 앱의 다른 모든 P1 쓰기 정책(pool_submissions / schedule_
--   submissions / profile_nicknames / notifications)이 이미 개방형
--   (`with check(true)`)이다. avatars 만 유독 엄격해 인증 갭에 걸리므로,
--   동일한 P1 개방형 posture 로 맞춘다 — 단 **avatars 버킷으로 한정**
--   (다른 버킷·테이블에는 영향 0). public read 는 public 버킷이라 그대로.
--
-- ⚠️ P3 하드닝 항목: 실 인증/JWT 정리(project_phases P3) 시 본인 폴더
--   소유자 정책으로 재하드닝 — 0020 원형(`to authenticated` +
--   auth.uid()=폴더)으로 복원. memory: avatar_upload_preexisting_bug.

-- 구(엄격) 정책 제거 (멱등).
drop policy if exists "avatar owner insert" on storage.objects;
drop policy if exists "avatar owner update" on storage.objects;
drop policy if exists "avatar owner delete" on storage.objects;
-- 재실행 멱등 — 신 정책도 먼저 제거.
drop policy if exists "avatars p1 open insert" on storage.objects;
drop policy if exists "avatars p1 open update" on storage.objects;
drop policy if exists "avatars p1 open delete" on storage.objects;

-- P1 개방형: avatars 버킷 한정 insert/update/delete (role 제한 없음 →
-- storage-api 가 anon/authenticated 무엇으로 잡든 통과). 버킷 스코프라
-- pool-photos 등 타 버킷은 정책 없음 = 운영자(service_role)만.
create policy "avatars p1 open insert" on storage.objects
  for insert with check (bucket_id = 'avatars');

create policy "avatars p1 open update" on storage.objects
  for update using (bucket_id = 'avatars')
  with check (bucket_id = 'avatars');

create policy "avatars p1 open delete" on storage.objects
  for delete using (bucket_id = 'avatars');
