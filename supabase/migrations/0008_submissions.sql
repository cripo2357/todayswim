-- Pool's day v1 — 사용자 제출(submissions) 테이블 2종.
-- (a) schedule_submissions: 시간표 작성/수정 요청
-- (b) pool_submissions: 수영장 추가/수정 요청
--
-- 둘 다 RLS:
--   - INSERT: anon/authenticated 모두 허용 (사용자가 제출)
--   - SELECT: 운영자만 (Phase 1엔 v0 권한 모델 없으므로 select는 기본 차단)
-- 운영자는 Supabase Dashboard에서 service_role로 직접 조회/검수.

-- ===== (a) schedule_submissions =====
create table if not exists public.schedule_submissions (
  id              uuid primary key default gen_random_uuid(),
  pool_id         text not null references public.pools(id) on delete cascade,
  nickname        text,                                                          -- NULL = 익명 (ANON_NICKNAME)
  by_day          jsonb not null,                                                -- Schedule.byDay 형태
  status          text not null default 'pending'
                    check (status in ('pending', 'approved', 'rejected')),
  submitter_note  text,                                                          -- 추후 사용자 메모용 옵션
  reviewed_at     timestamptz,
  reviewed_by     text,
  submitted_at    timestamptz not null default now()
);

create index if not exists schedule_submissions_pool_id_idx
  on public.schedule_submissions (pool_id);
create index if not exists schedule_submissions_status_idx
  on public.schedule_submissions (status, submitted_at desc);

alter table public.schedule_submissions enable row level security;

drop policy if exists schedule_submissions_insert_any on public.schedule_submissions;
create policy schedule_submissions_insert_any on public.schedule_submissions
  for insert with check (true);


-- ===== (b) pool_submissions =====
create table if not exists public.pool_submissions (
  id                 uuid primary key default gen_random_uuid(),
  mode               text not null check (mode in ('create', 'edit')),
  pool_id            text references public.pools(id),                           -- edit일 때만 존재
  pool_name          text not null,                                              -- 사용자가 입력한 풀 이름
  description        text,                                                       -- create: 추가 정보 / edit: 수정 요청 본문
  submitter_contact  text,                                                       -- 옵션 — 이메일/연락처
  status             text not null default 'pending'
                       check (status in ('pending', 'approved', 'rejected')),
  reviewed_at        timestamptz,
  reviewed_by        text,
  submitted_at       timestamptz not null default now()
);

create index if not exists pool_submissions_status_idx
  on public.pool_submissions (status, submitted_at desc);

alter table public.pool_submissions enable row level security;

drop policy if exists pool_submissions_insert_any on public.pool_submissions;
create policy pool_submissions_insert_any on public.pool_submissions
  for insert with check (true);
