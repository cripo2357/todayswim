-- Pool's day — 서울YWCA스포츠센터(POOL_0096) 신규. 중구 명동(명동1가 1-1, 서울YWCA회관), 단체(사설), 자유수영 일일입장(비회원).
-- 크리스 제공 공식 캡처(2026-06-06, seoulywca.or.kr): 자유수영 대상=회원 및 비회원, 회비(1회) 회원 7,000·비회원 8,000.
--   월~금 08:00~08:50·12:00~13:50·17:00~18:20 + 월수금 추가 20:30~21:20. 주말 운영 없음(캡처상).
--   ※ 수심 깊어 미취학아동·신장 130cm 미만 입장불가. 임산부는 월~금 13:00~13:50만. 입장은 각 타임 종료 20분 전까지.
-- 카카오 POI 좌표(서울YWCA 스포츠센터).
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0096', '서울YWCA스포츠센터', '서울', '중구',
    '서울특별시 중구 명동11길 20',
    37.5648845780827, 126.986177526151, 'indoor', 'private',
    null, 'https://www.seoulywca.or.kr/',
    null, null, null, null,
    '{}', false, false, false,
    true, true,
    8000, 8000, null,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0096.jpg',
    'https://www.seoulywca.or.kr/bbs/board.php?bo_table=board020202')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0096', '풀스데이', $${
    "월": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"13:50","hours":1.83},{"start":"17:00","end":"18:20","hours":1.33},{"start":"20:30","end":"21:20","hours":0.83}],
    "화": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"13:50","hours":1.83},{"start":"17:00","end":"18:20","hours":1.33}],
    "수": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"13:50","hours":1.83},{"start":"17:00","end":"18:20","hours":1.33},{"start":"20:30","end":"21:20","hours":0.83}],
    "목": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"13:50","hours":1.83},{"start":"17:00","end":"18:20","hours":1.33}],
    "금": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"13:50","hours":1.83},{"start":"17:00","end":"18:20","hours":1.33},{"start":"20:30","end":"21:20","hours":0.83}]
  }$$::jsonb, $${
    "월": "수심 깊어 미취학아동·신장 130cm 미만 입장 불가. 입장은 각 타임 종료 20분 전까지."
  }$$::jsonb, '2026-06-06'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0096' and exists (select 1 from public.schedules where pool_id = 'POOL_0096');
