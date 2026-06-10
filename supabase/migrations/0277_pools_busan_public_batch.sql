-- Pool's day — 부산 공공 수영장 1차 배치 등록 (POOL_0141~0150, 10곳).
--
-- ## 시간표 출처 [1차 — 운영자 공식]
-- 부산 각 구 시설관리공단/도시공단/국민체육센터 + 부산시 체육시설관리사업소 공식 페이지의
-- 자유수영(일일입장) 안내에서 요일별 시간·요금 추출. 첨벙/swimmingis/blog 등 2차는 시간표·요금에 미사용.
-- 각 풀 schedule_source_url에 공식 페이지 명시.
--
-- ## 메타
-- - 좌표 [신뢰도 높음]: 카카오 Local API(주소/POI).
-- - 규격: 공식/2차(객관사실) 확인분만, 미확인 null. 사진 없음 → photo_url null.
-- - 주말만 운영(부산진구·사하·기장군국민)은 price_weekday null.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0141', '부산진구국민체육센터', '부산', '부산진구', '부산광역시 부산진구 진남로328번길 35',
    35.1553866779638, 129.073772711458, 'indoor', 'public',
    '051-710-7628', 'https://www.jsports.or.kr', null, 25, null, null,
    '{}', false, false, false,
    true, true, null, 3300, null, 'https://www.jsports.or.kr/bbs/content.php?co_id=03_03')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0141', '풀스데이', $${"토":[{"start":"15:00","end":"17:00","hours":2}],"일":[{"start":"11:00","end":"13:00","hours":2},{"start":"14:00","end":"16:00","hours":2}]}$$::jsonb, '{}'::jsonb, '2026-06-10'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0141' and exists (select 1 from public.schedules where pool_id = 'POOL_0141');

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0142', '동래구국민체육센터', '부산', '동래구', '부산광역시 동래구 미남로 110',
    35.2035983429256, 129.069836918781, 'indoor', 'public',
    '051-504-6640', 'https://sports.dongnae.go.kr', 6, 25, null, null,
    '{}', true, false, false,
    true, true, 3300, 3300, null, 'https://sports.dongnae.go.kr/subpage/index/23')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0142', '풀스데이', $${"월":[{"start":"09:00","end":"11:00","hours":2},{"start":"12:00","end":"14:00","hours":2},{"start":"15:00","end":"17:00","hours":2}],"화":[{"start":"09:00","end":"11:00","hours":2},{"start":"12:00","end":"14:00","hours":2},{"start":"15:00","end":"17:00","hours":2}],"수":[{"start":"09:00","end":"11:00","hours":2},{"start":"12:00","end":"14:00","hours":2},{"start":"15:00","end":"17:00","hours":2}],"목":[{"start":"09:00","end":"11:00","hours":2},{"start":"12:00","end":"14:00","hours":2},{"start":"15:00","end":"17:00","hours":2}],"금":[{"start":"09:00","end":"11:00","hours":2},{"start":"12:00","end":"14:00","hours":2},{"start":"15:00","end":"17:00","hours":2}],"토":[{"start":"09:00","end":"11:00","hours":2},{"start":"12:00","end":"14:00","hours":2},{"start":"15:00","end":"17:00","hours":2}],"일":[{"start":"09:00","end":"11:00","hours":2},{"start":"12:00","end":"14:00","hours":2},{"start":"15:00","end":"17:00","hours":2}]}$$::jsonb, '{}'::jsonb, '2026-06-10'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0142' and exists (select 1 from public.schedules where pool_id = 'POOL_0142');

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0143', '해운대생활체육센터', '부산', '해운대구', '부산광역시 해운대구 세실로 137',
    35.1768799855435, 129.175944948614, 'indoor', 'public',
    '051-704-8704', 'http://www.haeundaeswim.com/', null, 25, null, null,
    '{}', false, false, false,
    true, true, 2500, 2500, null, 'http://www.haeundaeswim.com/bbs/board.php?bo_table=notice&wr_id=5')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0143', '풀스데이', $${"화":[{"start":"13:00","end":"18:00","hours":5}],"수":[{"start":"13:00","end":"18:00","hours":5}],"목":[{"start":"13:00","end":"18:00","hours":5}],"금":[{"start":"13:00","end":"18:00","hours":5}],"토":[{"start":"06:00","end":"08:00","hours":2},{"start":"09:00","end":"17:00","hours":8}],"일":[{"start":"09:00","end":"17:00","hours":8}]}$$::jsonb, '{}'::jsonb, '2026-06-10'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0143' and exists (select 1 from public.schedules where pool_id = 'POOL_0143');

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0144', '금정국민체육센터', '부산', '금정구', '부산광역시 금정구 서부로 109',
    35.219447403959, 129.096142463588, 'indoor', 'public',
    '051-519-4741', 'https://www.gjsports.go.kr/', null, 25, null, null,
    '{}', false, false, false,
    true, true, 3400, 3400, null, 'https://www.gjsports.go.kr/bbs/content.php?co_id=02_04')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0144', '풀스데이', $${"월":[{"start":"13:00","end":"15:50","hours":2.83}],"화":[{"start":"14:00","end":"14:50","hours":0.83}],"수":[{"start":"13:00","end":"15:50","hours":2.83}],"목":[{"start":"14:00","end":"14:50","hours":0.83}],"금":[{"start":"13:00","end":"15:50","hours":2.83}],"토":[{"start":"15:20","end":"17:20","hours":2}],"일":[{"start":"09:00","end":"11:30","hours":2.5},{"start":"13:00","end":"15:00","hours":2},{"start":"15:20","end":"17:20","hours":2}]}$$::jsonb, '{}'::jsonb, '2026-06-10'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0144' and exists (select 1 from public.schedules where pool_id = 'POOL_0144');

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0145', '강서체육공원실내수영장', '부산', '강서구', '부산광역시 강서구 체육공원로 43',
    35.210959604558, 128.972212954062, 'indoor', 'public',
    '051-970-1253', 'https://www.busan.go.kr/stadium/sfstadiumgsswim01', 6, 25, null, null,
    '{}', true, false, false,
    true, true, 2700, 2700, null, 'https://www.busan.go.kr/stadium/freeswim03')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0145', '풀스데이', $${"화":[{"start":"06:00","end":"08:30","hours":2.5},{"start":"09:00","end":"11:50","hours":2.83},{"start":"13:30","end":"16:30","hours":3},{"start":"17:00","end":"19:50","hours":2.83}],"수":[{"start":"06:00","end":"08:30","hours":2.5},{"start":"09:00","end":"11:50","hours":2.83},{"start":"13:30","end":"16:30","hours":3},{"start":"17:00","end":"19:50","hours":2.83}],"목":[{"start":"06:00","end":"08:30","hours":2.5},{"start":"09:00","end":"11:50","hours":2.83},{"start":"13:30","end":"16:30","hours":3},{"start":"17:00","end":"19:50","hours":2.83}],"금":[{"start":"06:00","end":"08:30","hours":2.5},{"start":"09:00","end":"11:50","hours":2.83},{"start":"13:30","end":"16:30","hours":3},{"start":"17:00","end":"19:50","hours":2.83}],"토":[{"start":"06:00","end":"08:30","hours":2.5},{"start":"09:00","end":"11:50","hours":2.83},{"start":"13:30","end":"16:30","hours":3},{"start":"17:00","end":"19:50","hours":2.83}],"일":[{"start":"06:00","end":"08:30","hours":2.5},{"start":"09:00","end":"11:50","hours":2.83},{"start":"13:30","end":"16:30","hours":3},{"start":"17:00","end":"17:50","hours":0.83}]}$$::jsonb, '{}'::jsonb, '2026-06-10'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0145' and exists (select 1 from public.schedules where pool_id = 'POOL_0145');

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0146', '사하구국민체육센터', '부산', '사하구', '부산광역시 사하구 감천로 68',
    35.0894350085711, 128.998877621366, 'indoor', 'public',
    '051-202-3800', 'https://www.sahaksports.or.kr/', null, null, null, null,
    '{}', false, false, false,
    true, true, null, 5000, null, 'https://sahaksports.or.kr/saha/192')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0146', '풀스데이', $${"토":[{"start":"09:00","end":"11:50","hours":2.83},{"start":"14:00","end":"16:30","hours":2.5}],"일":[{"start":"09:00","end":"11:50","hours":2.83},{"start":"14:00","end":"16:30","hours":2.5}]}$$::jsonb, '{}'::jsonb, '2026-06-10'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0146' and exists (select 1 from public.schedules where pool_id = 'POOL_0146');

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0147', '부산국민체육센터', '부산', '서구', '부산광역시 서구 대신로 150',
    35.1173241892258, 129.015769555162, 'indoor', 'public',
    '051-243-5959', 'https://www.bnsc.or.kr', null, null, null, null,
    '{}', false, false, false,
    true, true, 3400, 3400, null, 'https://www.bnsc.or.kr/bbs/content.php?co_id=02_04')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0147', '풀스데이', $${"월":[{"start":"17:00","end":"17:50","hours":0.83}],"화":[{"start":"17:00","end":"17:50","hours":0.83}],"수":[{"start":"17:00","end":"17:50","hours":0.83}],"목":[{"start":"17:00","end":"17:50","hours":0.83}],"금":[{"start":"17:00","end":"17:50","hours":0.83}],"토":[{"start":"09:00","end":"11:00","hours":2},{"start":"14:00","end":"16:30","hours":2.5}]}$$::jsonb, '{}'::jsonb, '2026-06-10'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0147' and exists (select 1 from public.schedules where pool_id = 'POOL_0147');

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0148', '영도국민체육센터', '부산', '영도구', '부산광역시 영도구 함지로79번길 6',
    35.0752653795657, 129.066858950494, 'indoor', 'public',
    '051-405-0050', 'https://www.ydsports.org', null, null, null, null,
    '{}', false, false, false,
    true, true, 3300, 3300, null, 'https://www.ydsports.org/content/02_03')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0148', '풀스데이', $${"화":[{"start":"13:00","end":"14:30","hours":1.5}],"목":[{"start":"13:00","end":"14:30","hours":1.5}],"토":[{"start":"13:00","end":"14:30","hours":1.5}]}$$::jsonb, '{}'::jsonb, '2026-06-10'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0148' and exists (select 1 from public.schedules where pool_id = 'POOL_0148');

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0149', '기장생활체육센터', '부산', '기장군', '부산광역시 기장군 기장읍 차천로109번길 24',
    35.243691135149, 129.208188618782, 'indoor', 'public',
    '051-792-4790', 'https://www.gijangcmc.or.kr/gjspo/', 6, 25, null, 1.4,
    '{}', true, false, false,
    true, true, 2000, 2000, null, 'https://www.gijangcmc.or.kr/gjspo/02_guide/01_guide3.asp')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0149', '풀스데이', $${"월":[{"start":"06:00","end":"08:00","hours":2}],"화":[{"start":"09:00","end":"11:00","hours":2},{"start":"12:30","end":"14:30","hours":2},{"start":"15:00","end":"17:00","hours":2}],"수":[{"start":"09:00","end":"11:00","hours":2},{"start":"12:30","end":"14:30","hours":2},{"start":"15:00","end":"17:00","hours":2}],"목":[{"start":"09:00","end":"11:00","hours":2},{"start":"12:30","end":"14:30","hours":2},{"start":"15:00","end":"17:00","hours":2}],"금":[{"start":"09:00","end":"11:00","hours":2},{"start":"12:30","end":"14:30","hours":2},{"start":"15:00","end":"17:00","hours":2}],"토":[{"start":"09:00","end":"11:00","hours":2},{"start":"12:30","end":"17:00","hours":4.5}],"일":[{"start":"09:00","end":"11:00","hours":2},{"start":"12:30","end":"17:00","hours":4.5}]}$$::jsonb, '{}'::jsonb, '2026-06-10'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0149' and exists (select 1 from public.schedules where pool_id = 'POOL_0149');

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0150', '기장군국민체육센터', '부산', '기장군', '부산광역시 기장군 일광읍 체육공원1로 29',
    35.3049746328707, 129.242850043344, 'indoor', 'public',
    '051-792-4770', 'https://www.gijangcmc.or.kr/gmspo/', null, null, null, null,
    '{}', false, false, false,
    true, true, null, 2000, null, 'https://www.gijangcmc.or.kr/gmspo/02_guide/02_guide3.asp')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0150', '풀스데이', $${"토":[{"start":"06:00","end":"08:00","hours":2},{"start":"09:00","end":"11:00","hours":2},{"start":"12:30","end":"14:30","hours":2},{"start":"15:00","end":"17:00","hours":2}],"일":[{"start":"09:00","end":"11:00","hours":2},{"start":"12:30","end":"14:30","hours":2},{"start":"15:00","end":"17:00","hours":2}]}$$::jsonb, '{}'::jsonb, '2026-06-10'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0150' and exists (select 1 from public.schedules where pool_id = 'POOL_0150');
