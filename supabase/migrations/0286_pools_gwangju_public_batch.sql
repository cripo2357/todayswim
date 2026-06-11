-- Pool's day — 광주광역시 공공 수영장 1차 배치 등록 (POOL_0221~0224, 4곳).
--
-- ## 시간표 출처 [1차 — 운영자 공식]
-- 광주도시공사(gmcc)·남구 반다비체육센터·북구시설관리공단·서구시설관리공단 공식 페이지의
-- 자유수영(일일입장) 안내에서 요일별 시간·요금 추출. 정화시간은 제외. 첨벙/블로그 등 2차 미사용.
-- 각 풀 schedule_source_url에 공식 페이지 명시.
--
-- ## 메타
-- - 좌표 [신뢰도 높음]: 카카오 Local API(시설명 키워드, 실제 수영장 건물 POI).
-- - 염주(둘째·넷째 일요일 휴관)·우산/상무(첫째·셋째 일요일 휴관)는 일요일 weeks 구조화([[slot_weeks_operation]]).
-- - 남구반다비·상무는 공식 페이지에 레인/길이/수심 미기재 → null.

-- 1) 염주실내수영장 (광주 서구, 광주도시공사)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0221', '염주실내수영장', '광주', '서구', '광주광역시 서구 금화로 278',
    35.1335145275934, 126.878329591834, 'indoor', 'public',
    '062-380-6803', 'https://www.gmcc.co.kr', 10, 25, 0.8, 1.3,
    '{}', true, true, false,
    true, true, 5000, 5000, null, 'https://www.gmcc.co.kr/menu.es?mid=a10105010100')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0221', '풀스데이', $${"월":[{"start":"13:00","end":"20:30","hours":7.5}],"화":[{"start":"13:00","end":"20:30","hours":7.5}],"수":[{"start":"13:00","end":"20:30","hours":7.5}],"목":[{"start":"13:00","end":"20:30","hours":7.5}],"금":[{"start":"13:00","end":"20:30","hours":7.5}],"토":[{"start":"09:00","end":"12:00","hours":3},{"start":"13:00","end":"20:30","hours":7.5}],"일":[{"start":"07:00","end":"08:00","hours":1,"weeks":[1,3,5]},{"start":"09:00","end":"12:00","hours":3,"weeks":[1,3,5]},{"start":"13:00","end":"18:00","hours":5,"weeks":[1,3,5]}]}$$::jsonb, $${"일":"매월 둘째·넷째 주 일요일은 휴관합니다."}$$::jsonb, '2026-06-12'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0221' and exists (select 1 from public.schedules where pool_id = 'POOL_0221');

-- 2) 남구반다비체육센터 (광주 남구)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0222', '남구반다비체육센터', '광주', '남구', '광주광역시 남구 대남대로308번안길 20',
    35.1389414509087, 126.898710254186, 'indoor', 'public',
    '062-352-8700', 'https://www.gjnamgubandabigym.kr', null, null, null, null,
    '{}', false, false, false,
    true, true, 5000, 5000, null, 'https://www.gjnamgubandabigym.kr/swimmingpool')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0222', '풀스데이', $${"월":[{"start":"06:00","end":"08:00","hours":2},{"start":"09:00","end":"12:00","hours":3},{"start":"14:00","end":"16:00","hours":2},{"start":"17:00","end":"21:00","hours":4}],"화":[{"start":"06:00","end":"08:00","hours":2},{"start":"09:00","end":"12:00","hours":3},{"start":"14:00","end":"16:00","hours":2},{"start":"17:00","end":"21:00","hours":4}],"수":[{"start":"06:00","end":"08:00","hours":2},{"start":"09:00","end":"12:00","hours":3},{"start":"14:00","end":"16:00","hours":2},{"start":"17:00","end":"21:00","hours":4}],"목":[{"start":"06:00","end":"08:00","hours":2},{"start":"09:00","end":"12:00","hours":3},{"start":"14:00","end":"16:00","hours":2},{"start":"17:00","end":"21:00","hours":4}],"금":[{"start":"06:00","end":"08:00","hours":2},{"start":"09:00","end":"12:00","hours":3},{"start":"14:00","end":"16:00","hours":2},{"start":"17:00","end":"21:00","hours":4}],"토":[{"start":"06:00","end":"08:00","hours":2},{"start":"09:00","end":"12:00","hours":3},{"start":"14:00","end":"18:00","hours":4}]}$$::jsonb, '{}'::jsonb, '2026-06-12'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0222' and exists (select 1 from public.schedules where pool_id = 'POOL_0222');

