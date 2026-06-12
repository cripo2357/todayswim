-- Pool's day — 전라도 군 보류분 운영자 캡처 등록 (POOL_0550~0556, 7곳).
-- 크리스가 각 센터 운영안내판/요금표 캡처(1차 출처) 제공 → curl·JS·VLM으로도 공식웹에 없던
-- 자유수영 시간표 확보. 진안·고창·부안=강습+자유수영 병행, 순창·보성·완도=자유수영 명시표,
-- 장성=주말형 1·2부. 완도는 이전 '생존수영전용' 오판 정정(실제 정식 자유수영 운영).
-- prod 직접 적용(supabase-js) 완료, 본 파일은 git 기록.

insert into public.pools (id, name, region, district, address, lat, lng, type, ownership, phone, website, lane_count, pool_length, depth_min, depth_max, facilities, has_kids_pool, has_diving_pool, is_hotel_pool, has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url) values
  ('POOL_0550', '진안군국민체육센터', '전북', '진안군', '전북특별자치도 진안군 진안읍 우화2길 47-9', 35.78836847919, 127.430125830826, 'indoor', 'public', '063-430-8721', 'https://www.jinan.go.kr', 5, 25, null, null, '[]', true, false, false, true, true, 3000, 3000, null, 'https://www.jinan.go.kr/trans/index.jinan?menuCd=DOM_000000204004002000')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0550', '풀스데이', $${"금":[{"end":"12:00","hours":6,"start":"06:00"},{"end":"22:00","hours":9,"start":"13:00"}],"목":[{"end":"12:00","hours":6,"start":"06:00"},{"end":"22:00","hours":9,"start":"13:00"}],"수":[{"end":"12:00","hours":6,"start":"06:00"},{"end":"22:00","hours":9,"start":"13:00"}],"월":[{"end":"12:00","hours":6,"start":"06:00"},{"end":"22:00","hours":9,"start":"13:00"}],"일":[{"end":"12:00","hours":3,"start":"09:00","weeks":[2,4,5]},{"end":"18:00","hours":5,"start":"13:00","weeks":[2,4,5]}],"토":[{"end":"12:00","hours":6,"start":"06:00"},{"end":"18:00","hours":5,"start":"13:00"}],"화":[{"end":"12:00","hours":6,"start":"06:00"},{"end":"22:00","hours":9,"start":"13:00"}]}$$::jsonb, $${"일":"매월 첫째·셋째 주 일요일은 휴장입니다."}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0550' and exists (select 1 from public.schedules where pool_id = 'POOL_0550');

insert into public.pools (id, name, region, district, address, lat, lng, type, ownership, phone, website, lane_count, pool_length, depth_min, depth_max, facilities, has_kids_pool, has_diving_pool, is_hotel_pool, has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url) values
  ('POOL_0551', '순창군실내수영장', '전북', '순창군', '전북특별자치도 순창군 순창읍 장류로 407-11', 35.3776464031055, 127.146852310637, 'indoor', 'public', null, 'https://www.sunchang.go.kr', null, null, null, null, '[]', false, false, false, true, true, 3300, 3300, null, 'https://www.sunchang.go.kr')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0551', '풀스데이', $${"금":[{"end":"12:00","hours":6,"start":"06:00"},{"end":"22:00","hours":9,"start":"13:00"}],"목":[{"end":"12:00","hours":6,"start":"06:00"},{"end":"22:00","hours":9,"start":"13:00"}],"수":[{"end":"12:00","hours":6,"start":"06:00"},{"end":"22:00","hours":9,"start":"13:00"}],"월":[{"end":"12:00","hours":6,"start":"06:00"},{"end":"22:00","hours":9,"start":"13:00"}],"토":[{"end":"12:00","hours":3,"start":"09:00"},{"end":"17:00","hours":4,"start":"13:00"}],"화":[{"end":"12:00","hours":6,"start":"06:00"},{"end":"22:00","hours":9,"start":"13:00"}]}$$::jsonb, $${}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0551' and exists (select 1 from public.schedules where pool_id = 'POOL_0551');

