-- Pool's Day v1 — 관악구민종합체육센터(POOL_SEOUL_0005) 좌표 보정.
-- 0021은 낙성대동 근사값(37.4772, 126.9588) — 실제보다 약 450m 북쪽.
-- 정밀 좌표: OpenStreetMap Nominatim 건물 단위 매치
--   "37, 낙성대로3길, 낙성대동, 관악구, 서울특별시" · class leisure=fitness_centre
-- 0021이 이미 적용됐을 수 있어 ALTER가 아닌 UPDATE 보정(마이그레이션-당-변경 컨벤션).

update public.pools
set lat = 37.4730729,
    lng = 126.9603435
where id = 'POOL_SEOUL_0005';
