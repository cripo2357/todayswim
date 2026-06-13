-- Pool's day — 경상 미등록 군 조사 회수 3곳 (POOL_0681~0683).
--
-- ## 출처 [1차 — 운영자 공식 사이트]
-- 함안(함안지방공사 halc.co.kr)·영양(영양군 yyg.go.kr). 공식 자유수영 운영시간·요금.
-- 미등록 13개 군 전수 조사 결과 중, 공식 운영시간이 확보된 곳만 등록.
--
-- ## 메타
-- - 좌표: 카카오 POI(시설명).
-- - 함안 2곳: 운영시간 내 자유수영 블록형(아쿠아로빅 강습시간 제외 day_note).
-- - 영양: 공식상 토요일 자유수영만 명확 → 토 슬롯만 등록(평일 강습 위주, price_weekday null).
-- - 보류(시설 실재·시간표 미게시, 캡처 필요): 산청·합천·의성·영덕·성주·봉화·울진·청송(건물명 모호).
--   수영장 없음/근거없음: 고령·청도·울릉.
--
-- ## prod 적용: scripts/apply-sql-prod.mjs (멱등). db push 금지.

-- 1) 함안군국민체육센터 (경남 함안군)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0681', '함안군국민체육센터', '경남', '함안군', '경상남도 함안군 칠원읍 용산2길 68',
    35.3099364050438, 128.516061661784, 'indoor', 'public',
    '055-586-2116', 'https://www.halc.co.kr/sub.html?code=01_02', 5, 25, null, null,
    '{}', true, false, false,
    true, true, 3300, 3300, null, 'https://www.halc.co.kr/sub.html?code=01_02')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0681', '풀스데이', $${"월":[{"start":"06:00","end":"21:00","hours":15}],"화":[{"start":"06:00","end":"21:00","hours":15}],"수":[{"start":"06:00","end":"21:00","hours":15}],"목":[{"start":"06:00","end":"21:00","hours":15}],"금":[{"start":"06:00","end":"21:00","hours":15}],"토":[{"start":"06:00","end":"18:00","hours":12}]}$$::jsonb, $${"월":"아쿠아로빅 강습시간 제외 자유수영, 토·공휴일 18:00까지, 일요일 휴관"}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0681' and exists (select 1 from public.schedules where pool_id = 'POOL_0681');

-- 2) 함안체육관 (경남 함안군)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0682', '함안체육관', '경남', '함안군', '경상남도 함안군 가야읍 함안대로 619-4',
    35.279972517618894, 128.3975880508538, 'indoor', 'public',
    '055-584-2122', 'https://www.halc.co.kr/sub.html?code=01_01', 6, 25, null, null,
    '{}', false, false, false,
    true, true, 3300, 3300, null, 'https://www.halc.co.kr/sub.html?code=01_01')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0682', '풀스데이', $${"월":[{"start":"07:00","end":"21:00","hours":14}],"화":[{"start":"07:00","end":"21:00","hours":14}],"수":[{"start":"07:00","end":"21:00","hours":14}],"목":[{"start":"07:00","end":"21:00","hours":14}],"금":[{"start":"07:00","end":"21:00","hours":14}],"토":[{"start":"06:00","end":"17:00","hours":11}]}$$::jsonb, $${"월":"아쿠아로빅 강습시간 제외 자유수영, 일요일 휴관"}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0682' and exists (select 1 from public.schedules where pool_id = 'POOL_0682');

-- 3) 영양군청소년수련관수영장 (경북 영양군)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0683', '영양군청소년수련관수영장', '경북', '영양군', '경상북도 영양군 영양읍 동부리 184',
    36.66147219502934, 129.11878062711722, 'indoor', 'public',
    '054-683-8990', 'https://www.yyg.go.kr/youth/swimming/class/guide', 4, 25, 0.8, 1.3,
    '{}', true, false, false,
    true, true, null, 3500, null, 'https://www.yyg.go.kr/youth/swimming/class/guide')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0683', '풀스데이', $${"토":[{"start":"09:00","end":"18:00","hours":9}]}$$::jsonb, $${"토":"토요일 자유수영 09:00~18:00(평일은 강습 위주), 1회 2시간"}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0683' and exists (select 1 from public.schedules where pool_id = 'POOL_0683');
