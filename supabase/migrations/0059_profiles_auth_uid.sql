-- Pool's day — Phase 2: profiles.auth_uid 컬럼 추가 (auth.uid ↔ profile binding).
--
-- ## 배경
--
-- P2 첫 배치(0047)에서 profiles.id = 친구코드(6자리 text)로 PK 정착. auth.users.id
-- (uuid)는 별도 — 클라이언트가 OAuth로 세션 받았을 때 본인 profile을 찾는 방법이
-- 없었음. 그래서 기존 가입자가 다시 로그인해도 항상 ProfileSetup으로 가는 회귀.
--
-- ## 결정
--
-- `auth_uid uuid unique references auth.users(id) on delete cascade` 컬럼 추가.
-- - **nullable**: mock 친구 시드 row들은 auth.uid 없음(서버 가입 안 함). 실 가입자만 채움.
-- - **unique**: 한 auth.uid가 두 profile에 매핑되면 안 됨(SSO 1계정 = 1프로필).
-- - **on delete cascade**: auth.users 삭제(탈퇴) 시 본인 profile 자동 정리.
-- - **PK(=친구코드)는 그대로** — 친구 사이 공유·표시는 친구코드, 내부 매핑은 auth_uid.
--
-- ## 클라이언트 흐름 (코드 변경분과 묶음)
--
-- 1. 가입 완료 시 useProfile.save → tryUpsertProfile → 현 세션 auth.uid 자동 포함.
-- 2. 재로그인/앱 시작 시 hydrate → tryFetchProfileByAuthUid(auth.uid) → 있으면
--    useProfile.setState 즉시 → MapMain으로. 없으면 ProfileSetup(신규 가입).

alter table public.profiles
  add column if not exists auth_uid uuid unique
    references auth.users(id) on delete cascade;

comment on column public.profiles.auth_uid is
  'auth.users.id 매핑(SSO 1계정 = 1프로필). 실 가입자만 채워지고 mock 시드는 null.';

create index if not exists profiles_auth_uid_idx
  on public.profiles (auth_uid);
