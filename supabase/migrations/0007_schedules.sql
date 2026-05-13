-- Pool's Day v1 — schedules 테이블 (자유수영 시간표 게시본).
-- 풀당 1행 (최신 승인본). 사용자 제출은 schedule_submissions에서 관리되고, 운영자가 승인 시 여기에 INSERT/UPDATE.
-- by_day는 JSONB — TS 타입 Schedule.byDay와 1:1 매칭 ({ '월': [{start, end, hours?}, ...], ... }).

create table if not exists public.schedules (
  pool_id          text primary key references public.pools(id) on delete cascade,
  author_nickname  text not null,
  by_day           jsonb not null default '{}'::jsonb,
  updated_at       timestamptz not null default now(),
  approved_at      timestamptz default now()
);

-- updated_at 자동 갱신 (pools와 동일 트리거 함수 재사용)
drop trigger if exists schedules_set_updated_at on public.schedules;
create trigger schedules_set_updated_at
  before update on public.schedules
  for each row execute function public.set_updated_at();

alter table public.schedules enable row level security;

drop policy if exists schedules_read_all on public.schedules;
create policy schedules_read_all on public.schedules
  for select using (true);

-- 시드 데이터 — src/data/dummyPools.ts의 dummySchedules 그대로 이관.
-- 운영자는 Dashboard에서 직접 INSERT/UPDATE/DELETE.
insert into public.schedules (pool_id, author_nickname, by_day, updated_at) values
  ('POOL_SEOUL_0002', '수영맨', $$
    {
      "월": [{"start":"06:00","end":"08:00","hours":2}, {"start":"20:00","end":"21:30","hours":1.5}],
      "화": [{"start":"06:00","end":"08:00","hours":2}],
      "수": [{"start":"06:00","end":"08:00","hours":2}, {"start":"12:00","end":"13:30","hours":1.5}],
      "목": [{"start":"06:00","end":"08:00","hours":2}],
      "금": [{"start":"06:00","end":"08:00","hours":2}],
      "토": [{"start":"08:00","end":"12:00","hours":4}],
      "일": [{"start":"08:00","end":"12:00","hours":4}]
    }
  $$::jsonb, '2026-10-31'::timestamptz),
  ('POOL_SEOUL_0001', '풀러', $$
    {
      "월": [{"start":"05:30","end":"07:30","hours":2}, {"start":"21:00","end":"22:00","hours":1}],
      "화": [{"start":"05:30","end":"07:30","hours":2}],
      "수": [{"start":"05:30","end":"07:30","hours":2}],
      "토": [{"start":"08:00","end":"11:00","hours":3}],
      "일": [{"start":"08:00","end":"11:00","hours":3}]
    }
  $$::jsonb, '2026-11-02'::timestamptz)
on conflict (pool_id) do nothing;

-- pools.has_schedule 자동 동기화 (해당 풀에 시간표 있으면 true)
update public.pools
set has_schedule = true
where id in (select pool_id from public.schedules);
