-- Pool's day — 영남(울산·경남·경북·대구) 공공 수영장 배치 등록 (POOL_0506~0531, 26곳).
--
-- ## 시간표 출처 [1차 — 운영자 공식]
-- 각 시·군·구 시설관리공단/도시공사/국민체육센터/시민·군민체육센터 공식 페이지의
-- "자유수영(자율수영·일일입장)" 안내에서 요일별 시간·요금 추출. 강습·정화·식사시간 제외.
-- 첨벙/블로그/맘카페 등 2차는 시간표·요금에 미사용. 각 풀 schedule_source_url에 공식 페이지 명시.
--
-- ## 메타
-- - 좌표 [신뢰도 높음]: 카카오 Local API(POI/주소). 양산 2곳은 시설명 키워드로 위치 분리.
-- - 규격(레인·길이·수심): 공식/2차 객관사실 확인분만, 미확인 null. 사진 없음 → photo_url null.
-- - 주말만 운영(대구 성서·달서아트센터)은 price_weekday null. 양산 2곳·울주군은 요금이
--   이미지 게시라 확인 불가 → price null(추정 금지).
-- - 부산은 공공센터 사이트가 전부 JS 예약시스템이라 공식 시간표 본문 취득 불가 → 이번 배치 제외.
--
-- ## prod 적용
-- db push 금지. scripts/apply-sql-prod.mjs 로 prod 직접 적용(멱등, on conflict do nothing).

-- 1) 중구수영장 (울산 중구)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0506', '중구수영장', '울산', '중구', '울산광역시 중구 종가로 305',
    35.5649648471875, 129.30911143208, 'indoor', 'public',
    '052-290-7670', 'https://swim.ujcmc.or.kr/', 8, 25, 1.35, 1.45,
    '{}', true, false, false,
    true, true, 5000, 5000, null, 'https://crs.ujcmc.or.kr/etc/facility_info01.jsp')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0506', '풀스데이', $${"화":[{"start":"06:00","end":"21:50","hours":15.83}],"수":[{"start":"06:00","end":"21:50","hours":15.83}],"목":[{"start":"06:00","end":"21:50","hours":15.83}],"금":[{"start":"06:00","end":"21:50","hours":15.83}],"토":[{"start":"12:00","end":"16:00","hours":4}],"일":[{"start":"12:00","end":"16:00","hours":4}]}$$::jsonb, $${"토":"입장 11:40부터, 현장 선착순 80명","일":"현장 선착순 80명"}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0506' and exists (select 1 from public.schedules where pool_id = 'POOL_0506');

-- 2) 동구국민체육센터 (울산 동구)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0507', '동구국민체육센터', '울산', '동구', '울산광역시 동구 봉수로 155',
    35.5035310267664, 129.416406177445, 'indoor', 'public',
    '052-209-3000', 'https://www.donggu.ulsan.kr/donggu/contents/contents.do?mId=7040201', 6, 25, null, null,
    '{}', false, false, false,
    true, true, 2500, 2500, null, 'https://www.donggu.ulsan.kr/donggu/contents/contents.do?mId=7040201')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0507', '풀스데이', $${"화":[{"start":"06:00","end":"08:00","hours":2},{"start":"12:00","end":"22:00","hours":10}],"수":[{"start":"06:00","end":"08:00","hours":2},{"start":"12:00","end":"22:00","hours":10}],"목":[{"start":"06:00","end":"08:00","hours":2},{"start":"12:00","end":"22:00","hours":10}],"금":[{"start":"06:00","end":"08:00","hours":2},{"start":"12:00","end":"22:00","hours":10}],"토":[{"start":"06:00","end":"19:00","hours":13}],"일":[{"start":"06:00","end":"19:00","hours":13}]}$$::jsonb, $${"화":"평일 08:00~12:00 강습으로 자유수영 불가"}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0507' and exists (select 1 from public.schedules where pool_id = 'POOL_0507');

-- 3) 울주군국민체육센터 (울산 울주군)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0508', '울주군국민체육센터', '울산', '울주군', '울산광역시 울주군 범서읍 구영로 101-16',
    35.5745095414357, 129.244905329842, 'indoor', 'public',
    '052-229-9200', 'https://www.uljusiseol.or.kr/uljusports/', null, null, null, null,
    '{}', true, false, false,
    true, true, null, null, null, 'https://www.uljusiseol.or.kr/uljusports/04_Menu/01.jsp')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0508', '풀스데이', $${"월":[{"start":"06:00","end":"08:00","hours":2},{"start":"16:00","end":"21:30","hours":5.5}],"화":[{"start":"06:00","end":"08:00","hours":2},{"start":"16:00","end":"21:30","hours":5.5}],"수":[{"start":"06:00","end":"08:00","hours":2},{"start":"16:00","end":"21:30","hours":5.5}],"목":[{"start":"06:00","end":"08:00","hours":2},{"start":"16:00","end":"21:30","hours":5.5}],"금":[{"start":"06:00","end":"08:00","hours":2},{"start":"16:00","end":"21:30","hours":5.5}],"토":[{"start":"09:00","end":"12:30","hours":3.5},{"start":"13:30","end":"17:30","hours":4}],"일":[{"start":"09:00","end":"12:30","hours":3.5},{"start":"13:30","end":"17:30","hours":4}]}$$::jsonb, $${"토":"수질정화 12:30~13:30 휴장","일":"수질정화 12:30~13:30 휴장"}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0508' and exists (select 1 from public.schedules where pool_id = 'POOL_0508');

