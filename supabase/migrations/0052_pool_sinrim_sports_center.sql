-- Pool's day — Phase 2: 수영장 1곳 추가: 신림체육센터 (POOL_SEOUL_0010).
--
-- ## 시간표·가격 출처
--
-- 현장 안내문 사진(운영자 직접 촬영) + 공식 사이트(관악구 시설관리공단
-- https://www.gwanakgongdan.or.kr/www/1371) — 1차 출처.
-- 사진엔 평일 시간표 누락(할인 안내 위주) → 평일은 공식 사이트로 보완.
-- 2차 출처(첨벙/헬로우스윔)는 미사용.
--
-- - 시간표:
--   · 월~금: 12:00–12:50 (1슬롯, 공식)
--   · 토   : 06:00–07:50, 09:00–10:50, 12:00–12:50, 16:00–17:50, 19:00–20:50 (사진)
--   · 일   : 09:00–10:50, 12:00–13:50, 15:00–16:50 (사진+공식)
-- - 가격:
--   · 평일·토 12시 슬롯: 성인 3,400원
--   · 토(12시 외)·일: 성인 4,400원
--   · 스키마는 priceWeekday/priceWeekend 2열 → weekday=3400, weekend=4400.
-- - 휴관: 매월 첫째 주 일요일, 법정공휴일 → 일요일 day_note에 안내.
--
-- ## 메타데이터 출처
--
-- - 규격 25m×5레인, 수심 1.3m: 첨벙·헬로우스윔 합의(공식 사이트엔 미기재).
-- - 좌표 [신뢰도 높음]: 카카오 Local API "서울특별시 관악구 난곡로58길 13"
--   ROAD_ADDR 정확 매치.
-- - has_kids_pool=false: 헬로우스윔 명시.
--
-- 사진: pool-photos/POOL_SEOUL_0010.jpg 업로드 대기.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url
) values
  ('POOL_SEOUL_0010', '신림체육센터', '서울', '관악구',
    '서울특별시 관악구 난곡로58길 13',
    37.4800706574551, 126.916032014557, 'indoor', 'public',
    '02-869-1888', 'https://www.gwanakgongdan.or.kr/www/1371',
    5, 25, 1.3, 1.3,
    '{}', false, false, false,
    true, true,
    3400, 3400, 4400,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_SEOUL_0010.jpg')
on conflict (id) do nothing;

-- 자유수영 시간표.
-- hours = (종료 - 시작) 분/60. 50분=0.83, 1h50m=1.83.
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_SEOUL_0010', '풀스데이', $${
    "월": [{"start":"12:00","end":"12:50","hours":0.83}],
    "화": [{"start":"12:00","end":"12:50","hours":0.83}],
    "수": [{"start":"12:00","end":"12:50","hours":0.83}],
    "목": [{"start":"12:00","end":"12:50","hours":0.83}],
    "금": [{"start":"12:00","end":"12:50","hours":0.83}],
    "토": [
      {"start":"06:00","end":"07:50","hours":1.83},
      {"start":"09:00","end":"10:50","hours":1.83},
      {"start":"12:00","end":"12:50","hours":0.83},
      {"start":"16:00","end":"17:50","hours":1.83},
      {"start":"19:00","end":"20:50","hours":1.83}
    ],
    "일": [
      {"start":"09:00","end":"10:50","hours":1.83},
      {"start":"12:00","end":"13:50","hours":1.83},
      {"start":"15:00","end":"16:50","hours":1.83}
    ]
  }$$::jsonb, $${"일":"매월 첫째 주 일요일은 휴관입니다."}$$::jsonb, '2026-05-20'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_SEOUL_0010'
  and exists (select 1 from public.schedules where pool_id = 'POOL_SEOUL_0010');
