-- Pool's day — 마포아트센터수영장(POOL_0072) 신규. 마포구 대흥동, 마포문화재단 운영, 자유수영 일일입장.
-- 공식 일일입장 안내(mfac.or.kr, 2026-06-05): 마포아트센터 B1 수영장. 카카오 POI 좌표(대흥동 30-3).
-- 평일 08·12·21시 / 토 5타임(07·10·13·16·19) / 일·공휴일 3타임(09·12·15). 일일 성인 평일3500·주말4200.
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url
) values
  ('POOL_0072', '마포아트센터수영장', '서울', '마포구',
    '서울특별시 마포구 대흥로20길 28',
    37.5498766515768, 126.945590301101, 'indoor', 'public',
    null, 'http://www.mapoartcenter.or.kr/',
    null, null, null, null,
    '{}', false, false, false,
    true, true,
    3500, 3500, 4200,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0072.jpg')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, updated_at) values
  ('POOL_0072', '풀스데이', $${
    "월": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"12:50","hours":0.83},{"start":"21:00","end":"21:50","hours":0.83}],
    "화": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"12:50","hours":0.83},{"start":"21:00","end":"21:50","hours":0.83}],
    "수": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"12:50","hours":0.83},{"start":"21:00","end":"21:50","hours":0.83}],
    "목": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"12:50","hours":0.83},{"start":"21:00","end":"21:50","hours":0.83}],
    "금": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"12:50","hours":0.83},{"start":"21:00","end":"21:50","hours":0.83}],
    "토": [{"start":"07:00","end":"08:50","hours":1.83},{"start":"10:00","end":"11:50","hours":1.83},{"start":"13:00","end":"14:50","hours":1.83},{"start":"16:00","end":"17:50","hours":1.83},{"start":"19:00","end":"20:50","hours":1.83}],
    "일": [{"start":"09:00","end":"10:50","hours":1.83},{"start":"12:00","end":"13:50","hours":1.83},{"start":"15:00","end":"16:50","hours":1.83}]
  }$$::jsonb, '2026-06-05'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0072' and exists (select 1 from public.schedules where pool_id = 'POOL_0072');
