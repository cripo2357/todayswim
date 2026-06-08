-- Pool's day — 강서구: 기쁜우리체육센터 추가 (POOL_0140). 사회복지법인 기쁜우리월드 운영=private.
--
-- ## 시간표 출처 [1차 — 운영자 공식]
-- 기쁜우리체육센터 공식 홈 비장애인프로그램 페이지(gibbunsports.or.kr/html/sub_page.php?frame=3-2)에
-- 자유수영 요일별 시각 + 일일입장료 명시. (장애인·비장애인 통합 체육시설, 비장애인 기준)
--   · 자유수영A: 월~금 13:00–13:50
--   · 자유수영B: 월·수·금 19:00–19:50
--   · 주말 자유수영 슬롯 없음.
-- - 가격: 성인 1일 입장 7,000원(아동 3,000·청소년 4,000). 주말 자유수영 없음 → price_weekend null.
--
-- ## 메타데이터 출처
-- - 좌표 [신뢰도 높음]: 카카오 POI "기쁜우리체육센터"(가양동 1466).
-- - 전화 02-3663-8114. 허준로 65. 사회복지법인 운영 → ownership=private.
-- - 규격 [2차 OK]: 25m 5레인 수심 1.3m(leonlsy 블로그). 유아풀 정보 없음.
-- - 사진 없음 → photo_url null (v1 로컬 폴백).

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0140', '기쁜우리체육센터', '서울', '강서구',
    '서울특별시 강서구 허준로 65',
    37.56900752795444, 126.84919184835681, 'indoor', 'private',
    '02-3663-8114', 'http://www.gibbunsports.or.kr/',
    5, 25, 1.3, 1.3,
    '{}', false, false, false,
    true, true,
    7000, null,
    null,
    'http://www.gibbunsports.or.kr/html/sub_page.php?frame=3-2')
on conflict (id) do nothing;

-- 자유수영 시간표. 50분=0.83. 주말 미운영.
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0140', '풀스데이', $${
    "월": [{"start":"13:00","end":"13:50","hours":0.83},{"start":"19:00","end":"19:50","hours":0.83}],
    "화": [{"start":"13:00","end":"13:50","hours":0.83}],
    "수": [{"start":"13:00","end":"13:50","hours":0.83},{"start":"19:00","end":"19:50","hours":0.83}],
    "목": [{"start":"13:00","end":"13:50","hours":0.83}],
    "금": [{"start":"13:00","end":"13:50","hours":0.83},{"start":"19:00","end":"19:50","hours":0.83}]
  }$$::jsonb, '{}'::jsonb, '2026-06-09'::timestamptz)
on conflict (pool_id) do nothing;

update public.pools
set has_schedule = true
where id = 'POOL_0140'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0140');
