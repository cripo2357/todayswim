-- Pool's Day v1 — 수영장 1곳 추가: 영등포제2스포츠센터 (POOL_SEOUL_0007).
-- 출처: cbswim webflow + 공식(영등포구시설관리공단 spc2.y-sisul.or.kr/page/center/center.03.asp).
--        시간표는 공식이 권위 — cbswim과 일치 확인(평일 월·수·금만, 일요일 2·4주만 개관).
-- 풀 등록 워크플로: 운영자 검토 후 마이그레이션 1곳 + 시간표 동시 등록.
--
-- 좌표 [신뢰도 높음]: 카카오 Local API(scripts/geocode-kakao.mjs) 도로명주소 정확 매치
--   "서울 영등포구 국회대로 615" (ROAD_ADDR). 좌표 먼저 확보 → INSERT에 직접 박음
--   → 단일 마이그레이션, 보정 불필요.
-- 수심: 1.2m 단일(min=max) → 클라이언트 "1.2m" 표시. 가격: 성인 평일/주말(쉼표 없는 정수).
-- 작성자: '풀스데이'(운영자 시드 규칙). photo_url: 신규 풀이라 INSERT에 직접 박음
--   — 운영자는 pool-photos/POOL_SEOUL_0007.jpg 업로드만(업로드 전엔 썸네일만 미표시).

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url
) values
  ('POOL_SEOUL_0007', '영등포제2스포츠센터', '서울', '영등포구',
    '서울특별시 영등포구 국회대로 615',
    37.5266924, 126.9027314, 'indoor', 'public',
    '02-2630-2913', 'https://spc2.y-sisul.or.kr/page/center/center.03.asp',
    6, 25, 1.2, 1.2,
    '{}', false, false, false,
    true, true,
    3000, 3000, 4500,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_SEOUL_0007.jpg')
on conflict (id) do nothing;

-- 자유수영 시간표 (공식 기준)
--   월·수·금 12:00~12:50 / 토 13:00~14:50·15:00~16:50 /
--   일 10:00~11:50·13:00~14:50·15:00~16:50 (매월 둘째·넷째 일요일만 개관 → day_note)
--   화·목 자유수영 없음 → 키 미포함. hours = 분/60 (50분=0.83, 1h50m=1.83).
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_SEOUL_0007', '풀스데이', $${
    "월": [{"start":"12:00","end":"12:50","hours":0.83}],
    "수": [{"start":"12:00","end":"12:50","hours":0.83}],
    "금": [{"start":"12:00","end":"12:50","hours":0.83}],
    "토": [{"start":"13:00","end":"14:50","hours":1.83}, {"start":"15:00","end":"16:50","hours":1.83}],
    "일": [
      {"start":"10:00","end":"11:50","hours":1.83},
      {"start":"13:00","end":"14:50","hours":1.83},
      {"start":"15:00","end":"16:50","hours":1.83}
    ]
  }$$::jsonb, $${"일":"매월 둘째·넷째 일요일만 개관합니다."}$$::jsonb, '2026-05-16'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_SEOUL_0007'
  and exists (select 1 from public.schedules where pool_id = 'POOL_SEOUL_0007');
