-- Pool's day — 강동구 자정 배치: 공공 6곳 신규. 카카오 좌표(2026-06-05). 이름 붙여쓰기.
-- ※온조 좌표는 시설명(카카오 POI 고덕동296)으로 확보 — 강동대로285 주소검색은 결과없어 폐기.

-- 1) 고덕사회체육센터 (POOL_0057) — 강동구 구천면로93길 12.
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url
) values
  ('POOL_0057', '고덕사회체육센터', '서울', '강동구',
    '서울특별시 강동구 구천면로93길 12',
    37.5511745316081, 127.168742192716, 'indoor', 'public',
    '02-440-5300', 'http://www.kdsports.or.kr/',
    null, null, null, null,
    '{}', false, false, false,
    true, true,
    4000, 4000, 4000,  -- ★캡처상 회원가 4000. 비회원 일일 요금 미확인 → 추후 보강.
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0057.jpg')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, updated_at) values
  ('POOL_0057', '풀스데이', $${
    "월": [{"start":"21:00","end":"21:50","hours":0.83}],
    "화": [{"start":"21:00","end":"21:50","hours":0.83}],
    "수": [{"start":"21:00","end":"21:50","hours":0.83}],
    "목": [{"start":"21:00","end":"21:50","hours":0.83}],
    "금": [{"start":"21:00","end":"21:50","hours":0.83}],
    "토": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"15:00","end":"15:50","hours":0.83},{"start":"16:00","end":"16:50","hours":0.83}]
  }$$::jsonb, '2026-06-05'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0057' and exists (select 1 from public.schedules where pool_id = 'POOL_0057');

-- 2) 고덕어울림수영장 (POOL_0058) — 강동구 고덕동, 25m 4레인.
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url
) values
  ('POOL_0058', '고덕어울림수영장', '서울', '강동구',
    '서울특별시 강동구 고덕동 210-1',
    37.55744016315794, 127.16967848080924, 'indoor', 'public',
    '02-2045-7630', 'https://www.igangdong.or.kr/',
    4, 25, null, null,
    '{}', false, false, false,
    true, true,
    4400, 4400, 4400,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0058.jpg')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, updated_at) values
  ('POOL_0058', '풀스데이', $${
    "월": [{"start":"12:00","end":"12:50","hours":0.83}],
    "화": [{"start":"12:00","end":"12:50","hours":0.83}],
    "수": [{"start":"12:00","end":"12:50","hours":0.83}],
    "목": [{"start":"12:00","end":"12:50","hours":0.83}],
    "금": [{"start":"12:00","end":"12:50","hours":0.83}],
    "토": [{"start":"13:00","end":"14:50","hours":1.83},{"start":"15:30","end":"17:20","hours":1.83}]
  }$$::jsonb, '2026-06-05'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0058' and exists (select 1 from public.schedules where pool_id = 'POOL_0058');

-- 3) 온조대왕문화체육관 (POOL_0059) — 강동구 고덕동, 25m 6레인 + 유아풀.
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url
) values
  ('POOL_0059', '온조대왕문화체육관', '서울', '강동구',
    '서울특별시 강동구 고덕동 296',
    37.55672729102473, 127.15745394549533, 'indoor', 'public',
    '02-2045-7800', 'https://www.igangdong.or.kr/',
    6, 25, null, null,
    '{}', true, false, false,
    true, true,
    4400, 4400, 4400,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0059.jpg')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, updated_at) values
  ('POOL_0059', '풀스데이', $${
    "월": [{"start":"12:00","end":"12:50","hours":0.83}],
    "화": [{"start":"12:00","end":"12:50","hours":0.83}],
    "수": [{"start":"12:00","end":"12:50","hours":0.83}],
    "목": [{"start":"12:00","end":"12:50","hours":0.83}],
    "금": [{"start":"12:00","end":"12:50","hours":0.83}],
    "토": [{"start":"09:00","end":"10:50","hours":1.83},{"start":"13:00","end":"14:50","hours":1.83},{"start":"15:30","end":"17:20","hours":1.83}]
  }$$::jsonb, '2026-06-05'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0059' and exists (select 1 from public.schedules where pool_id = 'POOL_0059');

-- 4) 천호어울림수영장 (POOL_0060) — 강동구 올림픽로80길 60(천호동), 25m 5레인 수심1.2.
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url
) values
  ('POOL_0060', '천호어울림수영장', '서울', '강동구',
    '서울특별시 강동구 올림픽로80길 60',
    37.542408749113285, 127.12832073407559, 'indoor', 'public',
    '02-2045-7690', 'https://www.igangdong.or.kr/',
    5, 25, 1.2, 1.2,
    '{}', false, false, false,
    true, true,
    4400, 4400, 4400,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0060.jpg')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, updated_at) values
  ('POOL_0060', '풀스데이', $${
    "월": [{"start":"12:00","end":"12:50","hours":0.83}],
    "화": [{"start":"12:00","end":"12:50","hours":0.83}],
    "수": [{"start":"12:00","end":"12:50","hours":0.83}],
    "목": [{"start":"12:00","end":"12:50","hours":0.83}],
    "금": [{"start":"12:00","end":"12:50","hours":0.83}],
    "토": [{"start":"13:00","end":"14:50","hours":1.83},{"start":"15:30","end":"17:20","hours":1.83}]
  }$$::jsonb, '2026-06-05'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0060' and exists (select 1 from public.schedules where pool_id = 'POOL_0060');

-- 5) 강일구민체육센터 (POOL_0061) — 강동구 강일동. 토요일만.
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url
) values
  ('POOL_0061', '강일구민체육센터', '서울', '강동구',
    '서울특별시 강동구 강일동 665-5',
    37.5667872974821, 127.172643762401, 'indoor', 'public',
    null, 'https://www.igangdong.or.kr/',
    null, null, null, null,
    '{}', false, false, false,
    true, true,
    4400, 4400, 4400,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0061.jpg')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, updated_at) values
  ('POOL_0061', '풀스데이', $${
    "토": [{"start":"13:00","end":"14:50","hours":1.83},{"start":"15:30","end":"17:20","hours":1.83}]
  }$$::jsonb, '2026-06-05'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0061' and exists (select 1 from public.schedules where pool_id = 'POOL_0061');

-- 6) 강동유소년스포츠센터 (POOL_0062) — 강동구 상일동. 토요일만.
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url
) values
  ('POOL_0062', '강동유소년스포츠센터', '서울', '강동구',
    '서울특별시 강동구 상일동 483',
    37.555289166372, 127.17422768465, 'indoor', 'public',
    null, 'https://www.igangdong.or.kr/',
    null, null, null, null,
    '{}', false, false, false,
    true, true,
    4400, 4400, 4400,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0062.jpg')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, updated_at) values
  ('POOL_0062', '풀스데이', $${
    "토": [{"start":"13:00","end":"14:50","hours":1.83},{"start":"15:00","end":"16:50","hours":1.83}]
  }$$::jsonb, '2026-06-05'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0062' and exists (select 1 from public.schedules where pool_id = 'POOL_0062');