-- 4) 창원실내수영장 (경남 창원시)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0509', '창원실내수영장', '경남', '창원시', '경상남도 창원시 성산구 원이대로 450',
    35.2319043844647, 128.669917191776, 'indoor', 'public',
    '055-712-0114', 'https://www.cwsisul.or.kr/_chinswimr/', 10, 50, 1.0, 1.8,
    '{}', true, true, false,
    true, true, 4000, 4000, null, 'https://www.cwsisul.or.kr/_chinswimr/_sub02/sub02_01.html')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0509', '풀스데이', $${"월":[{"start":"06:00","end":"21:00","hours":15}],"화":[{"start":"06:00","end":"21:00","hours":15}],"수":[{"start":"06:00","end":"21:00","hours":15}],"목":[{"start":"06:00","end":"21:00","hours":15}],"금":[{"start":"06:00","end":"21:00","hours":15}],"토":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"18:00","hours":5}],"일":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"18:00","hours":5}]}$$::jsonb, $${"토":"12:00~13:00 휴장","일":"12:00~13:00 휴장, 매월 2·4째주 일요일 휴관"}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0509' and exists (select 1 from public.schedules where pool_id = 'POOL_0509');

-- 5) 내서스포츠센터 (경남 창원시)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0510', '내서스포츠센터', '경남', '창원시', '경상남도 창원시 마산회원구 호원로 177',
    35.24975874313433, 128.5215453596681, 'indoor', 'public',
    '055-210-8150', 'https://www.cwsisul.or.kr/_msnssports/', 6, 25, null, null,
    '{}', true, false, false,
    true, true, 3500, 3500, null, 'https://www.cwsisul.or.kr/_msnssports/_sub03/sub03_01.html')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0510', '풀스데이', $${"월":[{"start":"08:00","end":"09:00","hours":1},{"start":"11:00","end":"19:00","hours":8}],"화":[{"start":"08:00","end":"09:00","hours":1},{"start":"11:00","end":"19:00","hours":8}],"수":[{"start":"08:00","end":"09:00","hours":1},{"start":"11:00","end":"19:00","hours":8}],"목":[{"start":"08:00","end":"09:00","hours":1},{"start":"11:00","end":"19:00","hours":8}],"금":[{"start":"08:00","end":"09:00","hours":1},{"start":"11:00","end":"19:00","hours":8}],"토":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"17:00","hours":4}],"일":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"17:00","hours":4}]}$$::jsonb, $${"토":"12:00~13:00 휴장","일":"12:00~13:00 휴장"}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0510' and exists (select 1 from public.schedules where pool_id = 'POOL_0510');

-- 6) 용원국민체육센터 (경남 창원시)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0511', '용원국민체육센터', '경남', '창원시', '경상남도 창원시 진해구 안청로 95',
    35.10676377946133, 128.8028710171513, 'indoor', 'public',
    '055-712-0880', 'https://www.cwsisul.or.kr/_jhywgymc/', 6, 25, null, null,
    '{}', true, false, false,
    true, true, 3500, 3500, null, 'https://www.cwsisul.or.kr/_jhywgymc/_sub02/sub02_01.html')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0511', '풀스데이', $${"월":[{"start":"08:00","end":"09:00","hours":1},{"start":"11:00","end":"18:50","hours":7.83}],"화":[{"start":"08:00","end":"09:00","hours":1},{"start":"11:00","end":"18:50","hours":7.83}],"수":[{"start":"08:00","end":"09:00","hours":1},{"start":"11:00","end":"18:50","hours":7.83}],"목":[{"start":"08:00","end":"09:00","hours":1},{"start":"11:00","end":"18:50","hours":7.83}],"금":[{"start":"08:00","end":"09:00","hours":1},{"start":"11:00","end":"18:50","hours":7.83}],"토":[{"start":"06:10","end":"12:00","hours":5.83},{"start":"13:00","end":"17:50","hours":4.83}],"일":[{"start":"06:10","end":"12:00","hours":5.83},{"start":"13:00","end":"17:50","hours":4.83}]}$$::jsonb, $${"토":"12:00~13:00 휴장","일":"12:00~13:00 휴장"}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0511' and exists (select 1 from public.schedules where pool_id = 'POOL_0511');