insert into public.pools (id, name, region, district, address, lat, lng, type, ownership, phone, website, lane_count, pool_length, depth_min, depth_max, facilities, has_kids_pool, has_diving_pool, is_hotel_pool, has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url) values
  ('POOL_0552', '고창군실내수영장', '전북', '고창군', '전북특별자치도 고창군 고창읍 운동장길 36', 35.43671942, 126.70383056, 'indoor', 'public', '063-560-8934', 'https://www.gochang.go.kr', 6, 25, null, null, '[]', true, false, false, true, true, 2600, 2600, null, 'https://www.gochang.go.kr/index.gochang?menuCd=DOM_000000104002006001')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0552', '풀스데이', $${"금":[{"end":"12:00","hours":6,"start":"06:00"},{"end":"20:00","hours":7,"start":"13:00"}],"목":[{"end":"12:00","hours":6,"start":"06:00"},{"end":"20:00","hours":7,"start":"13:00"}],"수":[{"end":"12:00","hours":6,"start":"06:00"},{"end":"20:00","hours":7,"start":"13:00"}],"월":[{"end":"12:00","hours":6,"start":"06:00"},{"end":"20:00","hours":7,"start":"13:00"}],"토":[{"end":"12:00","hours":3,"start":"09:00"},{"end":"18:00","hours":5,"start":"13:00"}],"화":[{"end":"12:00","hours":6,"start":"06:00"},{"end":"20:00","hours":7,"start":"13:00"}]}$$::jsonb, $${}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0552' and exists (select 1 from public.schedules where pool_id = 'POOL_0552');

insert into public.pools (id, name, region, district, address, lat, lng, type, ownership, phone, website, lane_count, pool_length, depth_min, depth_max, facilities, has_kids_pool, has_diving_pool, is_hotel_pool, has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url) values
  ('POOL_0553', '부안국민체육센터', '전북', '부안군', '전북특별자치도 부안군 부안읍 동중리 99-8', 35.7309280021258, 126.737214077969, 'indoor', 'public', '063-580-3995', 'https://www.buan.go.kr', 6, 25, null, null, '[]', true, false, false, true, true, 3000, 3000, null, 'https://www.buan.go.kr')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0553', '풀스데이', $${"금":[{"end":"12:00","hours":7,"start":"05:00"},{"end":"21:00","hours":8,"start":"13:00"}],"목":[{"end":"12:00","hours":7,"start":"05:00"},{"end":"21:00","hours":8,"start":"13:00"}],"수":[{"end":"12:00","hours":7,"start":"05:00"},{"end":"21:00","hours":8,"start":"13:00"}],"월":[{"end":"12:00","hours":7,"start":"05:00"},{"end":"21:00","hours":8,"start":"13:00"}],"토":[{"end":"12:00","hours":3,"start":"09:00"},{"end":"18:00","hours":5,"start":"13:00"}],"화":[{"end":"12:00","hours":7,"start":"05:00"},{"end":"21:00","hours":8,"start":"13:00"}]}$$::jsonb, $${}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0553' and exists (select 1 from public.schedules where pool_id = 'POOL_0553');

insert into public.pools (id, name, region, district, address, lat, lng, type, ownership, phone, website, lane_count, pool_length, depth_min, depth_max, facilities, has_kids_pool, has_diving_pool, is_hotel_pool, has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url) values
  ('POOL_0554', '보성국민체육센터', '전남', '보성군', '전라남도 보성군 보성읍 용문길 36-16', 34.77108, 127.07905, 'indoor', 'public', '061-850-8720', 'https://www.boseong.go.kr', 6, 25, null, null, '[]', false, false, false, true, true, 3000, 3000, null, 'https://www.boseong.go.kr')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0554', '풀스데이', $${"금":[{"end":"08:00","hours":2,"start":"06:00"},{"end":"11:30","hours":2.5,"start":"09:00"},{"end":"17:30","hours":4,"start":"13:30"},{"end":"21:00","hours":2.5,"start":"18:30"}],"목":[{"end":"08:00","hours":2,"start":"06:00"},{"end":"11:30","hours":2.5,"start":"09:00"},{"end":"17:30","hours":4,"start":"13:30"},{"end":"21:00","hours":2.5,"start":"18:30"}],"수":[{"end":"08:00","hours":2,"start":"06:00"},{"end":"11:30","hours":2.5,"start":"09:00"},{"end":"17:30","hours":4,"start":"13:30"},{"end":"21:00","hours":2.5,"start":"18:30"}],"화":[{"end":"08:00","hours":2,"start":"06:00"},{"end":"11:30","hours":2.5,"start":"09:00"},{"end":"17:30","hours":4,"start":"13:30"},{"end":"21:00","hours":2.5,"start":"18:30"}]}$$::jsonb, $${}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0554' and exists (select 1 from public.schedules where pool_id = 'POOL_0554');

