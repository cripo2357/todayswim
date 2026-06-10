-- Pool's day — 전라도(전북·전남) 공공 수영장 1차 배치 등록 (POOL_0170~0164, 14곳).
--
-- ## 시간표 출처 [1차 — 운영자 공식]
-- 각 시·군 시설관리공단/도시공사/국민·생활체육센터 및 시청 체육시설 공식 페이지의
-- 자유수영(일일입장) 안내에서 요일별 시간·요금 추출. 첨벙(cbswim)/블로그/카페 등 2차는 시간표·요금에 미사용.
-- 각 풀 schedule_source_url에 공식 페이지 명시.
--
-- ## 메타
-- - 좌표 [신뢰도 높음]: 카카오 Local API(시설명 키워드/도로명 주소).
-- - 규격: 공식/2차(객관사실) 확인분만, 미확인 null. 사진 없음 → photo_url null.
-- - 전주완산·덕진/정읍/김제/지리산권/완주/나주는 공식 안내상 "운영시간 내 자유수영"이라
--   운영시간(점심 정화시간 제외)을 자유수영 시간으로 등록. 나머지는 공식 자유수영 시간대 그대로.
-- - 전주완산(둘째·넷째 일요일 휴장)·덕진(첫째·셋째 일요일 휴장)·김제(셋째 일요일 휴장)는 일요일 weeks 구조화.
-- - 목포는 주말·공휴일만 자유수영(price_weekday null). 완주·무안·영광은 월요일 휴관.

-- 1) 전주완산수영장 (전북 전주시 완산구)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0170', '전주완산수영장', '전북', '전주시 완산구', '전북특별자치도 전주시 완산구 쑥고개로 366-7',
    35.8026819745042, 127.106147096825, 'indoor', 'public',
    '063-239-2580', 'https://www.jjss.or.kr', 10, 50, 1.2, 1.2,
    '{}', false, true, false,
    true, true, 3000, 3000, null, 'https://www.jjss.or.kr/index.9is?contentUid=5232d76d76d6f8340177388336495ed5')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0170', '풀스데이', $${"월":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"20:00","hours":7}],"화":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"20:00","hours":7}],"수":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"20:00","hours":7}],"목":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"20:00","hours":7}],"금":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"20:00","hours":7}],"토":[{"start":"06:00","end":"17:00","hours":11}],"일":[{"start":"10:00","end":"17:00","hours":7,"weeks":[1,3,5]}]}$$::jsonb, $${"일":"매월 둘째·넷째 주 일요일은 휴장합니다."}$$::jsonb, '2026-06-10'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0170' and exists (select 1 from public.schedules where pool_id = 'POOL_0170');

-- 2) 전주덕진수영장 (전북 전주시 덕진구)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0171', '전주덕진수영장', '전북', '전주시 덕진구', '전북특별자치도 전주시 덕진구 백제대로 310',
    35.8404169626426, 127.125640580319, 'indoor', 'public',
    '063-239-2651', 'https://www.jjss.or.kr', 10, 50, 1.4, 1.4,
    '{}', false, false, false,
    true, true, 3000, 3000, null, 'https://www.jjss.or.kr/index.9is?contentUid=5232d76d7738cf80017742c0a5283c4c')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0171', '풀스데이', $${"월":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"20:00","hours":7}],"화":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"20:00","hours":7}],"수":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"20:00","hours":7}],"목":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"20:00","hours":7}],"금":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"20:00","hours":7}],"토":[{"start":"06:00","end":"17:00","hours":11}],"일":[{"start":"10:00","end":"17:00","hours":7,"weeks":[2,4,5]}]}$$::jsonb, $${"일":"매월 첫째·셋째 주 일요일은 휴장합니다."}$$::jsonb, '2026-06-10'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0171' and exists (select 1 from public.schedules where pool_id = 'POOL_0171');