-- 7) 동부스포츠센터 (경남 김해시)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0512', '동부스포츠센터', '경남', '김해시', '경상남도 김해시 신어산길 44',
    35.25660658054888, 128.9057332257225, 'indoor', 'public',
    '055-336-9318', 'https://ghdc.or.kr/sports/fmcs/130', 6, 25, 1.3, 1.3,
    '{}', true, false, false,
    true, true, 3500, 3500, null, 'https://ghdc.or.kr/sports/fmcs/130')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0512', '풀스데이', $${"월":[{"start":"07:00","end":"08:50","hours":1.83},{"start":"13:00","end":"15:50","hours":2.83},{"start":"18:00","end":"21:50","hours":3.83}],"화":[{"start":"07:00","end":"08:50","hours":1.83},{"start":"13:00","end":"15:50","hours":2.83},{"start":"18:00","end":"21:50","hours":3.83}],"수":[{"start":"07:00","end":"08:50","hours":1.83},{"start":"13:00","end":"15:50","hours":2.83},{"start":"18:00","end":"21:50","hours":3.83}],"목":[{"start":"07:00","end":"08:50","hours":1.83},{"start":"13:00","end":"15:50","hours":2.83},{"start":"18:00","end":"21:50","hours":3.83}],"금":[{"start":"07:00","end":"08:50","hours":1.83},{"start":"13:00","end":"15:50","hours":2.83},{"start":"18:00","end":"21:50","hours":3.83}],"토":[{"start":"06:00","end":"11:30","hours":5.5},{"start":"13:00","end":"17:00","hours":4}],"일":[{"start":"09:00","end":"11:30","hours":2.5},{"start":"13:00","end":"17:00","hours":4}]}$$::jsonb, '{}'::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0512' and exists (select 1 from public.schedules where pool_id = 'POOL_0512');

-- 8) 장유스포츠센터 (경남 김해시)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0513', '장유스포츠센터', '경남', '김해시', '경상남도 김해시 번화2로 72',
    35.1957379747813, 128.804953850406, 'indoor', 'public',
    '055-312-8445', 'https://ghdc.or.kr/sports/fmcs/121', 6, 25, 1.2, 1.4,
    '{}', true, false, false,
    true, true, 3500, 3500, null, 'https://ghdc.or.kr/sports/fmcs/121')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0513', '풀스데이', $${"월":[{"start":"07:00","end":"09:00","hours":2},{"start":"11:30","end":"12:30","hours":1},{"start":"14:30","end":"16:00","hours":1.5},{"start":"19:00","end":"21:00","hours":2}],"화":[{"start":"07:00","end":"09:00","hours":2},{"start":"11:30","end":"12:30","hours":1},{"start":"13:00","end":"16:00","hours":3},{"start":"19:00","end":"21:00","hours":2}],"수":[{"start":"07:00","end":"09:00","hours":2},{"start":"11:30","end":"12:30","hours":1},{"start":"14:30","end":"16:00","hours":1.5},{"start":"19:00","end":"21:00","hours":2}],"목":[{"start":"07:00","end":"09:00","hours":2},{"start":"11:30","end":"12:30","hours":1},{"start":"13:00","end":"16:00","hours":3},{"start":"19:00","end":"21:00","hours":2}],"금":[{"start":"07:00","end":"09:00","hours":2},{"start":"11:30","end":"12:30","hours":1},{"start":"14:30","end":"16:00","hours":1.5},{"start":"19:00","end":"21:00","hours":2}],"토":[{"start":"06:00","end":"11:30","hours":5.5},{"start":"13:00","end":"17:00","hours":4}],"일":[{"start":"09:00","end":"11:30","hours":2.5},{"start":"13:00","end":"17:00","hours":4}]}$$::jsonb, $${"일":"매월 2·4째주 일요일·공휴일 휴관"}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0513' and exists (select 1 from public.schedules where pool_id = 'POOL_0513');

