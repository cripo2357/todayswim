-- Pool's day — 가격 모델 확장. 토/일 개별 일일가 + 회차권(쿠폰) 가격 컬럼 추가.
-- 배경(크리스 결정 2026-06-06): day_note에 새던 요금을 카드 가격영역으로 구조화.
--   · 토≠일 가격(서울숲 토4,000/일7,000) → price_per_sat / price_per_sun (없으면 price_weekend 폴백)
--   · 쿠폰/회차권(불광·홍제 10매 8만원, 단발권 없음) → price_per_time(금액) + price_per_time_count(횟수) = "80000원(10회)"
alter table public.pools add column if not exists price_per_sat integer;
alter table public.pools add column if not exists price_per_sun integer;
alter table public.pools add column if not exists price_per_time integer;
alter table public.pools add column if not exists price_per_time_count integer;
comment on column public.pools.price_per_sat is '토요일 일일 성인가(KRW). 일요일과 다를 때만. 없으면 price_weekend 폴백.';
comment on column public.pools.price_per_sun is '일요일 일일 성인가(KRW). 토요일과 다를 때만. 없으면 price_weekend 폴백.';
comment on column public.pools.price_per_time is '회차권/쿠폰 총액(KRW). 단발 일일권 없는 쿠폰제 풀. 표시 "OO원(N회)".';
comment on column public.pools.price_per_time_count is '회차권 횟수(N). price_per_time과 한 쌍.';
