-- Pool's day — 종로문화체육센터(POOL_0091) 신규. 종로구 사직동(늘푸른수영장), 구립(종로구시설관리공단), 자유수영 일일입장.
-- 크리스 제공 공식 캡처(2026-06-06, 출처=종로구시설관리공단): 주말 자유수영(일일입장) — 토 15:00~16:50 / 일 1부 11:00~12:50·2부 15:00~16:50. 성인 6,050·청소년 4,620·초등생 3,080.
--   ※ 주중(화·목 18:00)은 '월 자유수영'(성인 35,200원/월, 강사채용 시 강습반 전환)이라 일일입장 아님 → 일일 슬롯 제외. 일일입장 자유수영은 주말 전용.
-- 카카오 POI 좌표(종로문화체육센터, 사직동 284-1). 대표전화 02-6048-1234.
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0091', '종로문화체육센터', '서울', '종로구',
    '서울특별시 종로구 사직동 284-1',
    37.5744702968622, 126.964671876471, 'indoor', 'public',
    '02-6048-1234', 'https://www.ijongno.co.kr/fmcs/41',
    null, null, null, null,
    '{}', false, false, false,
    true, true,
    6050, null, 6050,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0091.jpg',
    'https://www.ijongno.co.kr/fmcs/41')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0091', '풀스데이', $${
    "토": [{"start":"15:00","end":"16:50","hours":1.83}],
    "일": [{"start":"11:00","end":"12:50","hours":1.83},{"start":"15:00","end":"16:50","hours":1.83}]
  }$$::jsonb, $${
    "토": "주중(화·목 18시) 자유수영은 월 자유수영 회원 전용 — 일일입장은 주말만 가능"
  }$$::jsonb, '2026-06-06'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0091' and exists (select 1 from public.schedules where pool_id = 'POOL_0091');