-- 9) 진영스포츠센터 (경남 김해시)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0514', '진영스포츠센터', '경남', '김해시', '경상남도 김해시 진영읍 김해대로 253',
    35.30821317714224, 128.7171857039645, 'indoor', 'public',
    '055-344-2800', 'https://ghdc.or.kr/sports/fmcs/134', null, 25, null, null,
    '{}', true, false, false,
    true, true, 3500, 3500, null, 'https://ghdc.or.kr/sports/fmcs/134')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0514', '풀스데이', $${"월":[{"start":"06:00","end":"09:00","hours":3},{"start":"11:00","end":"12:00","hours":1},{"start":"13:00","end":"16:00","hours":3},{"start":"19:00","end":"21:00","hours":2}],"화":[{"start":"06:00","end":"09:00","hours":3},{"start":"11:00","end":"12:00","hours":1},{"start":"13:00","end":"16:00","hours":3},{"start":"19:00","end":"21:00","hours":2}],"수":[{"start":"06:00","end":"09:00","hours":3},{"start":"11:00","end":"12:00","hours":1},{"start":"13:00","end":"16:00","hours":3},{"start":"19:00","end":"21:00","hours":2}],"목":[{"start":"06:00","end":"09:00","hours":3},{"start":"11:00","end":"12:00","hours":1},{"start":"13:00","end":"16:00","hours":3},{"start":"19:00","end":"21:00","hours":2}],"금":[{"start":"06:00","end":"09:00","hours":3},{"start":"11:00","end":"12:00","hours":1},{"start":"13:00","end":"16:00","hours":3},{"start":"19:00","end":"21:00","hours":2}],"토":[{"start":"06:00","end":"11:30","hours":5.5},{"start":"13:00","end":"17:00","hours":4}],"일":[{"start":"09:00","end":"11:30","hours":2.5},{"start":"13:00","end":"17:00","hours":4}]}$$::jsonb, '{}'::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0514' and exists (select 1 from public.schedules where pool_id = 'POOL_0514');

-- 10) 해동이국민체육센터 (경남 김해시)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0515', '해동이국민체육센터', '경남', '김해시', '경상남도 김해시 삼계로 136',
    35.2626487142841, 128.877513692785, 'indoor', 'public',
    '055-311-9265', 'https://ghdc.or.kr/sports/fmcs/15', 5, null, null, null,
    '{}', true, false, false,
    true, true, 3500, 3500, null, 'https://ghdc.or.kr/sports/fmcs/15')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0515', '풀스데이', $${"월":[{"start":"08:00","end":"09:20","hours":1.33},{"start":"13:00","end":"16:00","hours":3},{"start":"18:00","end":"19:00","hours":1}],"화":[{"start":"08:00","end":"09:20","hours":1.33},{"start":"13:00","end":"16:00","hours":3},{"start":"18:00","end":"19:00","hours":1}],"수":[{"start":"08:00","end":"09:20","hours":1.33},{"start":"13:00","end":"16:00","hours":3},{"start":"18:00","end":"19:00","hours":1}],"목":[{"start":"08:00","end":"09:20","hours":1.33},{"start":"13:00","end":"16:00","hours":3},{"start":"18:00","end":"19:00","hours":1}],"금":[{"start":"08:00","end":"09:20","hours":1.33},{"start":"13:00","end":"16:00","hours":3},{"start":"18:00","end":"19:00","hours":1}],"토":[{"start":"06:00","end":"09:00","hours":3},{"start":"10:00","end":"13:00","hours":3},{"start":"14:00","end":"17:00","hours":3}],"일":[{"start":"09:00","end":"11:30","hours":2.5},{"start":"13:00","end":"17:00","hours":4}]}$$::jsonb, '{}'::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0515' and exists (select 1 from public.schedules where pool_id = 'POOL_0515');

-- 11) 양산중앙국민체육센터 (경남 양산시)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0516', '양산중앙국민체육센터', '경남', '양산시', '경상남도 양산시 강변로 322',
    35.32703107785462, 128.9946647380767, 'indoor', 'public',
    '055-379-8650', 'https://www.yssisul.or.kr/stms/ks', 6, 25, 1.2, 1.5,
    '{}', true, false, false,
    true, true, null, null, null, 'https://www.yssisul.or.kr/stms/ks/freeSwim')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0516', '풀스데이', $${"월":[{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"15:40","hours":3.67}],"화":[{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"15:40","hours":3.67}],"수":[{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"15:40","hours":3.67}],"목":[{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"15:40","hours":3.67}],"금":[{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"15:40","hours":3.67}],"토":[{"start":"09:00","end":"11:30","hours":2.5},{"start":"13:10","end":"15:10","hours":2},{"start":"15:40","end":"17:30","hours":1.83}],"일":[{"start":"09:00","end":"11:30","hours":2.5},{"start":"13:10","end":"15:10","hours":2},{"start":"15:40","end":"17:30","hours":1.83}]}$$::jsonb, $${"일":"매월 1·3째주 일요일 휴관"}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0516' and exists (select 1 from public.schedules where pool_id = 'POOL_0516');

