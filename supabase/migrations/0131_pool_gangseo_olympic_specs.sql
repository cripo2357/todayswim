-- Pool's day — 강서구민올림픽체육센터(POOL_0025) 규격 보강.
-- 운영자(크리스) 제공: 성인풀 25m × 7레인, 수심 1.2~1.5m(경사형), 유아풀 수심 0.6m.
-- (0102 등록 시 pool_length가 NULL이었음. lane_count=7·depth 1.2~1.5는 기존 일치. 유아풀 반영.)

update public.pools
set pool_length = 25,
    has_kids_pool = true
where id = 'POOL_0025';
