-- Pool's day — Phase 2: 수영장 1곳 추가: 동작구민체육센터 (POOL_0009).
--
-- ## 시간표·가격 출처
--
-- 공식 사이트(동작구 시설관리공단 https://sports.idongjak.or.kr/home/42) — 1차 출처.
-- 첨벙(2차)으로 시설 규격만 보강. 시간표·가격은 공식만 신뢰.
-- 패턴: 흑석체육센터(0058)와 동일 운영 구조 — 일요일만 운영 주차 다름(흑석=4주차, 동작구민=2주차).
--
-- - 시간표:
--   · 월~금: 13:00–13:50 (1슬롯)
--   · 금   : 19:00–21:50 추가 (저녁 야간)
--   · 토   : 13:00–14:50, 15:00–16:50
--   · 일   : 09–10:50, 11–12:50, 13–14:50, 15–16:50 (월 둘째 주만)
-- - 가격: 평일 4,400원 / 주말·일 5,700원.
-- - 휴관: 일요일(둘째 주 제외) + 법정공휴일 → 일 day_note에 안내.
--
-- ## 메타데이터 출처
--
-- - 25m×6레인: 첨벙(공식엔 미기재).
-- - 수심: 첨벙도 "전화문의" → 미상 → 컬럼 NULL.
-- - 유아풀 보유: 운영자 확인 → has_kids_pool=true.
-- - 좌표 [신뢰도 높음]: 카카오 Local API "서울특별시 동작구 여의대방로16길 53"
--   ROAD_ADDR 정확 매치 + "동작구민체육센터" 키워드 POI도 같은 위치(신대방동 460-1).
-- - 전화 충돌(공식 02-849-0100 vs 첨벙 02-832-2445): 공식 채택.
--
-- 사진: pool-photos/POOL_0009.jpg 업로드 대기.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0009', '동작구민체육센터', '서울', '동작구',
    '서울특별시 동작구 여의대방로16길 53',
    37.4947197628832, 126.916767722548, 'indoor', 'public',
    '02-849-0100', 'https://sports.idongjak.or.kr/home/42',
    6, 25, null, null,
    '{}', true, false, false,
    true, true,
    4400, 4400, 5700,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0009.jpg',
    'https://sports.idongjak.or.kr/home/42')
on conflict (id) do nothing;

-- 자유수영 시간표.
-- hours = (종료 - 시작) 분/60. 50분=0.83, 1h50m=1.83, 2h50m=2.83.
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0009', '풀스데이', $${
    "월": [{"start":"13:00","end":"13:50","hours":0.83}],
    "화": [{"start":"13:00","end":"13:50","hours":0.83}],
    "수": [{"start":"13:00","end":"13:50","hours":0.83}],
    "목": [{"start":"13:00","end":"13:50","hours":0.83}],
    "금": [
      {"start":"13:00","end":"13:50","hours":0.83},
      {"start":"19:00","end":"21:50","hours":2.83}
    ],
    "토": [
      {"start":"13:00","end":"14:50","hours":1.83},
      {"start":"15:00","end":"16:50","hours":1.83}
    ],
    "일": [
      {"start":"09:00","end":"10:50","hours":1.83},
      {"start":"11:00","end":"12:50","hours":1.83},
      {"start":"13:00","end":"14:50","hours":1.83},
      {"start":"15:00","end":"16:50","hours":1.83}
    ]
  }$$::jsonb, $${"일":"매월 둘째 주 일요일에만 운영합니다."}$$::jsonb, '2026-05-20'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_0009'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0009');