-- 3) 정읍체육트레이닝센터 (전북 정읍시)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0172', '정읍체육트레이닝센터', '전북', '정읍시', '전북특별자치도 정읍시 서부산업도로 138-5',
    35.5620534451299, 126.835268410702, 'indoor', 'public',
    '063-539-8270', 'https://spt.jeongeup.go.kr', null, null, null, null,
    '{}', false, false, false,
    true, true, 3500, 3500, null, 'https://spt.jeongeup.go.kr/fmcs/3')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0172', '풀스데이', $${"월":[{"start":"06:00","end":"12:00","hours":6},{"start":"14:00","end":"20:00","hours":6}],"화":[{"start":"06:00","end":"12:00","hours":6},{"start":"14:00","end":"20:00","hours":6}],"수":[{"start":"06:00","end":"12:00","hours":6},{"start":"14:00","end":"20:00","hours":6}],"목":[{"start":"06:00","end":"12:00","hours":6},{"start":"14:00","end":"20:00","hours":6}],"금":[{"start":"06:00","end":"12:00","hours":6},{"start":"14:00","end":"20:00","hours":6}],"토":[{"start":"06:00","end":"16:00","hours":10}]}$$::jsonb, '{}'::jsonb, '2026-06-10'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0172' and exists (select 1 from public.schedules where pool_id = 'POOL_0172');

-- 4) 남원실내수영장 (전북 남원시)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0173', '남원실내수영장', '전북', '남원시', '전북특별자치도 남원시 충청로 341',
    35.4301935617762, 127.401346503194, 'indoor', 'public',
    '063-635-7330', 'http://www.nwsportstown.kr', 6, 25, 1.2, 1.3,
    '{}', true, false, false,
    true, true, 3000, 3000, null, 'http://www.nwsportstown.kr/sh_page/page35.php')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0173', '풀스데이', $${"월":[{"start":"05:50","end":"11:50","hours":6},{"start":"13:00","end":"17:00","hours":4},{"start":"18:00","end":"20:50","hours":2.83}],"화":[{"start":"05:50","end":"11:50","hours":6},{"start":"13:00","end":"17:00","hours":4},{"start":"18:00","end":"20:50","hours":2.83}],"수":[{"start":"05:50","end":"11:50","hours":6},{"start":"13:00","end":"17:00","hours":4},{"start":"18:00","end":"20:50","hours":2.83}],"목":[{"start":"05:50","end":"11:50","hours":6},{"start":"13:00","end":"17:00","hours":4},{"start":"18:00","end":"20:50","hours":2.83}],"금":[{"start":"05:50","end":"11:50","hours":6},{"start":"13:00","end":"17:00","hours":4},{"start":"18:00","end":"20:50","hours":2.83}],"토":[{"start":"05:50","end":"11:50","hours":6},{"start":"13:00","end":"17:50","hours":4.83}]}$$::jsonb, '{}'::jsonb, '2026-06-10'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0173' and exists (select 1 from public.schedules where pool_id = 'POOL_0173');

-- 5) 지리산권실내수영장 (전북 남원시 인월면)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0174', '지리산권실내수영장', '전북', '남원시', '전북특별자치도 남원시 인월면 황산로 1804',
    35.4647287614255, 127.599648013095, 'indoor', 'public',
    '063-625-7331', 'http://www.nwjirisansportstown.kr', null, null, null, null,
    '{}', false, false, false,
    true, true, 3000, 3000, null, 'http://www.nwjirisansportstown.kr/sh_page/page40.php')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0174', '풀스데이', $${"월":[{"start":"09:00","end":"18:00","hours":9}],"화":[{"start":"09:00","end":"18:00","hours":9}],"수":[{"start":"09:00","end":"18:00","hours":9}],"목":[{"start":"09:00","end":"18:00","hours":9}],"금":[{"start":"09:00","end":"18:00","hours":9}],"토":[{"start":"09:00","end":"18:00","hours":9}]}$$::jsonb, '{}'::jsonb, '2026-06-10'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0174' and exists (select 1 from public.schedules where pool_id = 'POOL_0174');

-- 6) 김제실내수영장 (전북 김제시)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0175', '김제실내수영장', '전북', '김제시', '전북특별자치도 김제시 도작로 224-32',
    35.8144091785327, 126.900577692486, 'indoor', 'public',
    '063-540-4579', 'https://www.gimje.go.kr', 6, 25, 1.3, 1.3,
    '{}', true, false, false,
    true, true, 2500, 2500, null, 'https://www.gimje.go.kr/index.gimje?menuCd=DOM_000000106011007000')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0175', '풀스데이', $${"월":[{"start":"05:30","end":"20:00","hours":14.5}],"화":[{"start":"05:30","end":"20:00","hours":14.5}],"수":[{"start":"05:30","end":"20:00","hours":14.5}],"목":[{"start":"05:30","end":"20:00","hours":14.5}],"금":[{"start":"05:30","end":"20:00","hours":14.5}],"토":[{"start":"05:30","end":"16:00","hours":10.5}],"일":[{"start":"09:00","end":"16:00","hours":7,"weeks":[1,2,4,5]}]}$$::jsonb, $${"일":"매월 셋째 주 일요일은 휴장합니다."}$$::jsonb, '2026-06-10'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0175' and exists (select 1 from public.schedules where pool_id = 'POOL_0175');

