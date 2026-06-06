-- Pool's day — 열린금호교육문화관(POOL_0102) 신규. 성동구 금호동2가(무수막길 69), 구립(성동구도시관리공단), 자유수영 토요일 1타임.
-- 공식 출처(2026-06-06, sports.happysd.or.kr/fmcs/71): 토요일 18:00~18:50(1타임). 평일 자유수영 없음. 일요일·공휴일 휴관.
-- 일일 성인 4,000원·청소년 2,500원·유아·어린이 2,000원. 25m 5레인(수심 1.2~1.5m) + 어린이풀 10m 3레인. 전화 02-2204-7650.
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0102', '열린금호교육문화관', '서울', '성동구',
    '서울특별시 성동구 무수막길 69',
    37.552512153439906, 127.01969139204681, 'indoor', 'public',
    '02-2204-7650', 'https://sports.happysd.or.kr/',
    5, 25, 1.2, 1.5,
    '{}', true, false, false,
    true, true,
    4000, null, 4000,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0102.jpg',
    'https://sports.happysd.or.kr/fmcs/71')
on conflict (id) do nothing;

insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0102', '풀스데이', $${
    "토": [{"start":"18:00","end":"18:50","hours":0.83}]
  }$$::jsonb, '{}'::jsonb, '2026-06-06'::timestamptz)
on conflict (pool_id) do nothing;

update public.pools set has_schedule = true where id = 'POOL_0102'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0102');