-- Pool's day — Phase 2: 수영장 1곳 추가: 서울여성플라자 스포츠센터 (POOL_0010).
--
-- ## 시간표·가격 출처
--
-- 공식 사이트(서울여성플라자 https://www.swomansports.co.kr/program/yoga.asp) — 1차 출처.
-- 첨벙(2차)으로 시설 규격만 보강. 시간표·가격은 공식만 신뢰.
--
-- - 시간표:
--   · 화·목: 08:00–08:50, 13:00–13:50, 21:00–21:50 (3슬롯)
--   · 토   : 06:00–08:50, 10:00–11:50, 13:00–14:50, 16:00–17:50 (4슬롯)
--   · 월·수·금·일: 자유수영 슬롯 없음.
-- - 가격: 평일(화목) 4,800원 / 주말(토) 6,200원.
--
-- ## 메타데이터 출처
--
-- - 25m×6레인: 첨벙(공식엔 미기재).
-- - 수심: 양쪽 모두 "전화문의" → 미상 → NULL.
-- - 유아풀 보유: 운영자 확인 → has_kids_pool=true.
-- - 좌표 [신뢰도 높음]: 카카오 POI "서울여성플라자 스포츠센터 수영장" 정확 매치
--   (lat=37.5114, lng=126.9271, 대방동 345-1, 도로명 여의대방로54길 18).
-- - 운영주체: 서울특별시 여성가족재단(공공) → ownership=public.
-- - 전화 02-822-2425(공식), 첨벙 02-822-2426는 1자리 차이 — 공식 채택.
--
-- 사진: pool-photos/POOL_0010.jpg 업로드 대기.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0010', '서울여성플라자 스포츠센터', '서울', '동작구',
    '서울특별시 동작구 여의대방로54길 18',
    37.5114047648408, 126.927136587647, 'indoor', 'public',
    '02-822-2425', 'https://www.swomansports.co.kr/',
    6, 25, null, null,
    '{}', true, false, false,
    true, true,
    4800, 4800, 6200,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0010.jpg',
    'https://www.swomansports.co.kr/program/yoga.asp')
on conflict (id) do nothing;

-- 자유수영 시간표.
-- hours = (종료 - 시작) 분/60. 50분=0.83, 1h50m=1.83, 2h50m=2.83.
-- 월·수·금·일은 자유수영 없음 → 키 미포함.
insert into public.schedules (pool_id, author_nickname, by_day, updated_at) values
  ('POOL_0010', '풀스데이', $${
    "화": [
      {"start":"08:00","end":"08:50","hours":0.83},
      {"start":"13:00","end":"13:50","hours":0.83},
      {"start":"21:00","end":"21:50","hours":0.83}
    ],
    "목": [
      {"start":"08:00","end":"08:50","hours":0.83},
      {"start":"13:00","end":"13:50","hours":0.83},
      {"start":"21:00","end":"21:50","hours":0.83}
    ],
    "토": [
      {"start":"06:00","end":"08:50","hours":2.83},
      {"start":"10:00","end":"11:50","hours":1.83},
      {"start":"13:00","end":"14:50","hours":1.83},
      {"start":"16:00","end":"17:50","hours":1.83}
    ]
  }$$::jsonb, '2026-05-20'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_0010'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0010');
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
-- Pool's day — Phase 2: 수영장 1곳 추가: 영등포제3스포츠센터 (POOL_0012).
--
-- ## 시간표 출처
--
-- 공식 사이트(영등포구 시설관리공단 https://spc3.y-sisul.or.kr/page/center/center.03.asp)
-- — 1차 출처. 토요일 시간표 충돌(공식 부단위 4부 vs 회차 6회)은 운영자 확인으로
-- **공식 4부 채택**.
--
-- - 시간표:
--   · 월~금: 12:00–12:50 (1슬롯, 정원 20명)
--   · 토   : 08:00–10:00, 10:00–12:00, 13:00–15:00, 15:00–17:00 (4부, 부당 2시간, 정원 80명/부)
--   · 일   : 휴관(키 미포함).
-- - 휴관: 일요일 + 법정공휴일.
-- - 가격: 공식·첨벙 모두 미기재 → NULL. 운영자 확인 후 UPDATE 권장.
--
-- ## 메타데이터 출처
--
-- - 25m×5레인, 수심 1.3m: 운영자 확인.
-- - 유아풀 보유(23m×2레인, 수심 0.8m): 운영자 확인 → has_kids_pool=true.
-- - 좌표 [신뢰도 높음]: 카카오 POI "영등포 제3스포츠센터" 정확 매치
--   (도신로 1, 대림동 611).
-- - 공식 페이지가 주소를 "여의대방로 211"이라 적은 건 영등포구공단 본부 주소를
--   잘못 일반화한 것 — 실제 위치는 도신로 1 (제1·제2 동일 패턴).
--
-- 사진: pool-photos/POOL_0012.jpg 업로드 대기.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0012', '영등포제3스포츠센터', '서울', '영등포구',
    '서울특별시 영등포구 도신로 1',
    37.5045113925927, 126.895091770582, 'indoor', 'public',
    '02-3017-1800', 'https://spc3.y-sisul.or.kr/page/center/center.03.asp',
    5, 25, 1.3, 1.3,
    '{}', true, false, false,
    true, true,
    null, null, null,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0012.jpg',
    'https://spc3.y-sisul.or.kr/page/center/center.03.asp')
on conflict (id) do nothing;