-- 7) 완주국민체육센터 (전북 완주군)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0176', '완주국민체육센터', '전북', '완주군', '전북특별자치도 완주군 용진읍 완주로 860',
    35.9379266344808, 127.174740575571, 'indoor', 'public',
    '063-270-9956', 'https://www.wanju.go.kr', 5, 25, 1.2, 1.4,
    '{}', true, false, false,
    true, true, 3500, 3500, null, 'https://www.wanju.go.kr/index.9is?contentUid=ff8080818b024d8e018b274f678e2c4a')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0176', '풀스데이', $${"화":[{"start":"06:00","end":"21:00","hours":15}],"수":[{"start":"06:00","end":"21:00","hours":15}],"목":[{"start":"06:00","end":"21:00","hours":15}],"금":[{"start":"06:00","end":"21:00","hours":15}],"토":[{"start":"06:00","end":"21:00","hours":15}],"일":[{"start":"06:00","end":"21:00","hours":15}]}$$::jsonb, '{}'::jsonb, '2026-06-10'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0176' and exists (select 1 from public.schedules where pool_id = 'POOL_0176');

-- 8) 순천팔마수영장 (전남 순천시)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0177', '순천팔마수영장', '전남', '순천시', '전라남도 순천시 팔마로 333',
    34.9351149129514, 127.520027186816, 'indoor', 'public',
    '061-749-8501', 'https://www.suncheon.go.kr/yeyak/edu/swim/0001/', 7, 25, 1.1, 1.3,
    '{}', true, false, false,
    true, true, 3000, 3000, null, 'https://www.suncheon.go.kr/yeyak/edu/swim/0001/')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0177', '풀스데이', $${"월":[{"start":"05:30","end":"11:50","hours":6.33},{"start":"13:00","end":"16:50","hours":3.83},{"start":"18:00","end":"20:50","hours":2.83}],"화":[{"start":"05:30","end":"11:50","hours":6.33},{"start":"13:00","end":"16:50","hours":3.83},{"start":"18:00","end":"20:50","hours":2.83}],"수":[{"start":"05:30","end":"11:50","hours":6.33},{"start":"13:00","end":"16:50","hours":3.83},{"start":"18:00","end":"20:50","hours":2.83}],"목":[{"start":"05:30","end":"11:50","hours":6.33},{"start":"13:00","end":"16:50","hours":3.83},{"start":"18:00","end":"20:50","hours":2.83}],"금":[{"start":"05:30","end":"11:50","hours":6.33},{"start":"13:00","end":"16:50","hours":3.83},{"start":"18:00","end":"20:50","hours":2.83}],"토":[{"start":"09:30","end":"11:50","hours":2.33},{"start":"13:00","end":"17:50","hours":4.83}],"일":[{"start":"09:30","end":"11:50","hours":2.33},{"start":"13:00","end":"17:50","hours":4.83}]}$$::jsonb, '{}'::jsonb, '2026-06-10'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0177' and exists (select 1 from public.schedules where pool_id = 'POOL_0177');

-- 9) 순천문화건강센터수영장 (전남 순천시)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0178', '순천문화건강센터수영장', '전남', '순천시', '전라남도 순천시 환선로 133',
    34.9676754168854, 127.486748151874, 'indoor', 'public',
    '061-749-8503', 'https://www.suncheon.go.kr/yeyak/edu/swim/0001/', 6, 25, 1.1, 1.3,
    '{}', true, false, false,
    true, true, 3000, 3000, null, 'https://www.suncheon.go.kr/yeyak/edu/swim/0001/')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0178', '풀스데이', $${"월":[{"start":"05:30","end":"11:50","hours":6.33},{"start":"14:20","end":"16:50","hours":2.5},{"start":"19:00","end":"20:50","hours":1.83}],"화":[{"start":"05:30","end":"11:50","hours":6.33},{"start":"14:20","end":"16:50","hours":2.5},{"start":"19:00","end":"20:50","hours":1.83}],"수":[{"start":"05:30","end":"11:50","hours":6.33},{"start":"14:20","end":"16:50","hours":2.5},{"start":"19:00","end":"20:50","hours":1.83}],"목":[{"start":"05:30","end":"11:50","hours":6.33},{"start":"14:20","end":"16:50","hours":2.5},{"start":"19:00","end":"20:50","hours":1.83}],"금":[{"start":"05:30","end":"11:50","hours":6.33},{"start":"14:20","end":"16:50","hours":2.5},{"start":"19:00","end":"20:50","hours":1.83}],"토":[{"start":"09:00","end":"11:50","hours":2.83},{"start":"13:00","end":"17:50","hours":4.83}],"일":[{"start":"09:00","end":"11:50","hours":2.83},{"start":"13:00","end":"17:50","hours":4.83}]}$$::jsonb, '{}'::jsonb, '2026-06-10'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0178' and exists (select 1 from public.schedules where pool_id = 'POOL_0178');

