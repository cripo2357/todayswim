-- Pool's day — 제주 규격 2차 출처 백필. 2026-06-12.
-- 레인/길이/수심은 변동성 낮은 객관사실이라 2차 출처 허용([[pool_specs_2nd_source_ok]]).
-- 애월: 4레인(디지털제주문화대전·제민일보, 해수풀). 제주종합: 경영풀 수심 1.8m(위키백과).
-- 나머지 7곳 수심 등은 2차 출처에도 미인덱싱 → null 유지(현장 확인 시 보강).
update public.pools set lane_count = 4 where id = 'POOL_0152';
update public.pools set depth_min = 1.8, depth_max = 1.8 where id = 'POOL_0501';
