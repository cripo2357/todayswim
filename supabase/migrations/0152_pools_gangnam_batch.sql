-- Pool's day — 강남구 자정 배치: 수서청소년센터 좌표/사진 UPDATE + 역삼·동영 신규.
-- 카카오 좌표(2026-06-05 쿼터 정상화 후). 이름 붙여쓰기(pool_name_no_spaces).

-- 1) 시립수서청소년센터(POOL_0050) — 이미 등록됨, 임시 좌표 교체 + 사진 연결.
update public.pools
set lat = 37.4835908846708, lng = 127.088792896988,
    photo_url = 'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0050.jpg'
where id = 'POOL_0050';

-- 2) 역삼동청소년수련관 (POOL_0051) — 강남구 역삼동, 역삼역 1번출구.
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url
) values
  ('POOL_0051', '역삼동청소년수련관', '서울', '강남구',
    '서울특별시 강남구 역삼동 776-8',
    37.4940992186289, 127.040917128074, 'indoor', 'public',
    '02-550-3632', null,
    null, 25, null, null,
    '{}', false, false, false,
    true, true,
    5500, 5500, 5500,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0051.jpg')
on conflict (id) do nothing;

insert into public.schedules (pool_id, author_nickname, by_day, updated_at) values
  ('POOL_0051', '풀스데이', $${
    "월": [{"start":"12:00","end":"12:50","hours":0.83},{"start":"13:00","end":"13:50","hours":0.83}],
    "화": [{"start":"12:00","end":"12:50","hours":0.83},{"start":"13:00","end":"13:50","hours":0.83}],
    "수": [{"start":"12:00","end":"12:50","hours":0.83},{"start":"13:00","end":"13:50","hours":0.83}],
    "목": [{"start":"12:00","end":"12:50","hours":0.83},{"start":"13:00","end":"13:50","hours":0.83}],
    "금": [{"start":"12:00","end":"12:50","hours":0.83},{"start":"13:00","end":"13:50","hours":0.83}],
    "토": [{"start":"16:00","end":"16:40","hours":0.67},{"start":"17:00","end":"17:50","hours":0.83}]
  }$$::jsonb, '2026-06-05'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0051'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0051');

-- 3) 동영문화센터 (POOL_0052) — 강남구 역삼동 772(동영휘트니스클럽). 사설.
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url
) values
  ('POOL_0052', '동영문화센터', '서울', '강남구',
    '서울특별시 강남구 역삼동 772',
    37.4977908515401, 127.044093813403, 'indoor', 'private',
    '02-5595-114', null,
    null, null, null, null,
    '{}', false, false, false,
    true, true,
    20000, 20000, 20000,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0052.jpg')
on conflict (id) do nothing;

insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0052', '풀스데이', $${
    "월": [{"start":"13:00","end":"14:00","hours":1},{"start":"21:00","end":"22:00","hours":1}],
    "화": [{"start":"13:00","end":"14:00","hours":1},{"start":"21:00","end":"22:00","hours":1}],
    "수": [{"start":"13:00","end":"14:00","hours":1},{"start":"21:00","end":"22:00","hours":1}],
    "목": [{"start":"13:00","end":"14:00","hours":1},{"start":"21:00","end":"22:00","hours":1}],
    "금": [{"start":"13:00","end":"14:00","hours":1},{"start":"21:00","end":"22:00","hours":1}],
    "토": [{"start":"12:00","end":"17:30","hours":5.5}],
    "일": [{"start":"09:00","end":"17:30","hours":8.5}]
  }$$::jsonb, $${"일":"둘째·넷째 주 일요일은 휴관입니다."}$$::jsonb, '2026-06-05'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0052'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0052');
