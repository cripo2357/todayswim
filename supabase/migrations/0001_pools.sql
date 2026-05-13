-- Pool's Day v1 — pools 테이블 스키마.
-- 풀(수영장) 정보 저장. 일반 사용자는 read-only, write는 service_role만 (관리자/시드).
-- 컬럼명은 Postgres 컨벤션에 따라 snake_case — 클라이언트 hook에서 camelCase로 매핑.

create table if not exists public.pools (
  id           text primary key,                         -- "POOL_SEOUL_0001"
  name         text not null,
  region       text not null,                            -- '서울', '부산' 등 (TS Region 타입과 일치)
  district     text not null,                            -- '송파구', '관악구 행운동' 등
  address      text not null,
  lat          double precision not null,
  lng          double precision not null,
  type         text not null check (type in ('indoor', 'outdoor', 'both')),
  ownership    text not null check (ownership in ('public', 'private')),
  phone        text,
  website      text,
  lane_count   integer,
  pool_length  integer,                                  -- 25, 50 (m)
  depth_min    numeric(3, 1),                            -- 1.2 (m)
  depth_max    numeric(3, 1),
  facilities   text[] default '{}',                      -- ['샤워실', '주차장', ...]
  has_schedule boolean default false,                    -- 스케줄 등록 여부 (denormalized)
  price_per_session integer,                             -- 1회 자유수영 가격 (KRW)
  photo_url    text,                                     -- Storage URL or external
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- 지역별 필터 빈번 → region 인덱스
create index if not exists pools_region_idx on public.pools (region);
-- 위치 기반 쿼리 (현재 viewport 안의 풀만 fetch) 위한 lat/lng 복합 인덱스
create index if not exists pools_lat_lng_idx on public.pools (lat, lng);

-- updated_at 자동 갱신 트리거
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists pools_set_updated_at on public.pools;
create trigger pools_set_updated_at
  before update on public.pools
  for each row execute function public.set_updated_at();

-- RLS — 모두에게 read 허용, write는 service_role만 (정책 X = anon/authenticated 차단)
alter table public.pools enable row level security;

drop policy if exists pools_read_all on public.pools;
create policy pools_read_all on public.pools
  for select using (true);
