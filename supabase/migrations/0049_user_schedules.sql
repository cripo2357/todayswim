-- Pool's day — Phase 2 네 번째 배치: 사용자 수영 일정 테이블.
--
-- MySwimSchedule(내 일정) + OtherSchedule(친구·타인 일정)을 같은 테이블에
-- profile_id 소유자로 구분해서 통합 저장. 가시성(visibility)으로 노출 제어:
-- private(나만) / friends(나+친구+초대) / public(다른사람 설정에 따라).
--
-- ## 설계 결정
--
-- 1) **`id text` PK, 클라가 생성**. P1 mock은 `sch-${Date.now()}` 형식 —
--    text로 두면 형식 자유. 서버 발급 uuid면 클라가 응답 받아 로컬 id 교체하는
--    비대칭이 생김(mutation 복잡). text + 클라 생성이 단순.
--
-- 2) **`pool_id` = nullable + `references pools(id) on delete set null`**.
--    풀이 운영자에 의해 삭제돼도 일정은 살아남고 표시는 캐시(pool_name)로.
--    pool_name은 NOT NULL — 풀 fetch 없이 일정 표시 가능.
--
-- 3) **`profile_id` = NOT NULL + `on update cascade on delete cascade`**.
--    친구코드 변경(profiles.id UPDATE) 시 자식 자동 갱신. 사용자 탈퇴 시
--    일정 자동 정리.
--
-- 4) **`visibility` enum text** — private/friends/public. participants 가시성
--    정책 [[participant_visibility_policy]]와 일치.
--
-- 5) **RLS = P1 톤** (`(true)`). 실 auth 진입 시:
--    - select: 가시성 + 친구관계 기반 (profiles+friendships 조인) → P3 하드닝.
--    - insert/update/delete: `profile_id = auth.uid()` 매핑 본인 행만.
--
-- 6) **인덱스**: `(profile_id, date)` 내 일정 조회 / `(date, pool_id)` 슬롯
--    참여자 조회 / `(profile_id, visibility)` 친구탭 일정 노출.

create table if not exists public.user_schedules (
  id              text        primary key,
  profile_id      text        not null references public.profiles(id)
                                on update cascade on delete cascade,
  pool_id         text        references public.pools(id) on delete set null,
  pool_name       text        not null,                 -- 캐시(풀 삭제 보호)
  pool_photo_url  text,                                  -- 캐시
  date            text        not null,                  -- YYYY-MM-DD
  start_time      text        not null,                  -- HH:MM (24h)
  end_time        text        not null,                  -- HH:MM (24h)
  visibility      text        not null default 'private'
                                check (visibility in ('private', 'friends', 'public')),
  completed       boolean     not null default false,
  created_at      timestamptz not null default now()
);

-- 내 일정 조회(날짜 정렬) — CalendarTab/MyInfo
create index if not exists user_schedules_profile_date_idx
  on public.user_schedules (profile_id, date);

-- 슬롯 참여자 조회(특정 풀+날짜) — scheduleParticipants
create index if not exists user_schedules_pool_date_idx
  on public.user_schedules (pool_id, date);

-- 가시성 필터링(친구탭 일정 노출 등)
create index if not exists user_schedules_profile_visibility_idx
  on public.user_schedules (profile_id, visibility);

-- RLS — P1 톤
alter table public.user_schedules enable row level security;

drop policy if exists user_schedules_select_any on public.user_schedules;
create policy user_schedules_select_any on public.user_schedules
  for select using (true);

drop policy if exists user_schedules_insert_any on public.user_schedules;
create policy user_schedules_insert_any on public.user_schedules
  for insert with check (true);

drop policy if exists user_schedules_update_any on public.user_schedules;
create policy user_schedules_update_any on public.user_schedules
  for update using (true) with check (true);

drop policy if exists user_schedules_delete_any on public.user_schedules;
create policy user_schedules_delete_any on public.user_schedules
  for delete using (true);
