-- Pool's day v1 — 사당문화회관(POOL_SEOUL_0006) 좌표 보정.
-- 0024는 OSM Nominatim 도로 중심값 근사(37.4836888, 126.9683910) — 도로/번지 매치 실패.
-- 정밀 좌표: 카카오 Local API(scripts/geocode-kakao.mjs) — 도로명주소 정확 매치
--   "서울 동작구 사당로8길 9" (ROAD_ADDR, 신뢰도 높음). OSM값 대비 ~110m 차이.
-- 0024가 이미 적용됐고 INSERT는 ON CONFLICT (id) DO NOTHING — 재실행해도 기존 행
--   갱신 안 됨 → 명시적 UPDATE 보정(0021→0022 패턴 동일).

update public.pools
set lat = 37.4847167,
    lng = 126.9696126
where id = 'POOL_SEOUL_0006';