-- 12) 천성산국민체육센터 (경남 양산시)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0517', '천성산국민체육센터', '경남', '양산시', '경상남도 양산시 상북면 석계리 35-1',
    35.41868421030933, 129.06612428171724, 'indoor', 'public',
    '055-379-8420', 'https://www.yssisul.or.kr/stms/yscheonsungsan', 5, 25, 1.3, 1.3,
    '{}', false, false, false,
    true, true, null, null, null, 'https://www.yssisul.or.kr/stms/yscheonsungsan/freeswim')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0517', '풀스데이', $${"월":[{"start":"08:00","end":"08:55","hours":0.92},{"start":"11:10","end":"14:10","hours":3},{"start":"15:00","end":"17:00","hours":2}],"화":[{"start":"08:00","end":"08:55","hours":0.92},{"start":"11:10","end":"14:10","hours":3},{"start":"15:00","end":"17:00","hours":2}],"수":[{"start":"08:00","end":"08:55","hours":0.92},{"start":"11:10","end":"14:10","hours":3},{"start":"15:00","end":"17:00","hours":2}],"목":[{"start":"08:00","end":"08:55","hours":0.92},{"start":"11:10","end":"14:10","hours":3},{"start":"15:00","end":"17:00","hours":2}],"금":[{"start":"08:00","end":"08:55","hours":0.92},{"start":"11:10","end":"14:10","hours":3},{"start":"15:00","end":"17:00","hours":2}],"토":[{"start":"09:00","end":"11:30","hours":2.5},{"start":"13:10","end":"15:10","hours":2},{"start":"15:40","end":"17:30","hours":1.83}],"일":[{"start":"09:00","end":"11:30","hours":2.5},{"start":"13:10","end":"15:10","hours":2},{"start":"15:40","end":"17:30","hours":1.83}]}$$::jsonb, '{}'::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0517' and exists (select 1 from public.schedules where pool_id = 'POOL_0517');

-- 13) 진주국민체육센터 (경남 진주시)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0518', '진주국민체육센터', '경남', '진주시', '경상남도 진주시 남강로 1655',
    35.208725360761306, 128.1250181563159, 'indoor', 'public',
    '055-757-3886', 'https://jinjusports.or.kr/?w=prog_jinjuswim', 6, 25, 1.2, 1.5,
    '{}', false, false, false,
    true, true, 3000, 3000, null, 'https://jinjusports.or.kr/?w=prog_jinjuswim')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0518', '풀스데이', $${"월":[{"start":"08:00","end":"09:20","hours":1.33},{"start":"11:30","end":"14:50","hours":3.33},{"start":"17:00","end":"18:50","hours":1.83},{"start":"21:00","end":"21:30","hours":0.5}],"화":[{"start":"08:00","end":"09:20","hours":1.33},{"start":"11:30","end":"14:50","hours":3.33},{"start":"17:00","end":"18:50","hours":1.83},{"start":"21:00","end":"21:30","hours":0.5}],"수":[{"start":"08:00","end":"09:20","hours":1.33},{"start":"11:30","end":"14:50","hours":3.33},{"start":"17:00","end":"18:50","hours":1.83},{"start":"21:00","end":"21:30","hours":0.5}],"목":[{"start":"08:00","end":"09:20","hours":1.33},{"start":"11:30","end":"14:50","hours":3.33},{"start":"17:00","end":"18:50","hours":1.83},{"start":"21:00","end":"21:30","hours":0.5}],"금":[{"start":"08:00","end":"09:20","hours":1.33},{"start":"11:30","end":"14:50","hours":3.33},{"start":"17:00","end":"18:50","hours":1.83},{"start":"21:00","end":"21:30","hours":0.5}],"토":[{"start":"08:00","end":"18:50","hours":10.83},{"start":"21:00","end":"21:30","hours":0.5}],"일":[{"start":"06:00","end":"12:30","hours":6.5},{"start":"14:00","end":"17:30","hours":3.5}]}$$::jsonb, $${"일":"점심시간 12:30~14:00 입장불가"}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0518' and exists (select 1 from public.schedules where pool_id = 'POOL_0518');

-- 14) 사천시실내수영장 (경남 사천시)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0519', '사천시실내수영장', '경남', '사천시', '경상남도 사천시 사천대로 20',
    34.9422843937592, 128.090358960327, 'indoor', 'public',
    '055-831-7240', 'https://www.scfmc.or.kr/sub2_5', null, 50, 1.3, 1.5,
    '{}', false, false, false,
    true, true, 4000, 4000, null, 'https://www.scfmc.or.kr/sub2_5')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0519', '풀스데이', $${"월":[{"start":"06:00","end":"11:50","hours":5.83},{"start":"13:00","end":"19:50","hours":6.83}],"화":[{"start":"06:00","end":"11:50","hours":5.83},{"start":"13:00","end":"19:50","hours":6.83}],"수":[{"start":"06:00","end":"11:50","hours":5.83},{"start":"13:00","end":"19:50","hours":6.83}],"목":[{"start":"06:00","end":"11:50","hours":5.83},{"start":"13:00","end":"19:50","hours":6.83}],"금":[{"start":"06:00","end":"11:50","hours":5.83},{"start":"13:00","end":"19:50","hours":6.83}],"토":[{"start":"06:00","end":"11:50","hours":5.83},{"start":"13:00","end":"16:50","hours":3.83}],"일":[{"start":"10:00","end":"11:50","hours":1.83},{"start":"13:00","end":"16:50","hours":3.83}]}$$::jsonb, $${"일":"공휴일 기준 1부 10:00~11:50, 2부 13:00~16:50"}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0519' and exists (select 1 from public.schedules where pool_id = 'POOL_0519');

