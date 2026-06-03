-- Pool's day — 서초구민체육센터(POOL_0037) 규격 보강.
-- 운영자(크리스) 제공: 25m × 6레인, 수심 1.2~1.5m, 유아풀 있음.
-- (0121 등록 시 공식 자유이용 페이지에 규격 미기재로 NULL/false였던 항목 채움.)

update public.pools
set lane_count = 6,
    pool_length = 25,
    depth_min = 1.2,
    depth_max = 1.5,
    has_kids_pool = true
where id = 'POOL_0037';
