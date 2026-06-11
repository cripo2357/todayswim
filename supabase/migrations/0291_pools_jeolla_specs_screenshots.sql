-- Pool's day — 전라도 풀 규격 추가 백필 + 무안 명칭 정정 (크리스 캡처 근거).
-- 규격은 2차 출처 허용([[pool_specs_2nd_source_ok]]). 시간표·요금 미변경.
-- 나주: 캡처(주 수영풀 25m×6레인 폭2.5m, 수심 1.2m, 보조풀+스파 각37㎡) → 수심 1.2 백필.
-- 영광: 캡처(25m×8레인 = 일반6@1.5m + 보조/이벤트2@2.0~2.5m) → 6→8레인 정정 + 수심 1.5~2.5 백필.
-- 무안: '무안실내수영장' = 무안종합스포츠파크 내 실내수영장 → 나주와 동일 케이스로 정식명 정정 +
--       좌표를 실제 수영장 건물 POI로 보정. 수심은 캡처 없어 null 유지.

update public.pools
set depth_min = 1.2, depth_max = 1.2
where id = 'POOL_0181';

update public.pools
set lane_count = 8, depth_min = 1.5, depth_max = 2.5
where id = 'POOL_0183';

update public.pools
set name = '무안종합스포츠파크실내수영장',
    lat = 35.0031355711584,
    lng = 126.447174203128
where id = 'POOL_0182';
