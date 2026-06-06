-- Pool's day — 종로구민회관(POOL_0092) 신규. 종로구 창신동(지봉로5길), 구립(종로구시설관리공단), 자유수영 일일입장.
-- 크리스 제공 공식 캡처(2026-06-06, 출처=종로구시설관리공단) + 공식 교차확인: 주말 자유수영(일일입장) — 토·일 1부 10:00~11:50·2부 13:00~14:50. 성인 6,050·청소년 4,620·어린이 3,080. 정원 100명.
--   ※ 주중(화목/월수금/월~금 15·16시) 자유수영은 '월 자유수영'(월권)이라 일일입장 아님 → 일일 슬롯 제외.
-- B1, 25m 6레인 인공해수풀 + 유아풀. 카카오 POI 좌표(종로구민회관 수영장, 창신동 222-8).
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0092', '종로구민회관', '서울', '종로구',
    '서울특별시 종로구 지봉로5길 7-5',
    37.5734980215003, 127.014439877311, 'indoor', 'public',
    null, 'https://www.ijongno.co.kr/fmcs/29',
    6, 25, null, null,
    '{}', true, false, false,
    true, true,
    6050, null, 6050,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0092.jpg',
    'https://www.ijongno.co.kr/fmcs/29')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0092', '풀스데이', $${
    "토": [{"start":"10:00","end":"11:50","hours":1.83},{"start":"13:00","end":"14:50","hours":1.83}],
    "일": [{"start":"10:00","end":"11:50","hours":1.83},{"start":"13:00","end":"14:50","hours":1.83}]
  }$$::jsonb, $${
    "토": "주중 자유수영은 월 자유수영 회원 전용 — 일일입장은 주말만 가능"
  }$$::jsonb, '2026-06-06'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0092' and exists (select 1 from public.schedules where pool_id = 'POOL_0092');
