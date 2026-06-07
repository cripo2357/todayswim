-- Pool's day — 동대문구 배치: 동대문종합사회복지관 수영장 추가 (POOL_0108).
--
-- ## 시간표 출처 [1차 — 운영자 공식]
--
-- 크리스가 동대문종합사회복지관 공식 홈페이지(communitycenter.or.kr) 생활체육프로그램
-- 캡처 + "일요일 자유수영 OPEN 안내문"을 직접 제공. 이것이 1차 출처.
--   ※ 첨벙(cbswim)에는 "1일 입장 불가 / 평일 12:00~13:00"으로 잘못 적혀 있었으나,
--     공식 자료로 "일일 입장 가능 / 평일 12:00~13:30"임을 확인해 정정.
-- 공식 content.php는 사이트 개편으로 직접 fetch 불가(SSL altname + co_id 변경) —
-- 0067(동대문구민체육센터)과 동일 패턴. schedule_source_url은 공식 URL 그대로 기록.
--
-- - 시간표(성인 자유수영):
--   · 평일(월~금): 12:00–13:30 (1슬롯, 90분)
--   · 토         : 자유수영 미운영
--   · 일         : 10:00–11:50 (1부), 13:00–14:50 (2부)  ← 2025-05-11부터 일요일 개방
-- - 가격(성인 일일권, 비회원 기준):
--   · 평일 5,500원 (회원 4,000) / 일 5,500원 (회원·비회원 동일)
--   · 월 정기권(월~금) 67,000원 → price_monthly 보관(카드는 일일권 우선 표기)
--   · 토요일 미운영 → price_weekend 비움(토 가격 오표시 방지), price_per_sun에만 5,500.
-- - 일일 입장: 키오스크 발권(현금 불가), 정원 선착순(평일 최대 20명 / 일요일 마감 시 종료).
--
-- ## 메타데이터 출처
--
-- - 성인풀 25m × 6레인 + 유아풀: 공식 시설안내 / 서울시 생활체육포털(ft_idx=1097).
--   → has_kids_pool=true. 수심은 미확인(null).
-- - 좌표 [신뢰도 높음]: 카카오 Local 도로명 매치 "서울 동대문구 약령시로5길 22".
-- - 전화: 02-920-4550 (1층 문화체육부).
--
-- 사진: pool-photos/POOL_0108.jpg 미확보 → photo_url null(추후 워크플로로 추가).

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_weekday, price_per_sun, price_monthly, photo_url,
  schedule_source_url
) values
  ('POOL_0108', '동대문종합사회복지관', '서울', '동대문구',
    '서울특별시 동대문구 약령시로5길 22',
    37.5840209857522, 127.034196960692, 'indoor', 'public',
    '02-920-4550', 'http://www.communitycenter.or.kr/',
    6, 25, null, null,
    '{}', true, false, false,
    true, true,
    5500, 5500, 67000, null,
    'http://www.communitycenter.or.kr/bbs/content.php?co_id=health_business02_2')
on conflict (id) do nothing;

-- 자유수영 시간표. hours = (종료 - 시작) 분/60. 90분=1.5, 110분=1.83.
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0108', '풀스데이', $${
    "월": [{"start":"12:00","end":"13:30","hours":1.5}],
    "화": [{"start":"12:00","end":"13:30","hours":1.5}],
    "수": [{"start":"12:00","end":"13:30","hours":1.5}],
    "목": [{"start":"12:00","end":"13:30","hours":1.5}],
    "금": [{"start":"12:00","end":"13:30","hours":1.5}],
    "일": [
      {"start":"10:00","end":"11:50","hours":1.83},
      {"start":"13:00","end":"14:50","hours":1.83}
    ]
  }$$::jsonb, $${
    "월":"일일권은 키오스크 발권(현금 불가)이며 최대 20명 선착순 입장입니다.",
    "화":"일일권은 키오스크 발권(현금 불가)이며 최대 20명 선착순 입장입니다.",
    "수":"일일권은 키오스크 발권(현금 불가)이며 최대 20명 선착순 입장입니다.",
    "목":"일일권은 키오스크 발권(현금 불가)이며 최대 20명 선착순 입장입니다.",
    "금":"일일권은 키오스크 발권(현금 불가)이며 최대 20명 선착순 입장입니다.",
    "일":"키오스크 발권(현금 불가)이며 정원 마감 시 선착순 마감입니다."
  }$$::jsonb, '2026-06-07'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_0108'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0108');
