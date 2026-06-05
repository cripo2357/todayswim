-- Pool's day — 은평청여울수영장(POOL_0079) 신규. 은평구 대조동, 공공, 자유수영 일일입장.
-- 크리스 제공 공식 캡처(2026-06-05): 요일별 시간 상이. 카카오 POI 좌표(대조동 241=통일로 767).
-- 월~목 08·12~13:50·22 / 금 06~13:50·19~21:50 / 토 08~10:50·13~16:50 / 일·공휴일 10~11:50·13~15:40.
-- ★일요일 자유수영은 쿠폰권만 입장 가능 → day_note. 요금=25m.kr 성인4000(캡처 요금 미표시).
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url
) values
  ('POOL_0079', '은평청여울수영장', '서울', '은평구',
    '서울특별시 은평구 통일로 767',
    37.6139882057273, 126.926492955109, 'indoor', 'public',
    null, null,
    null, null, null, null,
    '{}', false, false, false,
    true, true,
    4000, 4000, 4000,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0079.jpg')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0079', '풀스데이', $${
    "월": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"13:50","hours":1.83},{"start":"22:00","end":"22:50","hours":0.83}],
    "화": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"13:50","hours":1.83},{"start":"22:00","end":"22:50","hours":0.83}],
    "수": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"13:50","hours":1.83},{"start":"22:00","end":"22:50","hours":0.83}],
    "목": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"13:50","hours":1.83},{"start":"22:00","end":"22:50","hours":0.83}],
    "금": [{"start":"06:00","end":"13:50","hours":7.83},{"start":"19:00","end":"21:50","hours":2.83}],
    "토": [{"start":"08:00","end":"10:50","hours":2.83},{"start":"13:00","end":"16:50","hours":3.83}],
    "일": [{"start":"10:00","end":"11:50","hours":1.83},{"start":"13:00","end":"15:40","hours":2.67}]
  }$$::jsonb, $${
    "일": "일요일·공휴일 자유수영은 쿠폰권만 입장 가능합니다."
  }$$::jsonb, '2026-06-05'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0079' and exists (select 1 from public.schedules where pool_id = 'POOL_0079');
