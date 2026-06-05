-- Pool's day — 은평구민체육센터(POOL_0078) 신규. 은평구 진관동, 공공, 자유수영 일일입장.
-- 크리스 제공 공식 캡처(2026-06-05): 평일 08·18(화목+19) / 토 9타임 / 일 6타임(둘째주만). 카카오 POI 좌표.
-- 평일 성인4000·주말5000. ★일요일은 매월 둘째 주만 운영(월1회) → day_note.
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url
) values
  ('POOL_0078', '은평구민체육센터', '서울', '은평구',
    '서울특별시 은평구 진관1로 40',
    37.6304672142618, 126.923581111978, 'indoor', 'public',
    '02-350-5351', 'https://efmc.or.kr/',
    null, null, null, null,
    '{}', false, false, false,
    true, true,
    4000, 4000, 5000,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0078.jpg')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0078', '풀스데이', $${
    "월": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}],
    "화": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83},{"start":"19:00","end":"19:50","hours":0.83}],
    "수": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}],
    "목": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83},{"start":"19:00","end":"19:50","hours":0.83}],
    "금": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}],
    "토": [{"start":"06:10","end":"07:00","hours":0.83},{"start":"07:10","end":"07:50","hours":0.67},{"start":"09:00","end":"09:50","hours":0.83},{"start":"10:00","end":"10:50","hours":0.83},{"start":"13:00","end":"13:50","hours":0.83},{"start":"14:00","end":"14:50","hours":0.83},{"start":"15:00","end":"15:50","hours":0.83},{"start":"16:00","end":"16:50","hours":0.83},{"start":"17:00","end":"17:50","hours":0.83}],
    "일": [{"start":"10:00","end":"10:50","hours":0.83},{"start":"11:00","end":"11:50","hours":0.83},{"start":"13:00","end":"13:50","hours":0.83},{"start":"14:00","end":"14:50","hours":0.83},{"start":"15:00","end":"15:50","hours":0.83},{"start":"16:00","end":"16:50","hours":0.83}]
  }$$::jsonb, $${
    "일": "일요일 자유수영은 매월 둘째 주 일요일만 운영합니다(월 1회)."
  }$$::jsonb, '2026-06-05'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0078' and exists (select 1 from public.schedules where pool_id = 'POOL_0078');
