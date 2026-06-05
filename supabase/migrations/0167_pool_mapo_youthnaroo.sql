-- Pool's day — 시립마포청소년센터(유스나루)(POOL_0073) 신규. 마포구 성산동, 공공.
-- 크리스 제공 공식 캡처(2026-06-05): 일일 자유수영 = 일요일만(1·3주, 5~10월). 카카오 POI 좌표.
-- 일요일 1·3주 10:00~11:30·12:30~14:00·15:00~16:30. 성인 5500(부가세별도)·청소년3500·유아2700.
-- ★강한 제약: 1·3주 일요일 + 5~10월만 → day_note 필수. price_weekday=NULL(평일 자유수영 없음).
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url
) values
  ('POOL_0073', '시립마포청소년센터', '서울', '마포구',
    '서울특별시 마포구 월드컵로 212',
    37.5660160802352, 126.902086700343, 'indoor', 'public',
    '02-3153-5900', 'http://www.youthnaroo.or.kr/',
    null, null, null, null,
    '{}', false, false, false,
    true, true,
    5500, null, 5500,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0073.jpg')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0073', '풀스데이', $${
    "일": [{"start":"10:00","end":"11:30","hours":1.5},{"start":"12:30","end":"14:00","hours":1.5},{"start":"15:00","end":"16:30","hours":1.5}]
  }$$::jsonb, $${
    "일": "일일 자유수영은 매월 1·3주 일요일에만, 5~10월에 운영합니다(동절기·공휴일 미운영). 6세 이상 이용 가능, 성인 부가세 별도."
  }$$::jsonb, '2026-06-05'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0073' and exists (select 1 from public.schedules where pool_id = 'POOL_0073');
