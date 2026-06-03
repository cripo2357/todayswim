-- Pool's day — 서울대 포스코(POOL_0034) 규격 보강.
-- 운영자(크리스) 제공: 레인 길이 25m, 수심 1.2m, 총 9레인.
-- (0118 등록 시 공식 페이지에 규격 미기재로 NULL이었던 항목 채움.)

update public.pools
set lane_count = 9,
    pool_length = 25,
    depth_min = 1.2,
    depth_max = 1.2
where id = 'POOL_0034';
