-- Pool's day — 서대문문화체육회관수영장(POOL_0075) 신규. 서대문구 홍은동, 공공, 자유수영.
-- 크리스 제공 공식 캡처(2026-06-05): 1일 자유수영=토요일만(평일은 월정기 전용). 카카오 POI 좌표.
-- 토 6타임 08·09·10·11·15·16시. 일일 성인4500·청소년3200·유아초등2200. 7레인.
-- 평일 월정기(월수금 08·15·18 / 화목 08·15)는 일일입장 불가 → day_note 명시.
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url
) values
  ('POOL_0075', '서대문문화체육회관수영장', '서울', '서대문구',
    '서울특별시 서대문구 백련사길 39',
    37.58075909689231, 126.93155676195146, 'indoor', 'public',
    '02-360-8684', 'https://cs.sscmc.or.kr/',
    7, null, null, null,
    '{}', false, false, false,
    true, true,
    4500, null, 4500,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0075.jpg')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0075', '풀스데이', $${
    "토": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"09:00","end":"09:50","hours":0.83},{"start":"10:00","end":"10:50","hours":0.83},{"start":"11:00","end":"11:50","hours":0.83},{"start":"15:00","end":"15:50","hours":0.83},{"start":"16:00","end":"16:50","hours":0.83}]
  }$$::jsonb, $${
    "토": "1일 자유수영은 토요일만 가능합니다(성인 4500·청소년 3200·유아초등 2200). 평일은 월 정기권 회원 전용(월수금 08·15·18시, 화목 08·15시)."
  }$$::jsonb, '2026-06-05'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0075' and exists (select 1 from public.schedules where pool_id = 'POOL_0075');