-- 3) 우산수영장 (광주 북구, 북구시설관리공단)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0223', '우산수영장', '광주', '북구', '광주광역시 북구 중문로 지하62',
    35.1778138013309, 126.920939954365, 'indoor', 'public',
    '062-267-8850', 'https://gbfmc.or.kr', 6, 25, null, null,
    '{}', true, false, false,
    true, true, 4000, 4000, null, 'https://gbfmc.or.kr/menu.es?mid=a10401010000')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0223', '풀스데이', $${"월":[{"start":"08:00","end":"08:50","hours":0.83},{"start":"13:00","end":"14:50","hours":1.83}],"화":[{"start":"08:00","end":"08:50","hours":0.83},{"start":"13:00","end":"14:50","hours":1.83},{"start":"16:00","end":"20:50","hours":4.83}],"수":[{"start":"08:00","end":"08:50","hours":0.83},{"start":"13:00","end":"14:50","hours":1.83}],"목":[{"start":"08:00","end":"08:50","hours":0.83},{"start":"13:00","end":"14:50","hours":1.83},{"start":"16:00","end":"20:50","hours":4.83}],"금":[{"start":"06:00","end":"11:50","hours":5.83},{"start":"13:00","end":"14:50","hours":1.83},{"start":"18:00","end":"20:50","hours":2.83}],"토":[{"start":"06:00","end":"11:50","hours":5.83},{"start":"13:00","end":"14:50","hours":1.83},{"start":"16:00","end":"17:50","hours":1.83}],"일":[{"start":"09:00","end":"11:50","hours":2.83,"weeks":[2,4,5]},{"start":"13:00","end":"17:50","hours":4.83,"weeks":[2,4,5]}]}$$::jsonb, $${"일":"매월 첫째·셋째 주 일요일은 휴관합니다."}$$::jsonb, '2026-06-12'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0223' and exists (select 1 from public.schedules where pool_id = 'POOL_0223');

-- 4) 상무국민체육센터 (광주 서구, 서구시설관리공단)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0224', '상무국민체육센터', '광주', '서구', '광주광역시 서구 상무공원로 99',
    35.153023653175, 126.842402045729, 'indoor', 'public',
    '062-601-6060', 'https://seogufmc.or.kr', null, null, null, null,
    '{}', false, false, false,
    true, true, 4000, 4000, null, 'https://seogufmc.or.kr/menu.es?mid=a10501010100')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0224', '풀스데이', $${"월":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:30","end":"21:00","hours":7.5}],"화":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:30","end":"21:00","hours":7.5}],"수":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:30","end":"21:00","hours":7.5}],"목":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:30","end":"21:00","hours":7.5}],"금":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:30","end":"21:00","hours":7.5}],"토":[{"start":"09:00","end":"12:00","hours":3},{"start":"13:00","end":"17:30","hours":4.5}],"일":[{"start":"09:00","end":"12:00","hours":3,"weeks":[2,4,5]},{"start":"13:00","end":"17:30","hours":4.5,"weeks":[2,4,5]}]}$$::jsonb, $${"일":"매월 첫째·셋째 주 일요일은 휴관합니다."}$$::jsonb, '2026-06-12'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0224' and exists (select 1 from public.schedules where pool_id = 'POOL_0224');
