-- Pool's day — 양천YMCA(POOL_0070) 신규. 양천구 목동, 자원회수시설 주민편익(YMCA 위탁), 자유수영 일일입장.
-- 크리스 제공 공식 캡처(2026-06-05): 일일 자유수영 08·12시(월~토)·18시(월수금)·13시(토). 일요일 휴관.
-- 일일입장 누구나 성인 3000·청소년 2000·어린이 1500. 카카오 POI 좌표(목동 900). 지하2층 수영장.
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url
) values
  ('POOL_0070', '양천YMCA', '서울', '양천구',
    '서울특별시 양천구 목동서로 20',
    37.5396352354302, 126.882713821463, 'indoor', 'public',
    '02-2652-8083', 'http://www.ycymca.or.kr/',
    null, null, null, null,
    '{}', false, false, false,
    true, true,
    3000, 3000, 3000,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0070.jpg')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, updated_at) values
  ('POOL_0070', '풀스데이', $${
    "월": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"12:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}],
    "화": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"12:50","hours":0.83}],
    "수": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"12:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}],
    "목": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"12:50","hours":0.83}],
    "금": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"12:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}],
    "토": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"12:50","hours":0.83},{"start":"13:00","end":"13:50","hours":0.83}]
  }$$::jsonb, '2026-06-05'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0070' and exists (select 1 from public.schedules where pool_id = 'POOL_0070');