-- 15) 거창스포츠파크국민체육센터수영장 (경남 거창군)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0520', '거창스포츠파크국민체육센터수영장', '경남', '거창군', '경상남도 거창군 거창읍 심소정길 39-36',
    35.6951358075642, 127.926350536293, 'indoor', 'public',
    '055-940-8775', 'https://www.geochang.go.kr/sports/Index.do?c=SP0201020400', null, null, null, null,
    '{}', false, false, false,
    true, true, 2500, 2500, null, 'https://www.geochang.go.kr/02149/02170.web')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0520', '풀스데이', $${"화":[{"start":"06:00","end":"22:00","hours":16}],"수":[{"start":"06:00","end":"22:00","hours":16}],"목":[{"start":"06:00","end":"22:00","hours":16}],"금":[{"start":"06:00","end":"22:00","hours":16}],"토":[{"start":"06:00","end":"18:00","hours":12}],"일":[{"start":"06:00","end":"18:00","hours":12}]}$$::jsonb, $${"화":"입장마감 21시, 1회 2시간 이용","토":"입장마감 17시","일":"입장마감 17시"}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0520' and exists (select 1 from public.schedules where pool_id = 'POOL_0520');

-- 16) 통영산양수영장 (경남 통영시)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0521', '통영산양수영장', '경남', '통영시', '경상남도 통영시 산양읍 산양중앙로 100',
    34.8034838054769, 128.397588206727, 'indoor', 'public',
    '055-646-6842', 'https://corp.ttdc.kr/sports/sports01_7.aspx', null, null, null, null,
    '{}', false, false, false,
    true, true, 3500, 3500, null, 'https://corp.ttdc.kr/sports/sports01_7.aspx')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0521', '풀스데이', $${"월":[{"start":"10:00","end":"19:00","hours":9}],"화":[{"start":"10:00","end":"19:00","hours":9}],"수":[{"start":"10:00","end":"19:00","hours":9}],"목":[{"start":"10:00","end":"19:00","hours":9}],"일":[{"start":"10:00","end":"19:00","hours":9}]}$$::jsonb, $${"월":"금·토요일 휴장"}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0521' and exists (select 1 from public.schedules where pool_id = 'POOL_0521');

-- 17) 남해군국민체육센터실내수영장 (경남 남해군)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0522', '남해군국민체육센터실내수영장', '경남', '남해군', '경상남도 남해군 남해읍 화전로78번길 26',
    34.8375691172327, 127.8969064408, 'indoor', 'public',
    '055-860-3560', 'https://www.namhae.go.kr/reserve/Index.do?c=RE0201060000', 5, 25, null, null,
    '{}', false, false, false,
    true, true, 3500, 3500, null, 'https://www.namhae.go.kr/reserve/Index.do?c=RE0201060000')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0522', '풀스데이', $${"화":[{"start":"06:00","end":"11:40","hours":5.67},{"start":"13:00","end":"16:50","hours":3.83},{"start":"18:00","end":"21:40","hours":3.67}],"수":[{"start":"06:00","end":"11:40","hours":5.67},{"start":"13:00","end":"16:50","hours":3.83},{"start":"18:00","end":"21:40","hours":3.67}],"목":[{"start":"06:00","end":"11:40","hours":5.67},{"start":"13:00","end":"16:50","hours":3.83},{"start":"18:00","end":"21:40","hours":3.67}],"금":[{"start":"06:00","end":"11:40","hours":5.67},{"start":"13:00","end":"16:50","hours":3.83},{"start":"18:00","end":"21:40","hours":3.67}],"토":[{"start":"08:00","end":"11:40","hours":3.67},{"start":"13:00","end":"17:40","hours":4.67}],"일":[{"start":"08:00","end":"11:40","hours":3.67},{"start":"13:00","end":"17:40","hours":4.67}]}$$::jsonb, $${"화":"수질정화 12:00~13:00·17:00~18:00 입장불가, 1회 2시간"}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0522' and exists (select 1 from public.schedules where pool_id = 'POOL_0522');

