-- Pool's day — Phase 2: 수영장 1곳 추가: 신길책마루문화센터 (POOL_SEOUL_0017).
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
-- 사진: pool-photos/POOL_SEOUL_0017.jpg 업로드 대기.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_SEOUL_0017', '신길책마루문화센터', '서울', '영등포구',
    '서울특별시 영등포구 신길로 131',
    37.5041117412699, 126.909749542906, 'indoor', 'public',
    '02-2650-1595', 'https://cmr.y-sisul.or.kr/page/center/center.03.asp',
    5, 25, 1.35, 1.35,
    '{}', false, false, false,
    true, true,
    null, null, null,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_SEOUL_0017.jpg',
    'https://cmr.y-sisul.or.kr/page/center/center.03.asp')
on conflict (id) do nothing;

-- 자유수영 시간표 (현장 사진 그대로).
-- hours = (종료 - 시작) 분/60. 50분=0.83, 1h50m=1.83.
-- 일요일 휴관 → 키 미포함.
insert into public.schedules (pool_id, author_nickname, by_day, updated_at) values
  ('POOL_SEOUL_0017', '풀스데이', $${
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
where id = 'POOL_SEOUL_0017'
  and exists (select 1 from public.schedules where pool_id = 'POOL_SEOUL_0017');
