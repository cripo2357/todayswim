-- Pool's day — 금천구민문화체육센터(POOL_0017) 규격 보강.
-- 운영자(크리스) 제공: 레인 길이 25m, 레인 6개.
-- (0094 등록 시 pool_length가 NULL이었음. lane_count는 이미 6으로 일치.)

update public.pools
set lane_count = 6,
    pool_length = 25
where id = 'POOL_0017';
