-- Pool's day v1 — 가입 닉네임 중복 방지용 전용 레지스트리.
-- 프로필 본체는 아직 클라이언트 로컬(AsyncStorage). 여기엔 '선점된 닉네임'만 보관해서
-- ProfileSetup 입력 중 중복 여부를 조회하고, 가입 완료 시 닉네임을 선점(insert)한다.

create table if not exists public.profile_nicknames (
  nickname    text primary key,
  created_at  timestamptz not null default now()
);

alter table public.profile_nicknames enable row level security;

-- 가입 전(미인증/anon)에도 닉네임 중복 여부를 조회할 수 있어야 함.
-- 닉네임은 공개 표시명이라 존재 여부 노출은 허용 범위 (이메일 등 민감정보 아님).
drop policy if exists profile_nicknames_select_any on public.profile_nicknames;
create policy profile_nicknames_select_any on public.profile_nicknames
  for select using (true);

-- 가입 완료 시 닉네임 선점. mock auth 단계라 anon insert 허용.
-- (실인증 연동 후엔 with check (auth.uid() is not null) 등으로 강화 예정.)
-- PK(nickname) 제약이 동시성 상황의 최종 방어선 — 중복 insert는 충돌로 거부됨.
drop policy if exists profile_nicknames_insert_any on public.profile_nicknames;
create policy profile_nicknames_insert_any on public.profile_nicknames
  for insert with check (true);
