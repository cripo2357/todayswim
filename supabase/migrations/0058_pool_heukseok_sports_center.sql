-- Pool's day — Phase 2: 수영장 1곳 추가: 흑석체육센터 (POOL_SEOUL_0012).
--
-- ## 시간표·가격 출처
--
-- 공식 사이트(동작구 시설관리공단 https://sports.idongjak.or.kr/home/35) — 1차 출처.
-- 첨벙(2차)으로 시설 규격만 보강. 시간표·가격은 공식만 신뢰.
--
-- - 시간표:
--   · 월~금: 13:00–13:50 (1슬롯)
--   · 금   : 19:00–21:50 추가 (저녁 야간)
--   · 토   : 13:00–14:50, 15:00–16:50
--   · 일   : 09–10:50, 11–12:50, 13–14:50, 15–16:50 (월 넷째 주만)
-- - 가격: 평일 4,400원 / 주말·일 5,700원.
-- - 휴관: 일요일(넷째 주 제외) + 법정공휴일 → 일 day_note에 안내.
--
-- ## 메타데이터 출처
--
-- - 25m×5레인, 수심 1.2m: 첨벙(공식엔 미기재).
-- - 좌표 [신뢰도 높음]: 카카오 Local API "서울특별시 동작구 현충로 73" ROAD_ADDR
--   정확 매치 + "흑석체육센터" 키워드 POI도 같은 위치(흑석동 116-1).
-- - 공식 페이지가 주소를 "보라매로5길 35"라고 적은 건 동작구공단 본부 주소를
--   잘못 일반화한 것 — 실제 위치는 현충로 73 (동작삼일 케이스와 동일 패턴).
--
-- 사진: pool-photos/POOL_SEOUL_0012.jpg 업로드 대기.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_SEOUL_0012', '흑석체육센터', '서울', '동작구',
    '서울특별시 동작구 현충로 73',
    37.5100551187106, 126.963446342285, 'indoor', 'public',
    '02-823-2273', 'https://sports.idongjak.or.kr/home/35',
    5, 25, 1.2, 1.2,
    '{}', false, false, false,
    true, true,
    4400, 4400, 5700,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_SEOUL_0012.jpg',
    'https://sports.idongjak.or.kr/home/35')
on conflict (id) do nothing;

-- 자유수영 시간표.
-- hours = (종료 - 시작) 분/60. 50분=0.83, 1h50m=1.83, 2h50m=2.83.
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_SEOUL_0012', '풀스데이', $${
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
  }$$::jsonb, $${"일":"매월 넷째 주 일요일에만 운영합니다."}$$::jsonb, '2026-05-20'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_SEOUL_0012'
  and exists (select 1 from public.schedules where pool_id = 'POOL_SEOUL_0012');