-- 18) 포항수영장 (경북 포항시)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0523', '포항수영장', '경북', '포항시', '경상북도 포항시 남구 희망대로 810',
    36.00744505707035, 129.36141893461573, 'indoor', 'public',
    '054-280-9300', 'https://www.phsisul.org/sisul_15/main.do', 8, 50, 1.4, 1.8,
    '{}', false, false, false,
    true, true, 3000, 3000, null, 'https://www.phsisul.org/sisul_15/sub/info_3.do')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0523', '풀스데이', $${"월":[{"start":"05:50","end":"11:50","hours":6},{"start":"13:00","end":"20:50","hours":7.83}],"화":[{"start":"05:50","end":"11:50","hours":6},{"start":"13:00","end":"20:50","hours":7.83}],"수":[{"start":"05:50","end":"11:50","hours":6},{"start":"13:00","end":"20:50","hours":7.83}],"목":[{"start":"05:50","end":"11:50","hours":6},{"start":"13:00","end":"20:50","hours":7.83}],"금":[{"start":"05:50","end":"11:50","hours":6},{"start":"13:00","end":"20:50","hours":7.83}],"토":[{"start":"09:00","end":"11:00","hours":2},{"start":"13:00","end":"17:30","hours":4.5}]}$$::jsonb, $${"토":"공휴일도 동일 운영, 일요일 휴관"}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0523' and exists (select 1 from public.schedules where pool_id = 'POOL_0523');

-- 19) 경주국민체육센터 (경북 경주시)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0524', '경주국민체육센터', '경북', '경주시', '경상북도 경주시 유림로5번길 85-15',
    35.8790873831028, 129.217153191759, 'indoor', 'public',
    '054-750-8560', 'https://sports.gyeongju.go.kr/', 6, 25, null, null,
    '{}', true, false, false,
    true, true, 4600, 4600, null, 'https://sports.gyeongju.go.kr/fmcs/23')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0524', '풀스데이', $${"월":[{"start":"06:10","end":"12:00","hours":5.83},{"start":"13:00","end":"21:00","hours":8}],"화":[{"start":"06:10","end":"12:00","hours":5.83},{"start":"13:00","end":"21:00","hours":8}],"수":[{"start":"06:10","end":"12:00","hours":5.83},{"start":"13:00","end":"21:00","hours":8}],"목":[{"start":"06:10","end":"12:00","hours":5.83},{"start":"13:00","end":"21:00","hours":8}],"금":[{"start":"06:10","end":"12:00","hours":5.83},{"start":"13:00","end":"21:00","hours":8}],"토":[{"start":"07:00","end":"18:00","hours":11}]}$$::jsonb, $${"월":"수질정화 12:00~13:00 입장불가, 1회 2시간, 일요일 휴관"}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0524' and exists (select 1 from public.schedules where pool_id = 'POOL_0524');

-- 20) 들성생활체육센터 (경북 구미시)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0525', '들성생활체육센터', '경북', '구미시', '경상북도 구미시 고아읍 들성로 174-21',
    36.15726177886302, 128.3403091378482, 'indoor', 'public',
    '054-480-2150', 'https://www.gmuc.or.kr/sisul/page.do?mid=921', null, null, null, null,
    '{}', false, false, false,
    true, true, 3500, 3500, null, 'https://www.gmuc.or.kr/sisul/page.do?mid=921')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0525', '풀스데이', $${"월":[{"start":"06:00","end":"13:00","hours":7},{"start":"14:40","end":"21:30","hours":6.83}],"화":[{"start":"06:00","end":"13:00","hours":7},{"start":"14:40","end":"21:30","hours":6.83}],"수":[{"start":"06:00","end":"13:00","hours":7},{"start":"14:40","end":"21:30","hours":6.83}],"목":[{"start":"06:00","end":"13:00","hours":7},{"start":"14:40","end":"21:30","hours":6.83}],"금":[{"start":"06:00","end":"13:00","hours":7},{"start":"14:40","end":"21:30","hours":6.83}],"토":[{"start":"06:00","end":"13:00","hours":7},{"start":"14:00","end":"17:30","hours":3.5}],"일":[{"start":"09:00","end":"13:00","hours":4},{"start":"14:00","end":"17:30","hours":3.5}]}$$::jsonb, $${"일":"매월 2·4·5째주 일요일만 운영, 클리닝 13:00~14:00"}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0525' and exists (select 1 from public.schedules where pool_id = 'POOL_0525');

-- 21) 김천실내수영장 (경북 김천시)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0526', '김천실내수영장', '경북', '김천시', '경상북도 김천시 문당동 250',
    36.14422037422417, 128.08820027383837, 'indoor', 'public',
    '054-420-7900', 'https://www.gcfmc.or.kr/gcs_yeyak/fmcs/12', null, null, null, null,
    '{}', true, false, false,
    true, true, 5000, 5000, null, 'https://www.gcfmc.or.kr/gcs_yeyak/fmcs/12')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0526', '풀스데이', $${"화":[{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"14:50","hours":2.83},{"start":"17:00","end":"20:50","hours":3.83}],"수":[{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"14:50","hours":2.83},{"start":"17:00","end":"20:50","hours":3.83}],"목":[{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"14:50","hours":2.83},{"start":"17:00","end":"20:50","hours":3.83}],"금":[{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"14:50","hours":2.83},{"start":"17:00","end":"20:50","hours":3.83}],"토":[{"start":"06:00","end":"18:00","hours":12}],"일":[{"start":"06:00","end":"18:00","hours":12}]}$$::jsonb, $${"화":"매주 월요일 휴장"}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0526' and exists (select 1 from public.schedules where pool_id = 'POOL_0526');

