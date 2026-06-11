-- Pool's day — 강원 원주 동부·서부복합체육센터 등록 (POOL_0225·0226). 강원 0281 배치 후속(이미지 누락분).
--
-- 출처 [1차 — 운영자 공식]: 원주시 공식 시설 페이지(wonju.go.kr) 이용요금/이용시간/레인운영표.
-- 운영창=자유수영창 모델(강습 일부 레인 동시운영).
--   - 동부(0225): 7레인. 월~목 06:00~20:30 / 토·일 06:00~17:30, **금요일 휴관**(원주남부복합과 동일). 일일입장 3,500.
--   - 서부(0226): 5레인 25m 수심 1.3 + 유아풀(23m/0.8). 정식 개관 전 **강습 없이 자유수영만 임시운영**:
--       수~일 09:00~18:00, **월·화 휴관**. 일일입장 3,500. (좌표=카카오 키워드 POI '서부복합체육센터', 지정면 가곡리.)
-- POOL ID: prod max 기준 0225·0226(0217~0224=제주·광주 선점). 좌표=카카오 Local API.
-- ※ prod 적용은 supabase-js upsert로 수행(pg prune됨). 이 파일은 source-of-record.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0225', '원주동부복합체육센터', '강원', '원주시', '강원특별자치도 원주시 건강로 73',
    37.3201290504383, 127.9896710078, 'indoor', 'public',
    '033-737-4977', 'https://www.wonju.go.kr/facility/contents.do?key=6360', 7, 25, null, null,
    '{}', true, false, false,
    true, true, 3500, 3500, null, 'https://www.wonju.go.kr/facility/contents.do?key=6360')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0225', '풀스데이', $${"월":[{"start":"06:00","end":"20:30","hours":14.5}],"화":[{"start":"06:00","end":"20:30","hours":14.5}],"수":[{"start":"06:00","end":"20:30","hours":14.5}],"목":[{"start":"06:00","end":"20:30","hours":14.5}],"토":[{"start":"06:00","end":"17:30","hours":11.5}],"일":[{"start":"06:00","end":"17:30","hours":11.5}]}$$::jsonb, '{}'::jsonb, '2026-06-12'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0225' and exists (select 1 from public.schedules where pool_id = 'POOL_0225');

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0226', '원주서부복합체육센터', '강원', '원주시', '강원특별자치도 원주시 지정면 가곡리 1507-3',
    37.378586732533606, 127.87143037095052, 'indoor', 'public',
    null, 'https://www.wonju.go.kr', 5, 25, 1.3, 1.3,
    '{}', true, false, false,
    true, true, 3500, 3500, null, 'https://www.wonju.go.kr')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0226', '풀스데이', $${"수":[{"start":"09:00","end":"18:00","hours":9}],"목":[{"start":"09:00","end":"18:00","hours":9}],"금":[{"start":"09:00","end":"18:00","hours":9}],"토":[{"start":"09:00","end":"18:00","hours":9}],"일":[{"start":"09:00","end":"18:00","hours":9}]}$$::jsonb, '{}'::jsonb, '2026-06-12'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0226' and exists (select 1 from public.schedules where pool_id = 'POOL_0226');
