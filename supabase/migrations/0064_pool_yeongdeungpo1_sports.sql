-- Pool's day — Phase 2: 수영장 1곳 추가: 영등포제1스포츠센터 (POOL_0011).
--
-- ## 시간표·휴관 출처
--
-- 공식 사이트(영등포구 시설관리공단 https://spc.y-sisul.or.kr/page/center/center.03.asp)
-- — 1차 출처. 첨벙(2차)으로 가격·시설 규격 보강.
--
-- - 시간표:
--   · 월~금: 12:00–12:50 (1슬롯)
--   · 토   : 13:00–14:50, 15:00–16:50 (2슬롯)
--   · 일   : 10:00–11:50, 13:00–14:50, 15:00–16:50 (3슬롯, 월 1·3주만)
-- - 가격: 평일 4,000원 / 주말 4,500원 (첨벙, 공식엔 미기재).
-- - 휴관: 일요일 2·4·5주 + 법정공휴일 → 일 day_note에 "1·3주만 운영" 안내.
--
-- ## 메타데이터 출처
--
-- - 25m×7레인, 수심 1.2m~1.4m: 첨벙 + 운영자 확인 일치.
-- - 유아풀 보유: 운영자 확인 → has_kids_pool=true.
-- - 좌표 [신뢰도 높음]: 카카오 Local API "서울특별시 영등포구 신풍로 1"
--   ROAD_ADDR + "영등포 제1스포츠센터" POI 완전 일치(신길동 426-3).
-- - 공식 페이지가 주소를 "여의대방로 211"이라 적은 건 영등포구공단 본부 주소를
--   잘못 일반화한 것 — 실제 위치는 신풍로 1 (동작구공단 동작삼일·흑석과 동일 패턴).
--
-- 사진: pool-photos/POOL_0011.jpg 업로드 대기.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0011', '영등포제1스포츠센터', '서울', '영등포구',
    '서울특별시 영등포구 신풍로 1',
    37.5005230798016, 126.906332878591, 'indoor', 'public',
    '02-2650-1500', 'https://spc.y-sisul.or.kr/page/center/center.03.asp',
    7, 25, 1.2, 1.4,
    '{}', true, false, false,
    true, true,
    4000, 4000, 4500,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0011.jpg',
    'https://spc.y-sisul.or.kr/page/center/center.03.asp')
on conflict (id) do nothing;

-- 자유수영 시간표.
-- hours = (종료 - 시작) 분/60. 50분=0.83, 1h50m=1.83.
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0011', '풀스데이', $${
    "월": [{"start":"12:00","end":"12:50","hours":0.83}],
    "화": [{"start":"12:00","end":"12:50","hours":0.83}],
    "수": [{"start":"12:00","end":"12:50","hours":0.83}],
    "목": [{"start":"12:00","end":"12:50","hours":0.83}],
    "금": [{"start":"12:00","end":"12:50","hours":0.83}],
    "토": [
      {"start":"13:00","end":"14:50","hours":1.83},
      {"start":"15:00","end":"16:50","hours":1.83}
    ],
    "일": [
      {"start":"10:00","end":"11:50","hours":1.83},
      {"start":"13:00","end":"14:50","hours":1.83},
      {"start":"15:00","end":"16:50","hours":1.83}
    ]
  }$$::jsonb, $${"일":"매월 첫째·셋째 주 일요일에만 운영합니다."}$$::jsonb, '2026-05-20'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_0011'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0011');
