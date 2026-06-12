-- Pool's day — 전남 군 지역 공공 수영장 배치 (POOL_0502~0505, 4곳).
-- 전수조사(전남 22군)에서 공식 1차 자유수영 시간표 확보된 군. 강습·정화·식사시간 제외한
-- 자유수영 슬롯만 by_day에 반영. 첨벙/블로그 미사용. 좌표=카카오 Local API.
-- 장성군(시간표 균일·월휴관/규격 불확실)·완도/함평/화순/구례/담양/고흥/보성 등은 보류.

-- 1) 강진국민체육센터실내수영장 (전남 강진군)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0502', '강진국민체육센터실내수영장', '전남', '강진군', '전라남도 강진군 강진읍 종합운동장길 60',
    34.6458293772778, 126.782770129444, 'indoor', 'public',
    '061-430-3812', 'https://www.gangjin.go.kr/sports/facility/pool', 6, 25, null, null,
    '{}', true, false, false,
    true, true, 3000, 3000, null, 'https://www.gangjin.go.kr/sports/facility/pool/usage_fee')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0502', '풀스데이', $${"월":[{"start":"06:00","end":"08:00","hours":2},{"start":"09:00","end":"12:00","hours":3},{"start":"14:00","end":"20:00","hours":6}],"화":[{"start":"07:00","end":"08:00","hours":1},{"start":"09:00","end":"09:30","hours":0.5},{"start":"10:20","end":"12:00","hours":1.67},{"start":"14:00","end":"18:30","hours":4.5},{"start":"19:20","end":"20:00","hours":0.67}],"수":[{"start":"06:00","end":"08:00","hours":2},{"start":"09:00","end":"12:00","hours":3},{"start":"14:00","end":"20:00","hours":6}],"목":[{"start":"07:00","end":"08:00","hours":1},{"start":"09:00","end":"09:30","hours":0.5},{"start":"10:20","end":"12:00","hours":1.67},{"start":"14:00","end":"18:30","hours":4.5},{"start":"19:20","end":"20:00","hours":0.67}],"금":[{"start":"06:00","end":"08:00","hours":2},{"start":"09:00","end":"12:00","hours":3},{"start":"14:00","end":"20:00","hours":6}],"토":[{"start":"06:00","end":"08:00","hours":2},{"start":"09:00","end":"12:00","hours":3},{"start":"14:00","end":"19:00","hours":5}]}$$::jsonb, '{}'::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0502' and exists (select 1 from public.schedules where pool_id = 'POOL_0502');

-- 2) 우슬국민체육센터조오련수영장 (전남 해남군)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0503', '우슬국민체육센터조오련수영장', '전남', '해남군', '전라남도 해남군 해남읍 해남로 72',
    34.5674731621709, 126.618343005549, 'indoor', 'public',
    '061-530-5796', 'https://sports.haenam.go.kr', 8, 25, null, null,
    '{}', false, false, false,
    true, true, 3000, 3000, null, 'https://sports.haenam.go.kr/sports/index.9is?contentUid=18e3368f691d11910169c83a8fc105de')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0503', '풀스데이', $${"월":[{"start":"07:10","end":"08:10","hours":1},{"start":"09:00","end":"09:20","hours":0.33},{"start":"10:10","end":"12:00","hours":1.83},{"start":"13:00","end":"18:30","hours":5.5},{"start":"19:30","end":"20:30","hours":1}],"화":[{"start":"06:00","end":"06:20","hours":0.33},{"start":"07:10","end":"08:10","hours":1},{"start":"09:00","end":"09:20","hours":0.33},{"start":"10:10","end":"12:00","hours":1.83},{"start":"13:00","end":"18:30","hours":5.5},{"start":"19:30","end":"20:30","hours":1}],"수":[{"start":"07:10","end":"08:10","hours":1},{"start":"09:00","end":"09:20","hours":0.33},{"start":"10:10","end":"12:00","hours":1.83},{"start":"13:00","end":"18:30","hours":5.5},{"start":"19:30","end":"20:30","hours":1}],"목":[{"start":"06:00","end":"06:20","hours":0.33},{"start":"07:10","end":"08:10","hours":1},{"start":"09:00","end":"09:20","hours":0.33},{"start":"10:10","end":"12:00","hours":1.83},{"start":"13:00","end":"18:30","hours":5.5},{"start":"19:30","end":"20:30","hours":1}],"금":[{"start":"06:00","end":"08:10","hours":2.17},{"start":"09:00","end":"12:00","hours":3},{"start":"13:00","end":"20:30","hours":7.5}],"토":[{"start":"09:00","end":"18:00","hours":9}]}$$::jsonb, '{}'::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0503' and exists (select 1 from public.schedules where pool_id = 'POOL_0503');

