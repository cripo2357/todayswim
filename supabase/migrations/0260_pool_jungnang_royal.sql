-- Pool's day — 중랑구 배치: 로얄스포츠센터 수영장 추가 (POOL_0134). 사설.
--
-- ## 시간표 출처 [1차 — 운영자 공식]
-- 크리스가 로얄스포츠센터 공식 '자유수영 안내' 페이지 캡처 제공.
-- schedule_source_url = royalsports.co.kr 자유수영 페이지.
--
-- - 자유수영(평일은 화·목만!):
--   · 화·목: 13:00–14:50
--   · 토   : 13:00–14:50, 18:00–20:30
--   · 일·공휴일: 10:00–12:50, 14:00–16:30 (공휴일=일요일 동일, by_day는 일요일로 표기)
--   · 월·수·금: 자유수영 없음(강습·아쿠아줌바).
--   · 자유수영 시작 10분 전 입장 가능.
-- - 가격(일일입장): 일반 14,000 / 어린이 11,000. (쿠폰 10매 130,000 / 20매 250,000 — 컬럼 미반영)
--
-- ## 메타데이터 출처
-- - 좌표 [신뢰도 높음]: 카카오 POI "로얄스포츠센터"(중화동 207).
-- - 레인/길이/수심 5/25/1.3 [2차 — 권세민 블로그]. 유아풀 정보 없음 → false.
-- - 전화 02-496-0070. 사설 → ownership=private.
-- 사진: 미확보 → photo_url null.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0134', '로얄스포츠센터', '서울', '중랑구',
    '서울특별시 중랑구 망우로 247',
    37.59538320920279, 127.07975962696064, 'indoor', 'private',
    '02-496-0070', 'http://www.royalsports.co.kr/',
    5, 25, 1.3, 1.3,
    '{}', false, false, false,
    true, true,
    14000, 14000, null,
    'http://www.royalsports.co.kr/theme/royal/html/business/swim.php')
on conflict (id) do nothing;

-- 자유수영. 화·목 13:00-14:50=1.83. 토 13:00-14:50=1.83/18:00-20:30=2.5. 일·공휴 10:00-12:50=2.83/14:00-16:30=2.5.
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0134', '풀스데이', $${
    "화": [{"start":"13:00","end":"14:50","hours":1.83}],
    "목": [{"start":"13:00","end":"14:50","hours":1.83}],
    "토": [{"start":"13:00","end":"14:50","hours":1.83},{"start":"18:00","end":"20:30","hours":2.5}],
    "일": [{"start":"10:00","end":"12:50","hours":2.83},{"start":"14:00","end":"16:30","hours":2.5}]
  }$$::jsonb, $${
    "화":"자유수영 시작 10분 전부터 입장할 수 있습니다.",
    "목":"자유수영 시작 10분 전부터 입장할 수 있습니다.",
    "토":"자유수영 시작 10분 전부터 입장할 수 있습니다.",
    "일":"공휴일도 일요일과 동일하게 운영합니다."
  }$$::jsonb, '2026-06-08'::timestamptz)
on conflict (pool_id) do nothing;

update public.pools set has_schedule = true
where id = 'POOL_0134' and exists (select 1 from public.schedules where pool_id = 'POOL_0134');
