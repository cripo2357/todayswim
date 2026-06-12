-- Pool's day — 강원 군(郡) 공공 수영장 1차 배치 (7곳, POOL_0535~0541).
--
-- 배경: 강원 11개 군 중 10곳에 공공 자유수영 풀 실재(평창만 없음). 카카오 POI+공식 SSR 페이지+블로그로 조사.
-- 모델: 자유수영 시간표 별도 없이 운영시간 내 상시 → 운영창 모델(대전 한밭/화천 패턴). 정화시간 등 미세 분절은 단순화.
-- 출처: 각 군 시설/공단 공식(sports.gangwon.kr·hsg·yangyang·jsimc·gwgs·injesports 등) + 디렉토리(swimmingis/suwimi)·방문 후기 교차.
-- 좌표=카카오 Local POI. POOL ID=prod max 기준 동적 배정(0535~0541). prod 적용은 supabase-js insert(pg prune). 이 파일=source-of-record.
--
-- 요금: 영월3800·양양3500·고성3000·홍천3000·횡성3000·인제3000·정선2500(2026-06-13 크리스 캡처로 4곳 보강).
-- 미등록(운영시간 미확보, 요금 3,000만 확인): 철원국민체육센터·양구청소년수련관 — 자유수영 시간표가 이미지라 추후 캡처로 등록.

insert into public.pools (id, name, region, district, address, lat, lng, type, ownership, phone, website, lane_count, pool_length, depth_min, depth_max, facilities, has_kids_pool, has_diving_pool, is_hotel_pool, has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url) values
  ('POOL_0535', '홍천군국민체육센터수영장', '강원', '홍천군', '강원특별자치도 홍천군 홍천읍 태학여내길 31', 37.7091202926911, 127.906304544853, 'indoor', 'public', '033-436-7330', 'http://sports.gangwon.kr', 6, 25, 1.0, 1.5, '{}', true, false, false, true, true, 3000, 3000, null, 'http://sports.gangwon.kr')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0535', '풀스데이', $${"화":[{"start":"06:00","end":"21:00","hours":15}],"수":[{"start":"06:00","end":"21:00","hours":15}],"목":[{"start":"06:00","end":"21:00","hours":15}],"금":[{"start":"06:00","end":"21:00","hours":15}],"토":[{"start":"06:00","end":"21:00","hours":15}],"일":[{"start":"10:00","end":"17:00","hours":7}]}$$::jsonb, '{}'::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0535' and exists (select 1 from public.schedules where pool_id = 'POOL_0535');

insert into public.pools (id, name, region, district, address, lat, lng, type, ownership, phone, website, lane_count, pool_length, depth_min, depth_max, facilities, has_kids_pool, has_diving_pool, is_hotel_pool, has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url) values
  ('POOL_0536', '횡성실내수영장', '강원', '횡성군', '강원특별자치도 횡성군 횡성읍 문화체육로 57', 37.49609012048301, 127.98913953924048, 'indoor', 'public', '033-342-5663', 'https://www.hsg.go.kr', 7, 25, 1.2, 1.5, '{}', true, false, false, true, true, 3000, 3000, null, 'https://www.hsg.go.kr')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0536', '풀스데이', $${"월":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"20:00","hours":7}],"화":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"20:00","hours":7}],"수":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"20:00","hours":7}],"목":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"20:00","hours":7}],"금":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"20:00","hours":7}],"토":[{"start":"08:00","end":"12:00","hours":4}]}$$::jsonb, '{}'::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0536' and exists (select 1 from public.schedules where pool_id = 'POOL_0536');

insert into public.pools (id, name, region, district, address, lat, lng, type, ownership, phone, website, lane_count, pool_length, depth_min, depth_max, facilities, has_kids_pool, has_diving_pool, is_hotel_pool, has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url) values
  ('POOL_0537', '영월국민체육센터수영장', '강원', '영월군', '강원특별자치도 영월군 영월읍 제방안길 100', 37.1777897673996, 128.462683674516, 'indoor', 'public', '033-370-1347', 'https://www.yw.go.kr', 6, 25, null, null, '{}', false, false, false, true, true, 3800, 3800, null, 'https://www.yw.go.kr')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0537', '풀스데이', $${"화":[{"start":"06:00","end":"21:00","hours":15}],"수":[{"start":"06:00","end":"21:00","hours":15}],"목":[{"start":"06:00","end":"21:00","hours":15}],"금":[{"start":"06:00","end":"21:00","hours":15}],"토":[{"start":"06:00","end":"21:00","hours":15}],"일":[{"start":"09:00","end":"18:00","hours":9}]}$$::jsonb, '{}'::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0537' and exists (select 1 from public.schedules where pool_id = 'POOL_0537');