-- 자유수영 시간표.
-- hours = (종료 - 시작) 분/60. 50분=0.83, 2h=2.0.
-- 일요일 휴관 → 키 미포함.
insert into public.schedules (pool_id, author_nickname, by_day, updated_at) values
  ('POOL_0012', '풀스데이', $${
    "월": [{"start":"12:00","end":"12:50","hours":0.83}],
    "화": [{"start":"12:00","end":"12:50","hours":0.83}],
    "수": [{"start":"12:00","end":"12:50","hours":0.83}],
    "목": [{"start":"12:00","end":"12:50","hours":0.83}],
    "금": [{"start":"12:00","end":"12:50","hours":0.83}],
    "토": [
      {"start":"08:00","end":"10:00","hours":2.0},
      {"start":"10:00","end":"12:00","hours":2.0},
      {"start":"13:00","end":"15:00","hours":2.0},
      {"start":"15:00","end":"17:00","hours":2.0}
    ]
  }$$::jsonb, '2026-05-20'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_0012'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0012');
-- Pool's day — Phase 2: 수영장 1곳 추가: 신길책마루문화센터 (POOL_0013).
--
-- ## 시간표 출처
--
-- 현장 자유수영 안내판 사진(운영자 직접 촬영) — **단일 1차 출처**.
-- 공식 사이트(영등포구공단 https://cmr.y-sisul.or.kr/page/center/center.03.asp)는
-- WebFetch에서 "화·목 슬롯은 8월~2월만 운영"이라 추출했지만, 사진엔 시즌 표기
-- 없음 → 사진 신뢰, 화·목 연중 운영으로 확정.
--
-- - 시간표 (사진 그대로):
--   · 월·수·금: 12:00–12:50, 18:00–18:50
--   · 화·목  : 10:00–10:50, 11:00–11:50 (연중)
--   · 토     : 1부 08–09:50, 2부 10–11:50, 3부 13–14:50, 4부 15–16:50
--   · 일     : 휴관(키 미포함)
-- - 가격: 사진·공식 모두 미기재 → NULL. 운영자 확인 후 UPDATE 권장.
--
-- ## 메타데이터 출처
--
-- - 25m × 5레인, 수심 1.35m: 운영자 확인.
-- - 유아풀: 운영자 미언급 → false 유지(추후 보강 가능).
-- - 좌표 [신뢰도 높음]: 카카오 POI "신길책마루문화센터 수영장" 정확 매치
--   (신길동 4946, 도로명 신길로 131).
-- - 전화: 02-2650-1595 (공식, ~1596 범위 중 대표).
-- - 입장 안내: 자유수영 입장 시간 40분 전부터 번호표 배부 (사진 하단).
--
-- 사진: pool-photos/POOL_0013.jpg 업로드 대기.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0013', '신길책마루문화센터', '서울', '영등포구',
    '서울특별시 영등포구 신길로 131',
    37.5041117412699, 126.909749542906, 'indoor', 'public',
    '02-2650-1595', 'https://cmr.y-sisul.or.kr/page/center/center.03.asp',
    5, 25, 1.35, 1.35,
    '{}', false, false, false,
    true, true,
    null, null, null,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0013.jpg',
    'https://cmr.y-sisul.or.kr/page/center/center.03.asp')
on conflict (id) do nothing;

