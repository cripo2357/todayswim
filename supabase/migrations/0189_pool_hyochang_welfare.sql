-- Pool's day — 효창종합사회복지관(POOL_0086) 신규. 용산구 효창동, 구립 위탁(공공), 자유수영 일일입장.
-- 크리스 제공 공식 사이트 캡처(2026-06-06, hyochang.or.kr): B1층 자유수영 월~금 08·13·18·21(주말 없음).
-- 일일입장 비회원 성인5,000·중고생4,500·어린이4,000 / 회원 성인4,500. 월정기(자유) 성인61,000. 정원 80명.
-- 카카오 POI 좌표(효창동 5-65 = 효창원로 146-12).
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url
) values
  ('POOL_0086', '효창종합사회복지관', '서울', '용산구',
    '서울특별시 용산구 효창원로 146-12',
    37.541143730615126, 126.96310121977255, 'indoor', 'public',
    '02-716-0600', 'https://www.hyochang.or.kr/',
    null, null, null, null,
    '{}', false, false, false,
    true, true,
    5000, 5000, null,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0086.jpg')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0086', '풀스데이', $${
    "월": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"13:00","end":"13:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83},{"start":"21:00","end":"21:50","hours":0.83}],
    "화": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"13:00","end":"13:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83},{"start":"21:00","end":"21:50","hours":0.83}],
    "수": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"13:00","end":"13:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83},{"start":"21:00","end":"21:50","hours":0.83}],
    "목": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"13:00","end":"13:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83},{"start":"21:00","end":"21:50","hours":0.83}],
    "금": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"13:00","end":"13:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83},{"start":"21:00","end":"21:50","hours":0.83}]
  }$$::jsonb, '{}'::jsonb, '2026-06-06'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0086' and exists (select 1 from public.schedules where pool_id = 'POOL_0086');