insert into public.pools (id, name, region, district, address, lat, lng, type, ownership, phone, website, lane_count, pool_length, depth_min, depth_max, facilities, has_kids_pool, has_diving_pool, is_hotel_pool, has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url) values
  ('POOL_0538', '정선군국민체육센터수영장', '강원', '정선군', '강원특별자치도 정선군 정선읍 녹송4길 51', 37.3842167430928, 128.672337563522, 'indoor', 'public', '033-560-3440', 'https://jsimc.or.kr', 6, 25, 1.3, 1.3, '{}', true, false, false, true, true, 2500, 2500, null, 'https://jsimc.or.kr')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0538', '풀스데이', $${"화":[{"start":"06:00","end":"21:00","hours":15}],"수":[{"start":"06:00","end":"21:00","hours":15}],"목":[{"start":"06:00","end":"21:00","hours":15}],"금":[{"start":"06:00","end":"21:00","hours":15}],"토":[{"start":"06:00","end":"21:00","hours":15}],"일":[{"start":"06:00","end":"17:00","hours":11}]}$$::jsonb, '{}'::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0538' and exists (select 1 from public.schedules where pool_id = 'POOL_0538');

insert into public.pools (id, name, region, district, address, lat, lng, type, ownership, phone, website, lane_count, pool_length, depth_min, depth_max, facilities, has_kids_pool, has_diving_pool, is_hotel_pool, has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url) values
  ('POOL_0539', '양양군문화복지회관수영장', '강원', '양양군', '강원특별자치도 양양군 양양읍 일출로 540', 38.0769813735116, 128.62690266863, 'indoor', 'public', '033-670-2348', 'https://www.yangyang.go.kr', 6, 25, 1.4, 1.4, '{}', true, false, false, true, true, 3500, 3500, null, 'https://www.yangyang.go.kr')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0539', '풀스데이', $${"화":[{"start":"06:00","end":"21:00","hours":15}],"수":[{"start":"06:00","end":"21:00","hours":15}],"목":[{"start":"06:00","end":"21:00","hours":15}],"금":[{"start":"06:00","end":"21:00","hours":15}],"토":[{"start":"06:00","end":"21:00","hours":15}],"일":[{"start":"08:00","end":"18:00","hours":10}]}$$::jsonb, '{}'::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0539' and exists (select 1 from public.schedules where pool_id = 'POOL_0539');

insert into public.pools (id, name, region, district, address, lat, lng, type, ownership, phone, website, lane_count, pool_length, depth_min, depth_max, facilities, has_kids_pool, has_diving_pool, is_hotel_pool, has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url) values
  ('POOL_0540', '인제하늘내린스포츠센터수영장', '강원', '인제군', '강원특별자치도 인제군 인제읍 남북리 388', 38.06116814581964, 128.16486128785107, 'indoor', 'public', null, 'https://injesports.co.kr', 6, 25, null, null, '{}', false, false, false, true, true, 3000, 3000, null, 'https://injesports.co.kr')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0540', '풀스데이', $${"화":[{"start":"09:00","end":"18:00","hours":9}],"수":[{"start":"09:00","end":"18:00","hours":9}],"목":[{"start":"09:00","end":"18:00","hours":9}],"금":[{"start":"09:00","end":"18:00","hours":9}],"토":[{"start":"09:00","end":"18:00","hours":9}],"일":[{"start":"09:00","end":"18:00","hours":9}]}$$::jsonb, '{}'::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0540' and exists (select 1 from public.schedules where pool_id = 'POOL_0540');

insert into public.pools (id, name, region, district, address, lat, lng, type, ownership, phone, website, lane_count, pool_length, depth_min, depth_max, facilities, has_kids_pool, has_diving_pool, is_hotel_pool, has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url) values
  ('POOL_0541', '고성국민체육센터수영장', '강원', '고성군', '강원특별자치도 고성군 거진읍 자산천로 236', 38.43552597780874, 128.45318625738926, 'indoor', 'public', '033-680-3599', 'https://www.gwgs.go.kr', 6, 25, null, null, '{}', false, false, false, true, true, 3000, 3000, null, 'https://www.gwgs.go.kr')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0541', '풀스데이', $${"화":[{"start":"06:00","end":"21:00","hours":15}],"수":[{"start":"06:00","end":"21:00","hours":15}],"목":[{"start":"06:00","end":"21:00","hours":15}],"금":[{"start":"06:00","end":"21:00","hours":15}],"토":[{"start":"06:00","end":"21:00","hours":15}],"일":[{"start":"06:00","end":"21:00","hours":15}]}$$::jsonb, '{}'::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0541' and exists (select 1 from public.schedules where pool_id = 'POOL_0541');
