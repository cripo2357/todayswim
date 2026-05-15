-- Pool's Day v1 — pools 분류 flag 3개 추가.
-- 카드(Figma 93:10597)에서 cyan 칩으로 노출되는 1차 분류:
--   - has_kids_pool: 유아풀 보유
--   - has_diving_pool: 다이빙풀 보유
--   - is_hotel_pool: 호텔 부속 수영장
-- 기존 facilities text[]는 세부 시설(샤워실/주차장/사물함 등)로 유지.
-- 호텔 풀은 마커도 별도(marker-hotel.png) — MapScreen이 is_hotel_pool 우선 분기.

alter table public.pools
  add column if not exists has_kids_pool boolean not null default false,
  add column if not exists has_diving_pool boolean not null default false,
  add column if not exists is_hotel_pool boolean not null default false;

-- 인덱스 — 호텔 마커 분기와 칩 필터에서 자주 조회됨.
create index if not exists pools_is_hotel_pool_idx on public.pools (is_hotel_pool) where is_hotel_pool;
create index if not exists pools_has_kids_pool_idx on public.pools (has_kids_pool) where has_kids_pool;
create index if not exists pools_has_diving_pool_idx on public.pools (has_diving_pool) where has_diving_pool;
