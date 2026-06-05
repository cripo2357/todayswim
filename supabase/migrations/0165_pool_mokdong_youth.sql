-- Pool's day — 시립목동청소년센터(POOL_0071) 신규. 양천구 목동, 공공, 자유수영 일일입장.
-- 크리스 제공 공식 캡처(2026-06-05): 일일입장 가능. 카카오 POI 좌표(목동 918).
-- 평일 자유수영 월~금 20:00 / 화목 07:00 추가. 청소년 자유수영 화목토 14:00(청소년 전용).
-- 일일 비회원 성인 4300(회원 4000). ★화목토 14시는 청소년 전용 → day_note 명시.
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url
) values
  ('POOL_0071', '시립목동청소년센터', '서울', '양천구',
    '서울특별시 양천구 목동 918',
    37.5306610399175, 126.875446452976, 'indoor', 'public',
    '02-2642-1318', 'http://www.wawa.or.kr/',
    null, null, null, null,
    '{}', false, false, false,
    true, true,
    4300, 4300, 4300,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0071.jpg')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0071', '풀스데이', $${
    "월": [{"start":"20:00","end":"20:50","hours":0.83}],
    "화": [{"start":"07:00","end":"07:50","hours":0.83},{"start":"14:00","end":"14:50","hours":0.83},{"start":"20:00","end":"20:50","hours":0.83}],
    "수": [{"start":"20:00","end":"20:50","hours":0.83}],
    "목": [{"start":"07:00","end":"07:50","hours":0.83},{"start":"14:00","end":"14:50","hours":0.83},{"start":"20:00","end":"20:50","hours":0.83}],
    "금": [{"start":"20:00","end":"20:50","hours":0.83}],
    "토": [{"start":"14:00","end":"14:50","hours":0.83}]
  }$$::jsonb, $${
    "화": "14:00~14:50은 청소년 자유수영으로 청소년만 입장할 수 있습니다(청소년 동반 시 입장 가능).",
    "목": "14:00~14:50은 청소년 자유수영으로 청소년만 입장할 수 있습니다(청소년 동반 시 입장 가능).",
    "토": "토요일은 청소년 자유수영(14:00~14:50)만 운영하며 청소년만 입장할 수 있습니다(청소년 동반 시 입장 가능)."
  }$$::jsonb, '2026-06-05'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0071' and exists (select 1 from public.schedules where pool_id = 'POOL_0071');
