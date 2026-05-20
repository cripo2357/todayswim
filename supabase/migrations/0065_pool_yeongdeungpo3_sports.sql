-- Pool's day — Phase 2: 수영장 1곳 추가: 영등포제3스포츠센터 (POOL_SEOUL_0016).
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
-- 사진: pool-photos/POOL_SEOUL_0016.jpg 업로드 대기.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_SEOUL_0016', '영등포제3스포츠센터', '서울', '영등포구',
    '서울특별시 영등포구 도신로 1',
    37.5045113925927, 126.895091770582, 'indoor', 'public',
    '02-3017-1800', 'https://spc3.y-sisul.or.kr/page/center/center.03.asp',
    5, 25, 1.3, 1.3,
    '{}', true, false, false,
    true, true,
    null, null, null,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_SEOUL_0016.jpg',
    'https://spc3.y-sisul.or.kr/page/center/center.03.asp')
on conflict (id) do nothing;

-- 자유수영 시간표.
-- hours = (종료 - 시작) 분/60. 50분=0.83, 2h=2.0.
-- 일요일 휴관 → 키 미포함.
insert into public.schedules (pool_id, author_nickname, by_day, updated_at) values
  ('POOL_SEOUL_0016', '풀스데이', $${
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
where id = 'POOL_SEOUL_0016'
  and exists (select 1 from public.schedules where pool_id = 'POOL_SEOUL_0016');
