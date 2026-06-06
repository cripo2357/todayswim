-- Pool's day — 성동구민종합체육센터(POOL_0098) 신규. 성동구 성수동1가(왕십리로 89), 구립(성동구도시관리공단), 자유수영 일일입장.
-- 크리스 제공 공식 캡처(2026-06-06, sports.happysd.or.kr/fmcs/18 일일입장안내): 토요일 자유수영 17:00~18:30. 정원 80명.
--   일일입장 성인 5,300·청소년 3,800·어린이 2,700. (일일입장안내 페이지상 자유수영 일일입장은 토요일 단일 타임 — 평일·일요일은 강습/월권.)
-- 카카오 POI 좌표(성동구민종합체육센터, 성수동1가 685-697). 전화 02-2204-7600.
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0098', '성동구민종합체육센터', '서울', '성동구',
    '서울특별시 성동구 왕십리로 89',
    37.5457525322211, 127.044216761294, 'indoor', 'public',
    '02-2204-7600', 'https://sports.happysd.or.kr/fmcs/3',
    null, null, null, null,
    '{}', false, false, false,
    true, true,
    5300, null, 5300,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0098.jpg',
    'https://sports.happysd.or.kr/fmcs/18')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0098', '풀스데이', $${
    "토": [{"start":"17:00","end":"18:30","hours":1.5}]
  }$$::jsonb, '{}'::jsonb, '2026-06-06'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0098' and exists (select 1 from public.schedules where pool_id = 'POOL_0098');
