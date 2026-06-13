-- 수영 일기 — 작성된 수영 일정에 1:1. 입력값만 저장(거리·kcal·음식은 표시 때 엔진 재계산).
-- schedule_id = user_schedules.id(클라 생성 text) 참조하되 FK 미검(일정은 best-effort 동기라
-- 서버에 없을 수 있음 — schedule_invites와 동일 정책). pool_id만 FK + 캐시.
-- visibility: 나만(private)/친구(friends)/모두(public) — 게시판(후속) 조회 기준. 지금은 소유자만 조회.

create table if not exists public.swim_diaries (
  id           uuid        primary key default gen_random_uuid(),
  profile_id   text        not null references public.profiles(id)
                             on update cascade on delete cascade,
  schedule_id  text        not null,              -- user_schedules.id (FK 미검: best-effort)
  pool_id      text        references public.pools(id) on delete set null,
  pool_name    text        not null,              -- 캐시
  date         text        not null,              -- YYYY-MM-DD
  start_time   text        not null,              -- HH:MM (실제 수영 시작)
  end_time     text        not null,              -- HH:MM (실제 수영 종료)
  lane_length  smallint    not null,              -- 25 | 50 (m)
  reps         jsonb       not null default '{}', -- {"자유형":n,"배영":n,"접영":n,"평형":n,"기타":n}
  note         text,                              -- 수영 노트(최대 300자)
  visibility   text        not null default 'private'
                             check (visibility in ('private','friends','public')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- 일정당 일기 1건(소유자 기준).
create unique index if not exists swim_diaries_schedule_uniq
  on public.swim_diaries (profile_id, schedule_id);
-- 내 일기 날짜 조회.
create index if not exists swim_diaries_profile_date_idx
  on public.swim_diaries (profile_id, date);

-- RLS — 소유자 본인 CRUD. (친구/모두 공유 조회는 게시판 기능에서 후속.)
alter table public.swim_diaries enable row level security;

drop policy if exists swim_diaries_select_own on public.swim_diaries;
create policy swim_diaries_select_own on public.swim_diaries
  for select using (
    (select auth_uid from public.profiles where id = profile_id) = auth.uid()
  );
drop policy if exists swim_diaries_insert_own on public.swim_diaries;
create policy swim_diaries_insert_own on public.swim_diaries
  for insert with check (
    (select auth_uid from public.profiles where id = profile_id) = auth.uid()
  );
drop policy if exists swim_diaries_update_own on public.swim_diaries;
create policy swim_diaries_update_own on public.swim_diaries
  for update using (
    (select auth_uid from public.profiles where id = profile_id) = auth.uid()
  ) with check (
    (select auth_uid from public.profiles where id = profile_id) = auth.uid()
  );
drop policy if exists swim_diaries_delete_own on public.swim_diaries;
create policy swim_diaries_delete_own on public.swim_diaries
  for delete using (
    (select auth_uid from public.profiles where id = profile_id) = auth.uid()
  );