-- 22) 영주실내수영장 (경북 영주시)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0527', '영주실내수영장', '경북', '영주시', '경상북도 영주시 대학로153번길 10',
    36.8100294955583, 128.60791011747799, 'indoor', 'public',
    '054-639-3920', 'https://www.yeongju.go.kr/swimmingpool/index.do', null, null, null, null,
    '{}', false, false, false,
    true, true, 3500, 3500, null, 'https://www.yeongju.go.kr/swimmingpool/page.do?mnu_uid=11088')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0527', '풀스데이', $${"월":[{"start":"08:00","end":"19:00","hours":11}],"화":[{"start":"08:00","end":"19:00","hours":11}],"수":[{"start":"08:00","end":"19:00","hours":11}],"목":[{"start":"08:00","end":"19:00","hours":11}],"금":[{"start":"08:00","end":"19:00","hours":11}],"토":[{"start":"06:00","end":"18:00","hours":12}]}$$::jsonb, $${"월":"18:30 이후 입장불가, 1회 2시간, 일요일 휴관"}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0527' and exists (select 1 from public.schedules where pool_id = 'POOL_0527');

-- 23) 문경국민체육센터 (경북 문경시)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0528', '문경국민체육센터', '경북', '문경시', '경상북도 문경시 점고길 30',
    36.5955002565236, 128.185519178867, 'indoor', 'public',
    '054-553-3107', 'http://www.mgtpcr.or.kr/web/page.do?menuIdx=383', 6, 25, null, null,
    '{}', true, false, false,
    true, true, 3000, 3000, null, 'http://www.mgtpcr.or.kr/web/page.do?menuIdx=384')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0528', '풀스데이', $${"월":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"21:00","hours":8}],"화":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"21:00","hours":8}],"수":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"21:00","hours":8}],"목":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"21:00","hours":8}],"금":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"21:00","hours":8}],"토":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"21:00","hours":8}]}$$::jsonb, $${"월":"12:00~13:00 청소 휴장, 1회 2시간, 일요일 휴관, 관외 5,000원"}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0528' and exists (select 1 from public.schedules where pool_id = 'POOL_0528');

-- 24) 성서국민체육센터 (대구 달서구)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0529', '성서국민체육센터', '대구', '달서구', '대구광역시 달서구 선원로 133',
    35.859545185581, 128.506913925745, 'indoor', 'public',
    '053-555-7330', 'https://www.spsc.or.kr/', 6, 25, null, null,
    '{}', false, false, false,
    true, true, null, 3500, null, 'https://www.spsc.or.kr/public/front/index.php?menu=010207')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0529', '풀스데이', $${"토":[{"start":"09:00","end":"17:30","hours":8.5}]}$$::jsonb, $${"토":"토·공휴일만 자유수영 운영(평일 없음), 입장 09:00~17:00"}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0529' and exists (select 1 from public.schedules where pool_id = 'POOL_0529');

-- 25) 올림픽기념국민생활관수영장 (대구 달서구)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0530', '올림픽기념국민생활관수영장', '대구', '달서구', '대구광역시 달서구 학산로 130',
    35.8331471821569, 128.540556669083, 'indoor', 'public',
    '053-634-8688', 'https://omc.dpfc.or.kr/', 7, 25, null, null,
    '{}', false, false, false,
    true, true, 3500, 3500, null, 'https://omc.dpfc.or.kr/05_cs/notice.php')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0530', '풀스데이', $${"월":[{"start":"15:00","end":"18:00","hours":3}],"화":[{"start":"15:00","end":"18:00","hours":3}],"수":[{"start":"15:00","end":"18:00","hours":3}],"목":[{"start":"15:00","end":"18:00","hours":3}],"금":[{"start":"15:00","end":"18:00","hours":3}],"토":[{"start":"13:00","end":"18:00","hours":5}]}$$::jsonb, $${"토":"공휴일은 09:00~18:00, 일요일 휴장"}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0530' and exists (select 1 from public.schedules where pool_id = 'POOL_0530');

-- 26) 달서아트센터수영장 (대구 달서구)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0531', '달서아트센터수영장', '대구', '달서구', '대구광역시 달서구 문화회관길 160',
    35.843269731574, 128.52239755467, 'indoor', 'public',
    '053-582-7332', 'https://www.dsac.or.kr/', null, null, null, null,
    '{}', false, false, false,
    true, true, null, 3500, null, 'https://www.dsac.or.kr/main/contents.do?idx=6011')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0531', '풀스데이', $${"토":[{"start":"09:00","end":"17:00","hours":8}]}$$::jsonb, $${"토":"토·공휴일만 자유수영 운영, 일요일 휴관"}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0531' and exists (select 1 from public.schedules where pool_id = 'POOL_0531');
