-- Pool's Day v1 — 가격을 평일/주말 분리 저장 (성인 1회 기준, 쉼표 없는 정수).
-- 기존 price_per_session(단일)는 레거시로 유지 — 클라이언트는 price_weekday 우선,
--   없으면 price_per_session으로 평일가 폴백(0012 샘플풀 표시 깨지지 않게).
-- 값 출처: cbswim webflow (사용자 확인).
--   관악구민종합체육센터: 평일 3,400 / 주말 4,400
--   사당문화회관:        평일 4,400 / 주말 5,700

alter table public.pools
  add column if not exists price_weekday integer,
  add column if not exists price_weekend integer;

-- 0021/0024가 이미 적용됐고 INSERT는 ON CONFLICT DO NOTHING → UPDATE로 반영.
update public.pools set price_weekday = 3400, price_weekend = 4400
  where id = 'POOL_SEOUL_0005';
update public.pools set price_weekday = 4400, price_weekend = 5700
  where id = 'POOL_SEOUL_0006';
