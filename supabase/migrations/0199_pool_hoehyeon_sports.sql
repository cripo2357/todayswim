-- Pool's day — 회현체육센터(POOL_0094) 신규. 중구 회현동, 구립(중구시설관리공단), 자유수영 일일입장.
-- 크리스 제공 공식 텍스트(2026-06-06, e-junggu.or.kr/fmcs/203): 자유수영(일일·1개월) — 월~금 08:00·12:00~13:50·21:00 / 토 06:00~11:50·14:00~19:50 / 일 09:30~12:50·14:00~17:20.
--   일일입장(1일 1회) 성인 6,000·어린이 5,000. (검색요약의 '일 1·3·5주'·'성인 5,000'은 오류 — 공식은 매주·6,000.)
-- 카카오 POI 좌표(중구회현체육센터, 회현동1가 115 = 퇴계로12길 78). 전화 02-2280-8430.
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0094', '회현체육센터', '서울', '중구',
    '서울특별시 중구 퇴계로12길 78',
    37.5560505784043, 126.98158880964, 'indoor', 'public',
    '02-2280-8430', 'https://www.e-junggu.or.kr/fmcs/203',
    null, null, null, null,
    '{}', false, false, false,
    true, true,
    6000, 6000, 6000,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0094.jpg',
    'https://www.e-junggu.or.kr/fmcs/203')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0094', '풀스데이', $${
    "월": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"13:50","hours":1.83},{"start":"21:00","end":"21:50","hours":0.83}],
    "화": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"13:50","hours":1.83},{"start":"21:00","end":"21:50","hours":0.83}],
    "수": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"13:50","hours":1.83},{"start":"21:00","end":"21:50","hours":0.83}],
    "목": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"13:50","hours":1.83},{"start":"21:00","end":"21:50","hours":0.83}],
    "금": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"13:50","hours":1.83},{"start":"21:00","end":"21:50","hours":0.83}],
    "토": [{"start":"06:00","end":"11:50","hours":5.83},{"start":"14:00","end":"19:50","hours":5.83}],
    "일": [{"start":"09:30","end":"12:50","hours":3.33},{"start":"14:00","end":"17:20","hours":3.33}]
  }$$::jsonb, '{}'::jsonb, '2026-06-06'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0094' and exists (select 1 from public.schedules where pool_id = 'POOL_0094');
