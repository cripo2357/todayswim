-- Pool's day — 서초종합체육관(POOL_0035) 규격 보강.
-- 운영자(크리스) 제공: 25m × 6레인 (사계절 수온유지·오버플로우 순환 수질관리).
-- (0119 등록 시 레인·길이가 NULL이었음.)

update public.pools
set lane_count = 6,
    pool_length = 25
where id = 'POOL_0035';
