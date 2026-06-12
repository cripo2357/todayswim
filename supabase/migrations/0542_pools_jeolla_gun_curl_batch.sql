-- Pool's day — 전라도 군 추가 5곳 (POOL_0542~0546). curl 원본HTML + HWP OLE파싱 + 이미지판독으로
-- 이전 'JS렌더 미확보' 단정을 재시도해 확보([[dont_over_conclude_impossible]]).
-- 함평=게시판 HWP첨부 OLE파싱(2026.6 현재표), 구례=공식 HTML 시간표표(2024.2.5 시행) → granular 자유수영.
-- 화순·무주·장수=공식 운영시간(회차 grid 미게시)이라 운영시간 윈도우=자유수영으로 등록(블록형, [[city_expansion_busan]] 선례).
-- 고흥=카카오 POI 운영주체명 불일치로 보류. 좌표=카카오 Local API.

-- 1) 함평실내수영장 (전남 함평군) — HWP 추출 granular
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0542', '함평실내수영장', '전남', '함평군', '전라남도 함평군 대동면 향교리 147',
    35.0603383183227, 126.542972567292, 'indoor', 'public',
    '061-320-1809', 'https://www.hampyeong.go.kr', 7, 25, null, null,
    '{}', true, false, false,
    true, true, 3000, 3000, null, 'https://www.hampyeong.go.kr/boardView.do?pageId=www272&boardId=NOTICE&seq=6099264')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0542', '풀스데이', $${"화":[{"start":"06:00","end":"08:00","hours":2},{"start":"09:00","end":"11:30","hours":2.5},{"start":"13:00","end":"17:00","hours":4},{"start":"18:00","end":"20:00","hours":2}],"수":[{"start":"06:00","end":"08:00","hours":2},{"start":"09:00","end":"11:30","hours":2.5},{"start":"13:00","end":"17:00","hours":4},{"start":"18:00","end":"20:00","hours":2}],"목":[{"start":"06:00","end":"08:00","hours":2},{"start":"09:00","end":"11:30","hours":2.5},{"start":"13:00","end":"17:00","hours":4},{"start":"18:00","end":"20:00","hours":2}],"금":[{"start":"06:00","end":"08:00","hours":2},{"start":"09:00","end":"11:30","hours":2.5},{"start":"13:00","end":"17:00","hours":4},{"start":"18:00","end":"20:00","hours":2}],"토":[{"start":"09:00","end":"11:30","hours":2.5},{"start":"13:00","end":"17:00","hours":4}],"일":[{"start":"09:00","end":"11:30","hours":2.5},{"start":"13:00","end":"17:00","hours":4}]}$$::jsonb, '{}'::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0542' and exists (select 1 from public.schedules where pool_id = 'POOL_0542');

-- 2) 화순군민종합문화센터수영장 (전남 화순군) — 운영시간 윈도우
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0543', '화순군민종합문화센터수영장', '전남', '화순군', '전라남도 화순군 화순읍 광덕로 231',
    35.0656157139301, 126.991501419854, 'indoor', 'public',
    '061-379-3951', 'https://www.hwasun.go.kr', 6, 25, null, null,
    '{}', true, false, false,
    true, true, 4000, 4000, null, 'https://www.hwasun.go.kr/contents.do?S=S01&M=070503020000')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0543', '풀스데이', $${"화":[{"start":"06:00","end":"21:00","hours":15}],"수":[{"start":"06:00","end":"21:00","hours":15}],"목":[{"start":"06:00","end":"21:00","hours":15}],"금":[{"start":"06:00","end":"21:00","hours":15}],"토":[{"start":"06:00","end":"21:00","hours":15}],"일":[{"start":"09:00","end":"18:00","hours":9}]}$$::jsonb, '{}'::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0543' and exists (select 1 from public.schedules where pool_id = 'POOL_0543');

