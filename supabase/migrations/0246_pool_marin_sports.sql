-- Pool's day — 노원구 보강: 마린스포츠센터 추가 (POOL_0126). 사설.
--
-- ## 시간표 출처 [1차 — 운영자 공식 홈페이지]
--
-- 크리스가 마린스포츠센터 공식 홈페이지(marinsports.co.kr) 자유수영 프로그램표 캡처 제공.
--
-- - 자유수영(시간대별, 레인 별도 운영):
--   · 평일(월~금): 06:00–09:00, 13:00–16:00, 19:00–22:00
--   · 토: 06:00–09:00, 13:00–19:00
--   · 일: 08:00–10:00, 12:00–17:00
--   · 공휴일: 09:00–12:30, 13:30–17:00 (by_day 미표기)
-- - 가격: 1일 입장 성인 10,000 / 소인 8,000. 10회 쿠폰 90,000. (월 회원 별도)
--
-- ## 메타데이터 출처
-- - 좌표 [신뢰도 높음]: 카카오 POI "마린스포츠센터"(하계동 256-5).
-- - 사설 → ownership=private. 레인/길이/수심·유아풀 정보 없음 → null / has_kids_pool=false.
--
-- 사진: pool-photos/POOL_0126.jpg 미확보 → photo_url null.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0126', '마린스포츠센터', '서울', '노원구',
    '서울특별시 노원구 노원로16길 2',
    37.63942086235119, 127.0755533774685, 'indoor', 'private',
    null, 'http://www.marinsports.co.kr/',
    null, null, null, null,
    '{}', false, false, false,
    true, true,
    10000, 10000, null,
    'http://www.marinsports.co.kr/S02/prod.01.asp')
on conflict (id) do nothing;

-- 자유수영 시간표(시간대별 블록). 일요일 매주 운영.
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0126', '풀스데이', $${
    "월": [{"start":"06:00","end":"09:00","hours":3},{"start":"13:00","end":"16:00","hours":3},{"start":"19:00","end":"22:00","hours":3}],
    "화": [{"start":"06:00","end":"09:00","hours":3},{"start":"13:00","end":"16:00","hours":3},{"start":"19:00","end":"22:00","hours":3}],
    "수": [{"start":"06:00","end":"09:00","hours":3},{"start":"13:00","end":"16:00","hours":3},{"start":"19:00","end":"22:00","hours":3}],
    "목": [{"start":"06:00","end":"09:00","hours":3},{"start":"13:00","end":"16:00","hours":3},{"start":"19:00","end":"22:00","hours":3}],
    "금": [{"start":"06:00","end":"09:00","hours":3},{"start":"13:00","end":"16:00","hours":3},{"start":"19:00","end":"22:00","hours":3}],
    "토": [{"start":"06:00","end":"09:00","hours":3},{"start":"13:00","end":"19:00","hours":6}],
    "일": [{"start":"08:00","end":"10:00","hours":2},{"start":"12:00","end":"17:00","hours":5}]
  }$$::jsonb, $${
    "월":"시간대별 자유수영으로 레인을 별도 운영합니다.",
    "화":"시간대별 자유수영으로 레인을 별도 운영합니다.",
    "수":"시간대별 자유수영으로 레인을 별도 운영합니다.",
    "목":"시간대별 자유수영으로 레인을 별도 운영합니다.",
    "금":"시간대별 자유수영으로 레인을 별도 운영합니다.",
    "토":"시간대별 자유수영으로 레인을 별도 운영합니다.",
    "일":"시간대별 자유수영으로 레인을 별도 운영합니다."
  }$$::jsonb, '2026-06-07'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_0126'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0126');
