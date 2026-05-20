-- Pool's day v1 — 메시지(알림) 발송 이력.
--
-- 발송 Rule은 코드 레지스트리(src/lib/messages/rules.ts)에서 관리하고,
-- 액션 발생 시 클라이언트(dispatchMessage)가 이 테이블에 직접 insert 한다.
-- 프로필 본체가 아직 로컬(AsyncStorage)이라 수신자 식별은
-- 친구 추가용 계정 ID(profile.id) = user_code 로 한다.
--
-- Phase 1 한계: 지금은 "그 액션을 한 로컬 사용자 본인"의 이력 행만 적재된다
-- (상대방에게 가는 행은 실 인증/서버 사이드 디스패치 = Phase 2).
--
-- RLS (mock-auth 단계 — submissions/profile_nicknames 와 동일 톤):
--   - INSERT: anon/authenticated 모두 허용 (사용자 클라이언트가 적재)
--   - SELECT: user_code 를 알면 누구나 (민감정보 미저장 — title/본문 텍스트만).
--     실 Supabase Auth(auth.uid) 연동 후 본인 행만 보도록 강화 예정.

create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_code   text not null,                          -- 수신자 = profile.id(친구 코드)
  kind        text not null,                          -- MessageKind (rules.ts)
  title       text not null,
  body        jsonb not null default '[]'::jsonb,     -- 본문 줄 배열 string[]
  params      jsonb not null default '{}'::jsonb,     -- 템플릿 파라미터 원본
  actions     jsonb not null default '[]'::jsonb,     -- 표시용 액션 ['거절','수락'...]
  related     jsonb not null default '{}'::jsonb,     -- poolId/date 등 부가 정보
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists notifications_user_code_idx
  on public.notifications (user_code, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists notifications_select_any on public.notifications;
create policy notifications_select_any on public.notifications
  for select using (true);

drop policy if exists notifications_insert_any on public.notifications;
create policy notifications_insert_any on public.notifications
  for insert with check (true);