insert into public.pools (id, name, region, district, address, lat, lng, type, ownership, phone, website, lane_count, pool_length, depth_min, depth_max, facilities, has_kids_pool, has_diving_pool, is_hotel_pool, has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url) values
  ('POOL_0555', '완도수영장', '전남', '완도군', '전라남도 완도군 완도읍 군내리 319-14', 34.31074, 126.75512, 'indoor', 'public', '061-550-5115', 'https://www.wando.go.kr', null, null, null, null, '[]', false, false, false, true, true, 3000, 3000, null, 'https://www.wando.go.kr/wando/sub.cs?m=1190')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0555', '풀스데이', $${"금":[{"end":"07:50","hours":1.83,"start":"06:00"},{"end":"11:50","hours":2.83,"start":"09:00"},{"end":"17:00","hours":3.5,"start":"13:30"},{"end":"20:30","hours":2.5,"start":"18:00"}],"목":[{"end":"07:50","hours":1.83,"start":"06:00"},{"end":"11:50","hours":2.83,"start":"09:00"},{"end":"17:00","hours":3.5,"start":"13:30"},{"end":"20:30","hours":2.5,"start":"18:00"}],"수":[{"end":"07:50","hours":1.83,"start":"06:00"},{"end":"11:50","hours":2.83,"start":"09:00"},{"end":"17:00","hours":3.5,"start":"13:30"},{"end":"20:30","hours":2.5,"start":"18:00"}],"일":[{"end":"11:50","hours":4.83,"start":"07:00"},{"end":"17:30","hours":4,"start":"13:30"}],"토":[{"end":"11:50","hours":4.83,"start":"07:00"},{"end":"17:30","hours":4,"start":"13:30"}],"화":[{"end":"07:50","hours":1.83,"start":"06:00"},{"end":"11:50","hours":2.83,"start":"09:00"},{"end":"17:00","hours":3.5,"start":"13:30"},{"end":"20:30","hours":2.5,"start":"18:00"}]}$$::jsonb, $${}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0555' and exists (select 1 from public.schedules where pool_id = 'POOL_0555');

insert into public.pools (id, name, region, district, address, lat, lng, type, ownership, phone, website, lane_count, pool_length, depth_min, depth_max, facilities, has_kids_pool, has_diving_pool, is_hotel_pool, has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url) values
  ('POOL_0556', '장성실내수영장', '전남', '장성군', '전라남도 장성군 장성읍 문화로 81', 35.3005495540586, 126.770541339944, 'indoor', 'public', '061-390-7840', 'https://www.jangseong.go.kr', null, null, 1.2, 1.3, '[]', true, false, false, true, true, 4200, 4200, null, 'https://www.jangseong.go.kr/home/culture/pool/pool_use')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0556', '풀스데이', $${"금":[{"end":"12:00","hours":3,"start":"09:00"},{"end":"17:00","hours":3,"start":"14:00"}],"목":[{"end":"12:00","hours":3,"start":"09:00"},{"end":"17:00","hours":3,"start":"14:00"}],"수":[{"end":"12:00","hours":3,"start":"09:00"},{"end":"17:00","hours":3,"start":"14:00"}],"일":[{"end":"12:00","hours":3,"start":"09:00"},{"end":"17:00","hours":3,"start":"14:00"}],"토":[{"end":"12:00","hours":3,"start":"09:00"},{"end":"17:00","hours":3,"start":"14:00"}],"화":[{"end":"12:00","hours":3,"start":"09:00"},{"end":"17:00","hours":3,"start":"14:00"}]}$$::jsonb, $${}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0556' and exists (select 1 from public.schedules where pool_id = 'POOL_0556');