-- 10) 순천신대유청소년수영장 (전남 순천시 해룡면)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0179', '순천신대유청소년수영장', '전남', '순천시', '전라남도 순천시 해룡면 매안로 138',
    34.9366419460028, 127.55088735235, 'indoor', 'public',
    null, 'https://www.suncheon.go.kr/yeyak/edu/swim/0001/', 8, 25, 1.2, 1.3,
    '{}', true, false, false,
    true, true, 3000, 3000, null, 'https://www.suncheon.go.kr/yeyak/edu/swim/0001/')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0179', '풀스데이', $${"월":[{"start":"05:30","end":"11:50","hours":6.33},{"start":"13:00","end":"15:50","hours":2.83},{"start":"19:00","end":"20:50","hours":1.83}],"화":[{"start":"05:30","end":"11:50","hours":6.33},{"start":"13:00","end":"15:50","hours":2.83},{"start":"19:00","end":"20:50","hours":1.83}],"수":[{"start":"05:30","end":"11:50","hours":6.33},{"start":"13:00","end":"15:50","hours":2.83},{"start":"19:00","end":"20:50","hours":1.83}],"목":[{"start":"05:30","end":"11:50","hours":6.33},{"start":"13:00","end":"15:50","hours":2.83},{"start":"19:00","end":"20:50","hours":1.83}],"금":[{"start":"05:30","end":"11:50","hours":6.33},{"start":"13:00","end":"15:50","hours":2.83},{"start":"19:00","end":"20:50","hours":1.83}],"토":[{"start":"09:00","end":"11:50","hours":2.83},{"start":"13:00","end":"17:50","hours":4.83}],"일":[{"start":"09:00","end":"11:50","hours":2.83},{"start":"13:00","end":"17:50","hours":4.83}]}$$::jsonb, '{}'::jsonb, '2026-06-10'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0179' and exists (select 1 from public.schedules where pool_id = 'POOL_0179');

-- 11) 목포실내체육관실내수영장 (전남 목포시) — 주말·공휴일만 자유수영
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0180', '목포실내체육관실내수영장', '전남', '목포시', '전라남도 목포시 대양로 286',
    34.8241060657718, 126.407245070368, 'indoor', 'public',
    '061-270-8369', 'https://www.mokpo.go.kr', 10, 50, 1.35, 1.35,
    '{}', false, false, false,
    true, true, null, 2500, null, 'https://www.mokpo.go.kr/www/life_welfare/culture_sport/swimming_pool')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0180', '풀스데이', $${"토":[{"start":"05:30","end":"12:00","hours":6.5},{"start":"13:00","end":"18:00","hours":5}],"일":[{"start":"05:30","end":"12:00","hours":6.5},{"start":"13:00","end":"18:00","hours":5}]}$$::jsonb, '{}'::jsonb, '2026-06-10'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0180' and exists (select 1 from public.schedules where pool_id = 'POOL_0180');

