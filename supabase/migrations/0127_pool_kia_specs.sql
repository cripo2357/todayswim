-- Pool's day — 기아스포츠센터 광명점(POOL_0033) 규격 보강.
-- 운영자(크리스) 제공: 성인풀 5레인 × 25m, 수심 1.2~1.6m, 유아풀 별도 2곳(수심 0.6m·1m).
-- (0117 등록 시 "미취학 입장불가" 단서로 has_kids_pool=false 추정했으나 실제 유아풀 보유
--  → true로 정정. 레인·길이·수심도 NULL이었음. 입장 정책상 초등생+만 입장 가능은 별개.)

update public.pools
set lane_count = 5,
    pool_length = 25,
    depth_min = 1.2,
    depth_max = 1.6,
    has_kids_pool = true
where id = 'POOL_0033';