-- 자유수영 시간표 (현장 사진 그대로).
-- hours = (종료 - 시작) 분/60. 50분=0.83, 1h50m=1.83.
-- 일요일 휴관 → 키 미포함.
insert into public.schedules (pool_id, author_nickname, by_day, updated_at) values
  ('POOL_0013', '풀스데이', $${
    "월": [
      {"start":"12:00","end":"12:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83}
    ],
    "화": [
      {"start":"10:00","end":"10:50","hours":0.83},
      {"start":"11:00","end":"11:50","hours":0.83}
    ],
    "수": [
      {"start":"12:00","end":"12:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83}
    ],
    "목": [
      {"start":"10:00","end":"10:50","hours":0.83},
      {"start":"11:00","end":"11:50","hours":0.83}
    ],
    "금": [
      {"start":"12:00","end":"12:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83}
    ],
    "토": [
      {"start":"08:00","end":"09:50","hours":1.83},
      {"start":"10:00","end":"11:50","hours":1.83},
      {"start":"13:00","end":"14:50","hours":1.83},
      {"start":"15:00","end":"16:50","hours":1.83}
    ]
  }$$::jsonb, '2026-05-20'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_0013'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0013');
-- Pool's day — Phase 2: 수영장 1곳 추가: 동대문구민체육센터 (POOL_0014).
--
-- ## 시간표 출처
--
-- 공식 사이트(동대문구시설관리공단 https://www.dfmc.kr:8443/course/sports/fmcs/283)는
-- SSL 인증서 검증 실패로 fetch 불가. KBS스포츠월드(0034)와 동일 패턴.
-- → 2차 출처 합의 채택:
--   - 첨벙 cbswim
--   - 서울시 자유수영 정보 서비스 (sports.seoul.go.kr/main/facilities/facilities_view.do?ft_idx=1094)
--   양 출처 시간표/가격 완전 일치 → 데이터 신뢰.
-- 향후 1차 사진 확보 시 정정 가능. schedule_source_url은 공식 dfmc.kr 그대로 기록(다음
-- 배치에서 fetch_error 반복되면 sports.seoul.go.kr로 교체).
--
-- - 시간표:
--   · 평일(월~금): 13:00–13:50, 21:00–21:50 (2슬롯)
--   · 토       : 09:00–09:50, 10:00–10:50, 11:00–11:50, 13:00–13:50, 14:00–14:50,
--                16:00–16:50, 17:00–17:50 (7슬롯)
--   · 일       : 10:00–10:50, 11:00–11:50, 13:00–13:50, 14:00–14:50, 16:00–16:50,
--                17:00–17:50 (6슬롯, 첫째·셋째 주만 운영)
-- - 가격: 평일 3,700원 / 주말 4,800원 (성인).
-- - 휴관: 일요일 2·4·5주 + 법정공휴일 → 일 day_note에 "1·3주만 운영" 안내.
--
-- ## 메타데이터 출처
--
-- - 성인풀 25m × 6레인, 수심 1.2m: 첨벙.
-- - 어린이풀 3레인: sports.seoul.go.kr → has_kids_pool=true.
-- - 좌표 [신뢰도 높음]: 카카오 POI "동대문구민체육센터 수영장" 정확 매치
--   (장안동 356, 도로명 장안벚꽃로 67).
-- - 전화: 02-2247-9772.
--
-- 사진: pool-photos/POOL_0014.jpg 업로드 대기.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0014', '동대문구민체육센터', '서울', '동대문구',
    '서울특별시 동대문구 장안벚꽃로 67',
    37.566538362878, 127.073496614169, 'indoor', 'public',
    '02-2247-9772', 'https://www.dfmc.kr:8443/course/sports/fmcs/283',
    6, 25, 1.2, 1.2,
    '{}', true, false, false,
    true, true,
    3700, 3700, 4800,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0014.jpg',
    'https://www.dfmc.kr:8443/course/sports/fmcs/283')
on conflict (id) do nothing;

-- 자유수영 시간표.
-- hours = (종료 - 시작) 분/60. 50분=0.83.
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0014', '풀스데이', $${
    "월": [
      {"start":"13:00","end":"13:50","hours":0.83},
      {"start":"21:00","end":"21:50","hours":0.83}
    ],
    "화": [
      {"start":"13:00","end":"13:50","hours":0.83},
      {"start":"21:00","end":"21:50","hours":0.83}
    ],
    "수": [
      {"start":"13:00","end":"13:50","hours":0.83},
      {"start":"21:00","end":"21:50","hours":0.83}
    ],
    "목": [
      {"start":"13:00","end":"13:50","hours":0.83},
      {"start":"21:00","end":"21:50","hours":0.83}
    ],
    "금": [
      {"start":"13:00","end":"13:50","hours":0.83},
      {"start":"21:00","end":"21:50","hours":0.83}
    ],
    "토": [
      {"start":"09:00","end":"09:50","hours":0.83},
      {"start":"10:00","end":"10:50","hours":0.83},
      {"start":"11:00","end":"11:50","hours":0.83},
      {"start":"13:00","end":"13:50","hours":0.83},
      {"start":"14:00","end":"14:50","hours":0.83},
      {"start":"16:00","end":"16:50","hours":0.83},
      {"start":"17:00","end":"17:50","hours":0.83}
    ],
    "일": [
      {"start":"10:00","end":"10:50","hours":0.83},
      {"start":"11:00","end":"11:50","hours":0.83},
      {"start":"13:00","end":"13:50","hours":0.83},
      {"start":"14:00","end":"14:50","hours":0.83},
      {"start":"16:00","end":"16:50","hours":0.83},
      {"start":"17:00","end":"17:50","hours":0.83}
    ]
  }$$::jsonb, $${"일":"매월 첫째·셋째 주 일요일에만 운영합니다."}$$::jsonb, '2026-05-20'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_0014'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0014');
