-- Pool's day — 월드컵스파랜드24(POOL_0074) 신규. 마포구 성산동, 사설(찜질방 복합), 자유수영.
-- 크리스 제공 현장 캡처(2026-06-05): 일일입장 자유수영=토·일·공휴일 10:00~19:30만(평일은 월정기 전용).
-- 카카오 POI 좌표(성산동 515-9). 일일 단독요금 미표시 → swimmingis '수영+찜질 12000' 추정, day_note 보강.
-- 평일 06:00~22:30은 월정기권(월10만) 전용 → 일일입장 by_day는 토·일만. 정기점검=매월 셋째 월요일.
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url
) values
  ('POOL_0074', '월드컵스파랜드24', '서울', '마포구',
    '서울특별시 마포구 월드컵로 240',
    37.5673455805972, 126.897407895075, 'indoor', 'private',
    '02-302-7002', 'http://www.sponspa.co.kr/',
    null, null, null, null,
    '{}', false, false, false,
    true, true,
    12000, null, 12000,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0074.jpg')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0074', '풀스데이', $${
    "토": [{"start":"10:00","end":"19:30","hours":9.5}],
    "일": [{"start":"10:00","end":"19:30","hours":9.5}]
  }$$::jsonb, $${
    "토": "일일입장 자유수영은 토·일·공휴일 10:00~19:30입니다(수영+찜질 통합권, 요금 현장 확인). 평일은 월 정기권(월 100,000원)으로 06:00~22:30 이용. 정기점검=매월 셋째 월요일.",
    "일": "일일입장 자유수영은 토·일·공휴일 10:00~19:30입니다(수영+찜질 통합권, 요금 현장 확인). 평일은 월 정기권(월 100,000원)으로 06:00~22:30 이용. 정기점검=매월 셋째 월요일."
  }$$::jsonb, '2026-06-05'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0074' and exists (select 1 from public.schedules where pool_id = 'POOL_0074');
