-- Pool's day — 용산초등학교수영장(POOL_0087) 신규. 용산구 한강로2가(삼각지역 인근), 학교풀 민간위탁(private), 자유수영 일일입장.
-- 크리스 제공 캡처(2026-06-06, 친환경수영복 DIVE 블로그 / 운영=용산수영장 네이버카페): 평일·토 12:00~13:50 자유수영(1h50m), 일요일 없음.
-- 비회원 성인 10,000원, 25m 레인. 카카오 POI 좌표(한강로2가 1 = 서울용산초등학교 수영장).
-- ⚠ schedule_source_url 미기록: 공식 자유수영 시간표 URL(네이버카페/블로그) 크리스 확인 후 후속 UPDATE 예정.
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url
) values
  ('POOL_0087', '용산초등학교수영장', '서울', '용산구',
    '서울특별시 용산구 한강로2가 1',
    37.5351997131488, 126.972592299562, 'indoor', 'private',
    null, null,
    null, 25, null, null,
    '{}', false, false, false,
    true, true,
    10000, 10000, 10000,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0087.jpg')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0087', '풀스데이', $${
    "월": [{"start":"12:00","end":"13:50","hours":1.83}],
    "화": [{"start":"12:00","end":"13:50","hours":1.83}],
    "수": [{"start":"12:00","end":"13:50","hours":1.83}],
    "목": [{"start":"12:00","end":"13:50","hours":1.83}],
    "금": [{"start":"12:00","end":"13:50","hours":1.83}],
    "토": [{"start":"12:00","end":"13:50","hours":1.83}]
  }$$::jsonb, '{}'::jsonb, '2026-06-06'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0087' and exists (select 1 from public.schedules where pool_id = 'POOL_0087');
