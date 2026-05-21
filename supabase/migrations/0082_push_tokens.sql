-- Pool's day — OS 푸시 토큰 저장 (P3-A4, 2026-05-21).
--
-- 클라이언트가 expo-notifications.getExpoPushTokenAsync() 로 받은
-- 'ExponentPushToken[...]' 문자열을 사용자별로 보관. Edge Function
-- 'send-push' 가 발송 대상 user_id 로 lookup 해 Expo Push API 호출.
--
-- 디바이스 1대 = 1 row (expo_token unique). 같은 사용자가 여러 기기 사용
-- 가능 → unique key 는 expo_token 만. 기존 토큰 재등록(앱 재설치 등) 은
-- UPSERT 로 updated_at 갱신.
--
-- 죽은 토큰 정리: Expo API 가 'DeviceNotRegistered' 반환하면 Edge Function
-- 이 해당 row 삭제. 별도 cron 불필요.
--
-- RLS:
--   - INSERT/UPDATE/DELETE: 본인 토큰만 (auth.uid() = user_id)
--   - SELECT: 본인 토큰만 (디버깅용 — 운영자는 service_role)

create table if not exists public.push_tokens (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  expo_token   text not null unique,
  -- 'ios' | 'android' | 'web' (현 단계는 ios/android)
  platform     text not null check (platform in ('ios', 'android', 'web')),
  -- 선택 — 디바이스 식별 라벨 (예: 'iPhone 15 Pro'). 사용자 다기기 관리 UI 용도.
  device_label text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists push_tokens_user_idx
  on public.push_tokens (user_id, updated_at desc);

-- updated_at 자동 갱신 트리거.
create or replace function public.push_tokens_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_push_tokens_updated_at on public.push_tokens;
create trigger trg_push_tokens_updated_at
  before update on public.push_tokens
  for each row execute function public.push_tokens_set_updated_at();

alter table public.push_tokens enable row level security;

drop policy if exists push_tokens_select_own on public.push_tokens;
create policy push_tokens_select_own on public.push_tokens
  for select using (user_id = auth.uid());

drop policy if exists push_tokens_insert_own on public.push_tokens;
create policy push_tokens_insert_own on public.push_tokens
  for insert with check (user_id = auth.uid());

drop policy if exists push_tokens_update_own on public.push_tokens;
create policy push_tokens_update_own on public.push_tokens
  for update
    using (user_id = auth.uid())
    with check (user_id = auth.uid());

drop policy if exists push_tokens_delete_own on public.push_tokens;
create policy push_tokens_delete_own on public.push_tokens
  for delete using (user_id = auth.uid());
