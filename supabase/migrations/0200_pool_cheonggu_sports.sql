-- Pool's day — 청구문화스포츠센터(POOL_0095) 신규. 중구 신당동(다산로 170, 청구초 옆), 청구교육문화관 민간위탁(korspo) 운영, 자유수영.
-- 크리스 제공 공식 캡처(2026-06-06): 자유수영 1일 입장은 '토요일만 가능'. 토 06:00~17:50(어린이수영 13시부터). 1회 일반 10,000·어린이 6,000. 월 110,000.
--   ※ 평일(06~08:50·13~21:50) 자유수영은 월 자유수영(월권) 전용 — 일일입장 불가라 일일 슬롯 제외. 25m 6레인. 사설(상업)성 운영·1만원이라 ownership=private.
-- 카카오 POI 좌표(서울청구초 후문 옆 = 다산로 170 정문). 전화 02-2231-9362.
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0095', '청구문화스포츠센터', '서울', '중구',
    '서울특별시 중구 다산로 170',
    37.5580062228795, 127.015019750011, 'indoor', 'private',
    '02-2231-9362', 'http://www.korspo.co.kr/cheonggu.php',
    6, 25, null, null,
    '{}', false, false, false,
    true, true,
    10000, null, 10000,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0095.jpg',
    'http://www.korspo.co.kr/cheonggu.php')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0095', '풀스데이', $${
    "토": [{"start":"06:00","end":"17:50","hours":11.83}]
  }$$::jsonb, $${
    "토": "1일 입장(일일권)은 토요일만 가능 — 평일은 월 자유수영 회원 전용. 어린이수영은 13시부터 입장."
  }$$::jsonb, '2026-06-06'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0095' and exists (select 1 from public.schedules where pool_id = 'POOL_0095');
