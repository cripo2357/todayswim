-- Pool's day — 구로구민체육센터(POOL_0022, 고척근린공원 내) 규격 보강.
-- 운영자(크리스) 제공: 성인풀 25m × 7레인, 수심 1.2~1.5m, 유아풀 수심 0.9m.
-- (0099 등록 시 pool_length·depth가 NULL이었음. lane_count=7·has_kids_pool=true는 기존 일치.)

update public.pools
set pool_length = 25,
    depth_min = 1.2,
    depth_max = 1.5
where id = 'POOL_0022';