-- 3) 구례실내수영장 (전남 구례군) — 공식 HTML 시간표표 granular
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0544', '구례실내수영장', '전남', '구례군', '전라남도 구례군 구례읍 서시천로 106',
    35.2165881961162, 127.466864956363, 'indoor', 'public',
    '061-780-2549', 'https://www.gurye.go.kr', 6, 25, 1.4, 1.4,
    '{}', true, false, false,
    true, true, 2000, 2000, null, 'https://www.gurye.go.kr/kr/subPage.do?menuNo=117017002003')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0544', '풀스데이', $${"월":[{"start":"06:00","end":"08:00","hours":2},{"start":"09:00","end":"10:00","hours":1},{"start":"13:00","end":"17:00","hours":4},{"start":"18:00","end":"20:00","hours":2}],"화":[{"start":"06:00","end":"08:00","hours":2},{"start":"09:00","end":"10:00","hours":1},{"start":"13:00","end":"17:00","hours":4},{"start":"18:00","end":"20:00","hours":2}],"수":[{"start":"06:00","end":"08:00","hours":2},{"start":"09:00","end":"10:00","hours":1},{"start":"13:00","end":"17:00","hours":4},{"start":"18:00","end":"20:00","hours":2}],"목":[{"start":"06:00","end":"08:00","hours":2},{"start":"09:00","end":"10:00","hours":1},{"start":"13:00","end":"17:00","hours":4},{"start":"18:00","end":"20:00","hours":2}],"금":[{"start":"06:00","end":"08:00","hours":2},{"start":"09:00","end":"10:00","hours":1},{"start":"13:00","end":"17:00","hours":4},{"start":"18:00","end":"20:00","hours":2}],"토":[{"start":"06:00","end":"08:00","hours":2},{"start":"09:00","end":"10:00","hours":1},{"start":"13:00","end":"18:00","hours":5}]}$$::jsonb, '{}'::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0544' and exists (select 1 from public.schedules where pool_id = 'POOL_0544');

-- 4) 무주수달수영장 (전북 무주군) — 운영시간 윈도우, 요금 공식 미노출 null
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0545', '수달수영장', '전북', '무주군', '전북특별자치도 무주군 무주읍 한풍루로 326-17',
    36.0023020975959, 127.662680538826, 'indoor', 'public',
    '063-320-5614', 'https://tour.muju.go.kr', 6, 25, null, null,
    '{}', true, false, false,
    true, true, null, null, null, 'https://tour.muju.go.kr/yechae/contents.do?key=591')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0545', '풀스데이', $${"월":[{"start":"06:00","end":"21:00","hours":15}],"화":[{"start":"06:00","end":"21:00","hours":15}],"수":[{"start":"06:00","end":"21:00","hours":15}],"목":[{"start":"06:00","end":"21:00","hours":15}],"금":[{"start":"06:00","end":"21:00","hours":15}],"토":[{"start":"09:00","end":"17:00","hours":8}]}$$::jsonb, '{}'::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0545' and exists (select 1 from public.schedules where pool_id = 'POOL_0545');

-- 5) 한누리전당수영장 (전북 장수군, 장수한누리전당 내) — 운영시간 윈도우. 실사용/지도명으로 등록.
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0546', '한누리전당수영장', '전북', '장수군', '전북특별자치도 장수군 장수읍 한누리로 393',
    35.6410248943658, 127.518197150891, 'indoor', 'public',
    '063-350-1641', 'https://www.jangsu.go.kr', 5, 25, null, null,
    '{}', false, false, false,
    true, true, 2500, 2500, null, 'https://www.jangsu.go.kr/index.jangsu?menuCd=DOM_000000106012004002')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0546', '풀스데이', $${"월":[{"start":"06:00","end":"21:00","hours":15}],"화":[{"start":"06:00","end":"21:00","hours":15}],"수":[{"start":"06:00","end":"21:00","hours":15}],"목":[{"start":"06:00","end":"21:00","hours":15}],"금":[{"start":"06:00","end":"21:00","hours":15}],"토":[{"start":"09:00","end":"18:00","hours":9}]}$$::jsonb, '{}'::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0546' and exists (select 1 from public.schedules where pool_id = 'POOL_0546');