-- 3) 진도실내수영장 (전남 진도군)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0504', '진도실내수영장', '전남', '진도군', '전라남도 진도군 진도읍 동외4길 126',
    34.4855939041147, 126.27646400588, 'indoor', 'public',
    '061-540-6284', 'https://www.jindo.go.kr', null, 25, 1.2, 1.2,
    '{}', true, false, false,
    true, true, 3000, 3000, null, 'https://www.jindo.go.kr/home/sub.cs?m=766')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0504', '풀스데이', $${"화":[{"start":"06:00","end":"07:30","hours":1.5},{"start":"09:00","end":"11:20","hours":2.33},{"start":"13:30","end":"17:10","hours":3.67},{"start":"19:00","end":"20:30","hours":1.5}],"수":[{"start":"06:00","end":"07:30","hours":1.5},{"start":"09:00","end":"11:20","hours":2.33},{"start":"13:30","end":"17:10","hours":3.67},{"start":"19:00","end":"20:30","hours":1.5}],"목":[{"start":"06:00","end":"07:30","hours":1.5},{"start":"09:00","end":"11:20","hours":2.33},{"start":"13:30","end":"17:10","hours":3.67},{"start":"19:00","end":"20:30","hours":1.5}],"금":[{"start":"06:00","end":"07:30","hours":1.5},{"start":"09:00","end":"11:20","hours":2.33},{"start":"13:30","end":"17:10","hours":3.67},{"start":"19:00","end":"20:30","hours":1.5}],"토":[{"start":"09:00","end":"11:20","hours":2.33},{"start":"13:30","end":"17:10","hours":3.67}],"일":[{"start":"09:00","end":"11:20","hours":2.33},{"start":"13:30","end":"17:10","hours":3.67}]}$$::jsonb, '{}'::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0504' and exists (select 1 from public.schedules where pool_id = 'POOL_0504');

-- 4) 영암군국민체육센터수영장 (전남 영암군) — 요금·규격 공식 미게재(null)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0505', '영암군국민체육센터수영장', '전남', '영암군', '전라남도 영암군 영암읍 역리 100',
    34.8053608797878, 126.703215004707, 'indoor', 'public',
    '061-470-6516', 'https://www.yeongam.go.kr', null, null, null, null,
    '{}', false, false, false,
    true, true, null, null, null, 'https://www.yeongam.go.kr/home/www/info_area/life_edu/life_edu_05/life_edu_05_03/yeongam.go')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0505', '풀스데이', $${"화":[{"start":"07:00","end":"10:10","hours":3.17},{"start":"11:00","end":"12:00","hours":1},{"start":"13:00","end":"17:00","hours":4},{"start":"18:00","end":"19:10","hours":1.17},{"start":"20:00","end":"21:00","hours":1}],"수":[{"start":"07:00","end":"10:10","hours":3.17},{"start":"11:00","end":"12:00","hours":1},{"start":"13:00","end":"17:00","hours":4},{"start":"18:00","end":"19:10","hours":1.17},{"start":"20:00","end":"21:00","hours":1}],"목":[{"start":"07:00","end":"10:10","hours":3.17},{"start":"11:00","end":"12:00","hours":1},{"start":"13:00","end":"17:00","hours":4},{"start":"18:00","end":"19:10","hours":1.17},{"start":"20:00","end":"21:00","hours":1}],"금":[{"start":"07:00","end":"10:10","hours":3.17},{"start":"11:00","end":"12:00","hours":1},{"start":"13:00","end":"17:00","hours":4},{"start":"18:00","end":"19:10","hours":1.17},{"start":"20:00","end":"21:00","hours":1}],"토":[{"start":"09:00","end":"12:00","hours":3},{"start":"13:00","end":"17:00","hours":4}],"일":[{"start":"09:00","end":"12:00","hours":3},{"start":"13:00","end":"17:00","hours":4}]}$$::jsonb, '{}'::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0505' and exists (select 1 from public.schedules where pool_id = 'POOL_0505');
