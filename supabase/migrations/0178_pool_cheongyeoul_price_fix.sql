-- Pool's day — 은평청여울수영장(POOL_0079) 주말 요금 정정.
-- 추가 확인(25m.kr/이오미터, 02-386-7330): 평일 성인4000 / 주말 성인5000 (은평 공공 공통 패턴).
-- 0079 등록 시 주말도 4000으로 넣었으나 주말은 5000 → price_weekend 정정.
update public.pools set price_weekend = 5000 where id = 'POOL_0079';
