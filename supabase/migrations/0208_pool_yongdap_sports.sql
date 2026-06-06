-- Pool's day — 성동구립용답체육센터(POOL_0101) 신규. 성동구 용답동(천호대로78길 15-48), 구립(성동구도시관리공단), 자유수영 토요일만.
-- 공식 출처(2026-06-06, sports.happysd.or.kr/fmcs/121): 토요일 07·12·13·14·15·16·17·18시(8타임). 평일 자유수영 없음. 일요일·공휴일 휴관.
-- 일일 성인 4,000원·청소년 2,500원·유아·어린이 2,000원. 25m 6레인. 전화 02-2204-6620.
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0101', '성동구립용답체육센터', '서울', '성동구',
    '서울특별시 성동구 천호대로78길 15-48',
    37.5620183714027, 127.056585987393, 'indoor', 'public',
    '02-2204-6620', 'https://sports.happysd.or.kr/',
    6, 25, null, null,
    '{}', false, false, false,
    true, true,
    4000, null, 4000,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0101.jpg',
    'https://sports.happysd.or.kr/fmcs/121')
on conflict (id) do nothing;

insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0101', '풀스데이', $${
    "토": [{"start":"07:00","end":"07:50","hours":0.83},{"start":"12:00","end":"12:50","hours":0.83},{"start":"13:00","end":"13:50","hours":0.83},{"start":"14:00","end":"14:50","hours":0.83},{"start":"15:00","end":"15:50","hours":0.83},{"start":"16:00","end":"16:50","hours":0.83},{"start":"17:00","end":"17:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}]
  }$$::jsonb, '{}'::jsonb, '2026-06-06'::timestamptz)
on conflict (pool_id) do nothing;

update public.pools set has_schedule = true where id = 'POOL_0101'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0101');
