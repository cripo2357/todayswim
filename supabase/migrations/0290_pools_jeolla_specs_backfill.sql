-- Pool's day — 전라도 풀 규격(레인·길이·수심) 2차 출처 백필 (POOL_0172·0174).
-- 규격은 변동성 낮은 객관사실이라 2차 출처 허용([[pool_specs_2nd_source_ok]]). 시간표·요금은 미변경.
-- 정읍: 정읍신문/개장 뉴시스 기사(8레인 25m, 수심 130~150cm). 신뢰 high.
-- 지리산권: 남원넷 개장기사+공식 검색요약(6레인 25m, 수심 1.2~1.3m). 레인/길이 high, 수심 medium.
-- 나주·무안·영광 수심은 어떤 2차 출처에도 미기재 → 추측 없이 null 유지(백필 제외).

update public.pools
set lane_count = 8, pool_length = 25, depth_min = 1.3, depth_max = 1.5
where id = 'POOL_0172';

update public.pools
set lane_count = 6, pool_length = 25, depth_min = 1.2, depth_max = 1.3
where id = 'POOL_0174';
