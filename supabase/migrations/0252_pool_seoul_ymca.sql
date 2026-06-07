-- Pool's day — 종로구: 서울YMCA 수영장 추가 (POOL_0129). 민간(YMCA).
--
-- ## 시간표 출처 [1차 — 운영자 공식]
--
-- 크리스가 서울YMCA 사회체육부 공식 홈페이지(peymca.or.kr/program/pro2.php) 자유수영표 캡처 제공.
--
-- - 자유수영(1일 입장):
--   · 굿모닝: 월~토 08:10–08:50 (누구나)
--   · 굿눈  : 월~금 12:10–13:40 (성인 대상)
--   · 굿이브닝: 월~금 18:00–18:50 (누구나)
--   · 일요일 미운영.
-- - 가격: 1일 입장 성인 비회원 10,000 (크리스 지시로 10,000 단일 적용).
--
-- ## 메타데이터 출처
-- - 좌표 [신뢰도 높음]: 카카오 POI "서울YMCA 수영장"(종로2가 9).
-- - 전화: 02-730-9391. 종로 69. 민간(YMCA) → ownership=private.
-- - 레인/길이/수심·유아풀 정보 없음 → null / has_kids_pool=false.
--
-- 사진: pool-photos/POOL_0129.jpg(400px) → prod Storage 업로드. photo_url=prod host.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0129', '서울YMCA', '서울', '종로구',
    '서울특별시 종로구 종로 69',
    37.5704237989085, 126.985338852028, 'indoor', 'private',
    '02-730-9391', 'http://www.peymca.or.kr/',
    null, null, null, null,
    '{}', false, false, false,
    true, true,
    10000, 10000,
    'https://rwxefcbqybzsyjtpfbdt.supabase.co/storage/v1/object/public/pool-photos/POOL_0129.jpg',
    'http://www.peymca.or.kr/program/pro2.php')
on conflict (id) do nothing;

-- 자유수영 시간표. 40분=0.67, 90분=1.5, 50분=0.83.
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0129', '풀스데이', $${
    "월": [{"start":"08:10","end":"08:50","hours":0.67},{"start":"12:10","end":"13:40","hours":1.5},{"start":"18:00","end":"18:50","hours":0.83}],
    "화": [{"start":"08:10","end":"08:50","hours":0.67},{"start":"12:10","end":"13:40","hours":1.5},{"start":"18:00","end":"18:50","hours":0.83}],
    "수": [{"start":"08:10","end":"08:50","hours":0.67},{"start":"12:10","end":"13:40","hours":1.5},{"start":"18:00","end":"18:50","hours":0.83}],
    "목": [{"start":"08:10","end":"08:50","hours":0.67},{"start":"12:10","end":"13:40","hours":1.5},{"start":"18:00","end":"18:50","hours":0.83}],
    "금": [{"start":"08:10","end":"08:50","hours":0.67},{"start":"12:10","end":"13:40","hours":1.5},{"start":"18:00","end":"18:50","hours":0.83}],
    "토": [{"start":"08:10","end":"08:50","hours":0.67}]
  }$$::jsonb, $${
    "월":"낮 12시대(굿눈)는 성인만 이용할 수 있습니다.",
    "화":"낮 12시대(굿눈)는 성인만 이용할 수 있습니다.",
    "수":"낮 12시대(굿눈)는 성인만 이용할 수 있습니다.",
    "목":"낮 12시대(굿눈)는 성인만 이용할 수 있습니다.",
    "금":"낮 12시대(굿눈)는 성인만 이용할 수 있습니다."
  }$$::jsonb, '2026-06-07'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_0129'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0129');