-- 12) 나주국민체육센터생활체육관실내수영장 (전남 나주시)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0181', '나주국민체육센터생활체육관실내수영장', '전남', '나주시', '전라남도 나주시 영산강변로 99',
    35.0100365426519, 126.716820473932, 'indoor', 'public',
    '061-339-4545', 'https://www.naju.go.kr', 6, 25, null, null,
    '{}', true, false, false,
    true, true, 3000, 3000, null, 'https://www.naju.go.kr/sports/facilities/sports_center')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0181', '풀스데이', $${"월":[{"start":"06:00","end":"12:00","hours":6},{"start":"14:00","end":"21:00","hours":7}],"화":[{"start":"06:00","end":"12:00","hours":6},{"start":"14:00","end":"21:00","hours":7}],"수":[{"start":"06:00","end":"12:00","hours":6},{"start":"14:00","end":"21:00","hours":7}],"목":[{"start":"06:00","end":"12:00","hours":6},{"start":"14:00","end":"21:00","hours":7}],"금":[{"start":"06:00","end":"12:00","hours":6},{"start":"14:00","end":"21:00","hours":7}],"토":[{"start":"06:00","end":"12:00","hours":6},{"start":"14:00","end":"18:00","hours":4}]}$$::jsonb, '{}'::jsonb, '2026-06-10'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0181' and exists (select 1 from public.schedules where pool_id = 'POOL_0181');

-- 13) 무안실내수영장 (전남 무안군 현경면) — 월요일 휴관
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0182', '무안실내수영장', '전남', '무안군', '전라남도 무안군 현경면 공항로 345',
    35.0035619922116, 126.447487375539, 'indoor', 'public',
    '061-452-9898', 'https://www.muan.go.kr/sports', 8, 25, null, null,
    '{}', true, false, false,
    true, true, 3000, 3000, null, 'https://www.muan.go.kr/sports/intro/sports_park_info/pool')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0182', '풀스데이', $${"화":[{"start":"06:00","end":"08:00","hours":2},{"start":"09:00","end":"17:00","hours":8},{"start":"18:00","end":"21:00","hours":3}],"수":[{"start":"06:00","end":"08:00","hours":2},{"start":"09:00","end":"17:00","hours":8},{"start":"18:00","end":"21:00","hours":3}],"목":[{"start":"06:00","end":"08:00","hours":2},{"start":"09:00","end":"17:00","hours":8},{"start":"18:00","end":"21:00","hours":3}],"금":[{"start":"06:00","end":"08:00","hours":2},{"start":"09:00","end":"17:00","hours":8},{"start":"18:00","end":"21:00","hours":3}],"토":[{"start":"09:00","end":"17:00","hours":8}],"일":[{"start":"09:00","end":"17:00","hours":8}]}$$::jsonb, '{}'::jsonb, '2026-06-10'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0182' and exists (select 1 from public.schedules where pool_id = 'POOL_0182');

-- 14) 영광스포티움실내수영장 (전남 영광군) — 월요일 휴관
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0183', '영광스포티움실내수영장', '전남', '영광군', '전라남도 영광군 영광읍 중앙로 203',
    35.2901756863624, 126.496879681983, 'indoor', 'public',
    '061-350-5681', 'https://www.yeonggwang.go.kr', 6, 25, null, null,
    '{}', true, false, false,
    true, true, 3000, 3000, null, 'https://yeonggwang.go.kr/subpage/?mn=14361&site=headquarter_new')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0183', '풀스데이', $${"화":[{"start":"06:00","end":"08:00","hours":2},{"start":"09:30","end":"11:30","hours":2},{"start":"13:00","end":"14:40","hours":1.67},{"start":"15:30","end":"17:00","hours":1.5},{"start":"18:30","end":"20:30","hours":2}],"수":[{"start":"06:00","end":"08:00","hours":2},{"start":"09:30","end":"11:30","hours":2},{"start":"13:00","end":"14:40","hours":1.67},{"start":"15:30","end":"17:00","hours":1.5},{"start":"18:30","end":"20:30","hours":2}],"목":[{"start":"06:00","end":"08:00","hours":2},{"start":"09:30","end":"11:30","hours":2},{"start":"13:00","end":"14:40","hours":1.67},{"start":"15:30","end":"17:00","hours":1.5},{"start":"18:30","end":"20:30","hours":2}],"금":[{"start":"06:00","end":"08:00","hours":2},{"start":"09:30","end":"11:30","hours":2},{"start":"13:00","end":"14:40","hours":1.67},{"start":"15:30","end":"17:00","hours":1.5},{"start":"18:30","end":"20:30","hours":2}],"토":[{"start":"09:00","end":"11:30","hours":2.5},{"start":"13:30","end":"16:40","hours":3.17}],"일":[{"start":"09:00","end":"11:30","hours":2.5},{"start":"13:30","end":"16:40","hours":3.17}]}$$::jsonb, '{}'::jsonb, '2026-06-10'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0183' and exists (select 1 from public.schedules where pool_id = 'POOL_0183');
