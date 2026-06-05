-- Pool's day — 시립서대문청소년센터(POOL_0076) 신규. 서대문구 연희동, 공공, 자유수영 일일입장.
-- 크리스 캡처 + 공식(fun1318.or.kr) 확인(2026-06-05): 일일입장 누구나. 카카오 POI 좌표(연희동 167).
-- 월수금 08·12·18시 / 화목 12시 / 토 16시. 일일 성인 평일4700·토6100, 청소년2500·유아1800.
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url
) values
  ('POOL_0076', '시립서대문청소년센터', '서울', '서대문구',
    '서울특별시 서대문구 연희로32길 129',
    37.57897526665659, 126.93834640299603, 'indoor', 'public',
    '02-334-0080', 'https://www.fun1318.or.kr/',
    5, 25, null, null,
    '{}', false, false, false,
    true, true,
    4700, 4700, 6100,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0076.jpg')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, updated_at) values
  ('POOL_0076', '풀스데이', $${
    "월": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"12:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}],
    "화": [{"start":"12:00","end":"12:50","hours":0.83}],
    "수": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"12:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}],
    "목": [{"start":"12:00","end":"12:50","hours":0.83}],
    "금": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"12:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}],
    "토": [{"start":"16:00","end":"16:50","hours":0.83}]
  }$$::jsonb, '2026-06-05'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0076' and exists (select 1 from public.schedules where pool_id = 'POOL_0076');
