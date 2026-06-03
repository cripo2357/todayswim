-- Pool's day — Phase 2: 수영장 1곳 추가: 서초구민체육센터 (POOL_0037). 서초구 반포동.
--
-- ## 시간표·가격 출처
--
-- 운영자 제공 + 공식 서초 공공체육시설(seocho.go.kr/sports/fmcs/103) "일일 자유이용" 표 — 1차.
-- (서초YMCA 위탁 구립 시설.)
--
-- - 자유수영 시간표 (공식 표 그대로):
--   · 화·목: 12:00~12:50
--   · 일·공휴일: 10:00~12:00, 13:30~15:30 (★여름철 한시 — 아래 day_note)
--   · 월·수·금·토: 자유수영 없음 → 키 미포함. 공휴일은 by_day 외(일요일과 동일).
-- - 가격: 평일(화·목) 성인 3,300 / 일·공휴일 성인 6,000 → price_weekday=3300, weekend=6000.
--   어린이·청소년·경로 차등은 스키마 단일가라 미저장.
-- - 비고: 미취학 보호자 동반, 인원 40명 제한, 하반기 공사·공휴일·추석 휴관.
--   ★일·공휴일 자유수영은 안내문상 "여름철(예: 6월 중순~9월 말)에만 운영" — 연도별 기간이
--    달라질 수 있고 출처 안내문이 구버전(2023)이라 정확한 날짜는 박지 않고 day_note로 일반 안내.
--
-- ## 메타데이터 / 미상
--
-- - 좌표 [신뢰도 높음]: 카카오 "서울 서초구 사평대로 55" ROAD_ADDR 정확 매치(반포동).
-- - 전화: 02-591-6060. ownership=public(구립·YMCA 위탁).
-- - 레인수·수심·유아풀: 공식 자유이용 페이지 미기재 → NULL/false(임의생성 금지). 추후 보강.
-- - photo_url: 사진 수령(서초구민.jpg) → 사진 처리 단계에서 POOL_0037.jpg 경로로 일괄 반영.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0037', '서초구민체육센터', '서울', '서초구',
    '서울특별시 서초구 사평대로 55',
    37.4988531475655, 126.990515657787, 'indoor', 'public',
    '02-591-6060', 'https://www.seocho.go.kr/sports/fmcs/103',
    null, null, null, null,
    '{}', false, false, false,
    true, true,
    3300, 3300, 6000,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0037.jpg',
    'https://www.seocho.go.kr/sports/fmcs/103')
on conflict (id) do nothing;

-- 자유수영 시간표 (공식 표 그대로). hours: 50분=0.83, 2h00m=2.
-- 일요일 day_note: 여름철 한시 운영 일반 안내(정확 날짜는 시설 공지 확인 — 출처 구버전).
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0037', '풀스데이', $${
    "화": [{"start":"12:00","end":"12:50","hours":0.83}],
    "목": [{"start":"12:00","end":"12:50","hours":0.83}],
    "일": [
      {"start":"10:00","end":"12:00","hours":2},
      {"start":"13:30","end":"15:30","hours":2}
    ]
  }$$::jsonb, $${
    "일": "일·공휴일 자유수영은 여름철에만 운영됩니다(운영 기간은 시설 공지 확인)."
  }$$::jsonb, '2026-06-04'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_0037'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0037');
