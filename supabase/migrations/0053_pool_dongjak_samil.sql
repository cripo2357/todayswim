-- Pool's day — Phase 2: 수영장 1곳 추가: 동작삼일수영장 (POOL_SEOUL_0011).
--
-- ## 시간표·가격 출처
--
-- 공식 사이트(동작구 시설관리공단 https://sports.idongjak.or.kr/home/105) — 1차 출처.
-- 현장 시간표 사진 없음 → 공식만 신뢰. 첨벙/헬로우스윔 미사용.
-- 시설 메인 페이지는 /home/97 (네이버지도 등록 공식 URL).
--
-- - 시간표:
--   · 월/수/금: 08:00–08:50
--   · 화/목   : 14:00–14:50
--   · 금     : 19:00–21:50 추가 (저녁 야간 슬롯)
--   · 토     : 13:00–14:50, 15:00–16:50
--   · 일     : 09:00–10:50, 11:00–12:50, 13:00–14:50, 15:00–16:50 (셋째 주만)
-- - 가격: 성인 평일 4,400원 / 주말 5,700원.
--         (청소년 3,300/4,200, 어린이 2,700/3,500은 별도 컬럼 없어 미저장)
-- - 휴관: 일요일(셋째 주 제외) + 법정공휴일 → 일 day_note에 셋째 주만 운영 명시.
--
-- ## 메타데이터 출처
--
-- - 성인풀 25m×5레인 + 유아풀 11m×2레인: 공식(/home/97) 명시.
--   → has_kids_pool=true.
-- - 수심 1.2m: 헬로우스윔(공식엔 미기재).
-- - 좌표 [신뢰도 높음]: 카카오 Local API "동작삼일수영장" 키워드 POI 정확 매치
--   (도로명 사당로27길 103, 지번 사당동 1159-1).
--
-- 사진: pool-photos/POOL_SEOUL_0011.jpg 업로드 대기.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url
) values
  ('POOL_SEOUL_0011', '동작삼일수영장', '서울', '동작구',
    '서울특별시 동작구 사당로27길 103',
    37.48730094730324, 126.9745082615304, 'indoor', 'public',
    '02-535-3341', 'https://sports.idongjak.or.kr/home/97',
    5, 25, 1.2, 1.2,
    '{}', true, false, false,
    true, true,
    4400, 4400, 5700,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_SEOUL_0011.jpg')
on conflict (id) do nothing;

-- 자유수영 시간표.
-- hours = (종료 - 시작) 분/60. 50분=0.83, 1h50m=1.83, 2h50m=2.83.
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_SEOUL_0011', '풀스데이', $${
    "월": [{"start":"08:00","end":"08:50","hours":0.83}],
    "화": [{"start":"14:00","end":"14:50","hours":0.83}],
    "수": [{"start":"08:00","end":"08:50","hours":0.83}],
    "목": [{"start":"14:00","end":"14:50","hours":0.83}],
    "금": [
      {"start":"08:00","end":"08:50","hours":0.83},
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
  }$$::jsonb, $${"일":"매월 셋째 주 일요일에만 운영합니다."}$$::jsonb, '2026-05-20'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_SEOUL_0011'
  and exists (select 1 from public.schedules where pool_id = 'POOL_SEOUL_0011');
