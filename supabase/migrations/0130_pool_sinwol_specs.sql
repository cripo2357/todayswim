-- Pool's day — 신월문화체육센터(POOL_0020, 양천구) 규격 보강.
-- 운영자(크리스) 제공: 성인풀 25m × 4레인, 수심 1.2~1.5m, 유아풀 수심 0.57m.
-- (0097 등록 시 depth가 NULL이었음. lane_count=4·pool_length=25·has_kids_pool=true는 기존 일치.)

update public.pools
set depth_min = 1.2,
    depth_max = 1.5
where id = 'POOL_0020';
