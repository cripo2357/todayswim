-- Pool's day — 언남문화체육센터(POOL_0036) 규격 보강.
-- 운영자(크리스) 제공: 25m × 6레인.
-- (0120 등록 시 성인풀 레인·길이가 NULL이었음. 유아풀(has_kids_pool=true)은 기존 유지.)

update public.pools
set lane_count = 6,
    pool_length = 25
where id = 'POOL_0036';
