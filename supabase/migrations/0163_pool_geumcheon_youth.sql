-- Pool's day — 시립금천청소년센터(POOL_0069) 신규. 금천구 공공, 자유수영 일일입장 개방.
-- 크리스 제공 공식 캡처(2026-06-05): 일일입장 가능(시립구로와 달리). 카카오 POI 좌표(시흥동).
-- 자유수영: 월수금 08:00·12:00~13:50 / 화목 08:00·12:00 / 토 5타임(청소년 전용!) / 일 4타임.
-- 일일 성인 평일 4290·일요일 4950(VAT 별도). ★토요일은 청소년 전용(성인·유아 불가) → day_note 필수.
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url
) values
  ('POOL_0069', '시립금천청소년센터', '서울', '금천구',
    '서울특별시 금천구 금하로30길 54',
    37.4482616457851, 126.915684244388, 'indoor', 'public',
    '02-803-1318', 'http://www.cyc.or.kr/',
    null, null, null, null,
    '{}', false, false, false,
    true, true,
    4290, 4290, 4950,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0069.jpg')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0069', '풀스데이', $${
    "월": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"13:50","hours":1.83}],
    "화": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"12:50","hours":0.83}],
    "수": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"13:50","hours":1.83}],
    "목": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"12:50","hours":0.83}],
    "금": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"13:50","hours":1.83}],
    "토": [{"start":"09:00","end":"10:50","hours":1.83},{"start":"11:00","end":"11:50","hours":0.83},{"start":"13:00","end":"14:50","hours":1.83},{"start":"15:00","end":"16:50","hours":1.83},{"start":"17:00","end":"17:50","hours":0.83}],
    "일": [{"start":"13:00","end":"13:50","hours":0.83},{"start":"14:00","end":"14:50","hours":0.83},{"start":"15:00","end":"15:50","hours":0.83},{"start":"16:00","end":"16:50","hours":0.83}]
  }$$::jsonb, $${
    "토": "토요일 자유수영은 청소년 전용으로 성인·유아는 이용할 수 없습니다. 5~7세는 보호자 동반 입장."
  }$$::jsonb, '2026-06-05'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0069' and exists (select 1 from public.schedules where pool_id = 'POOL_0069');
