-- Pool's day — 50플러스수영장(POOL_0024, 구로구 천왕역) 규격 보강.
-- 운영자(크리스) 제공: 25m × 6레인, 수심 1.3m.
-- (0101 등록 시 레인·길이·수심이 NULL이었음.)

update public.pools
set lane_count = 6,
    pool_length = 25,
    depth_min = 1.3,
    depth_max = 1.3
where id = 'POOL_0024';
