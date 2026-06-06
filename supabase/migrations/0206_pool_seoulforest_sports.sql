-- Pool's day — 서울숲복합문화체육센터(POOL_0099) 신규. 성동구 성수동1가, 구립(성동구도시관리공단), 자유수영 일일입장.
-- 공식 출처(2026-06-06, sports.happysd.or.kr/fmcs/38): 평일 12:10(월~금)+13:10(화목) / 토 16:10·17:10·18:10 / 일(2·4주) 09:30·11:30·13:30.
--   일일입장 평일·토 성인 4,000 / 일 성인 7,000. 성인풀+유아풀. 일요일은 매월 2·4주만(2026-03-08~).
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0099', '서울숲복합문화체육센터', '서울', '성동구',
    '서울특별시 성동구 성수동1가 685-61',
    37.549222352700916, 127.04153116737272, 'indoor', 'public',
    null, 'https://sports.happysd.or.kr/',
    null, null, null, null,
    '{}', true, false, false,
    true, true,
    4000, 4000, 4000,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0099.jpg',
    'https://sports.happysd.or.kr/fmcs/38')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0099', '풀스데이', $${
    "월": [{"start":"12:10","end":"13:00","hours":0.83}],
    "화": [{"start":"12:10","end":"13:00","hours":0.83},{"start":"13:10","end":"14:00","hours":0.83}],
    "수": [{"start":"12:10","end":"13:00","hours":0.83}],
    "목": [{"start":"12:10","end":"13:00","hours":0.83},{"start":"13:10","end":"14:00","hours":0.83}],
    "금": [{"start":"12:10","end":"13:00","hours":0.83}],
    "토": [{"start":"16:10","end":"17:00","hours":0.83},{"start":"17:10","end":"18:00","hours":0.83},{"start":"18:10","end":"19:00","hours":0.83}],
    "일": [{"start":"09:30","end":"10:50","hours":1.33},{"start":"11:30","end":"12:50","hours":1.33},{"start":"13:30","end":"14:50","hours":1.33}]
  }$$::jsonb, $${
    "일": "자유수영은 매월 2·4주 일요일만 운영(2026-03-08~), 일일입장 성인 7,000원"
  }$$::jsonb, '2026-06-06'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0099' and exists (select 1 from public.schedules where pool_id = 'POOL_0099');
