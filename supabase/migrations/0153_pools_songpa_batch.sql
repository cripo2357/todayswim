-- Pool's day — 송파구 자정 배치: 공공 4곳 신규. 카카오 좌표(2026-06-05). 이름 붙여쓰기.

-- 1) 올림픽수영장 (POOL_0053) — 송파구 올림픽로 424(방이동), 국민체육진흥공단. 50m.
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url
) values
  ('POOL_0053', '올림픽수영장', '서울', '송파구',
    '서울특별시 송파구 올림픽로 424',
    37.5203396980951, 127.115517876627, 'indoor', 'public',
    '02-2180-3743', null,
    null, 50, null, null,
    '{}', false, false, false,
    true, true,
    7000, 7000, 7000,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0053.jpg')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0053', '풀스데이', $${
    "월": [{"start":"13:00","end":"13:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83},{"start":"19:00","end":"19:50","hours":0.83},{"start":"21:00","end":"21:50","hours":0.83}],
    "화": [{"start":"13:00","end":"13:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83},{"start":"19:00","end":"19:50","hours":0.83},{"start":"21:00","end":"21:50","hours":0.83}],
    "수": [{"start":"13:00","end":"13:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83},{"start":"19:00","end":"19:50","hours":0.83},{"start":"21:00","end":"21:50","hours":0.83}],
    "목": [{"start":"13:00","end":"13:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83},{"start":"19:00","end":"19:50","hours":0.83},{"start":"21:00","end":"21:50","hours":0.83}],
    "금": [{"start":"13:00","end":"13:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83},{"start":"19:00","end":"19:50","hours":0.83},{"start":"21:00","end":"21:50","hours":0.83}],
    "토": [{"start":"09:00","end":"12:50","hours":3.83},{"start":"14:00","end":"17:50","hours":3.83}],
    "일": [{"start":"09:00","end":"12:50","hours":3.83},{"start":"14:00","end":"17:50","hours":3.83}]
  }$$::jsonb, $${"일":"둘째 주 일요일은 휴관입니다."}$$::jsonb, '2026-06-05'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0053' and exists (select 1 from public.schedules where pool_id = 'POOL_0053');

-- 2) 곰두리체육센터 (POOL_0054) — 송파구 오금동, 장애인 친화. 토요일만 자유수영.
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url
) values
  ('POOL_0054', '곰두리체육센터', '서울', '송파구',
    '서울특별시 송파구 오금동 51',
    37.5005122103537, 127.135522971382, 'indoor', 'public',
    null, null,
    null, null, null, null,
    '{}', false, false, false,
    true, true,
    4500, 4500, 4500,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0054.jpg')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, updated_at) values
  ('POOL_0054', '풀스데이', $${
    "토": [{"start":"10:00","end":"11:30","hours":1.5},{"start":"14:00","end":"15:30","hours":1.5},{"start":"16:00","end":"17:30","hours":1.5}]
  }$$::jsonb, '2026-06-05'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0054' and exists (select 1 from public.schedules where pool_id = 'POOL_0054');

-- 3) 잠실종합운동장제1수영장 (POOL_0055) — 송파구 올림픽로 25, 서울시. 50m. 일요일 휴관.
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url
) values
  ('POOL_0055', '잠실종합운동장제1수영장', '서울', '송파구',
    '서울특별시 송파구 올림픽로 25',
    37.5161987797456, 127.075940589715, 'indoor', 'public',
    null, null,
    null, 50, null, null,
    '{}', false, false, false,
    true, true,
    4000, 4000, 5200,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0055.jpg')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, updated_at) values
  ('POOL_0055', '풀스데이', $${
    "월": [{"start":"13:00","end":"15:00","hours":2},{"start":"16:00","end":"18:00","hours":2}],
    "화": [{"start":"13:00","end":"15:00","hours":2},{"start":"16:00","end":"18:00","hours":2}],
    "수": [{"start":"13:00","end":"15:00","hours":2},{"start":"16:00","end":"18:00","hours":2}],
    "목": [{"start":"13:00","end":"15:00","hours":2},{"start":"16:00","end":"18:00","hours":2}],
    "금": [{"start":"13:00","end":"15:00","hours":2},{"start":"16:00","end":"18:00","hours":2}],
    "토": [{"start":"09:00","end":"12:00","hours":3},{"start":"13:00","end":"17:00","hours":4}]
  }$$::jsonb, '2026-06-05'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0055' and exists (select 1 from public.schedules where pool_id = 'POOL_0055');

-- 4) 송파구체육문화회관 (POOL_0056) — 송파구 양산로 15(거여동).
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url
) values
  ('POOL_0056', '송파구체육문화회관', '서울', '송파구',
    '서울특별시 송파구 양산로 15',
    37.4907257654312, 127.142853389747, 'indoor', 'public',
    null, 'https://www.esongpa.or.kr/',
    null, null, null, null,
    '{}', false, false, false,
    true, true,
    5000, 5000, 5000,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0056.jpg')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, updated_at) values
  ('POOL_0056', '풀스데이', $${
    "월": [{"start":"13:00","end":"13:50","hours":0.83}],
    "화": [{"start":"13:00","end":"13:50","hours":0.83}],
    "수": [{"start":"13:00","end":"13:50","hours":0.83}],
    "목": [{"start":"13:00","end":"13:50","hours":0.83}],
    "금": [{"start":"13:00","end":"13:50","hours":0.83}],
    "토": [{"start":"13:20","end":"14:50","hours":1.5},{"start":"15:20","end":"16:50","hours":1.5}]
  }$$::jsonb, '2026-06-05'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0056' and exists (select 1 from public.schedules where pool_id = 'POOL_0056');
