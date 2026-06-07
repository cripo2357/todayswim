-- Pool's day — 동대문구 배치: 동대문야외수영장 추가 (POOL_0110).
-- 동대문구시설관리공단(dfmc) 운영 여름철 야외 계절풀. 중랑천 제1체육공원 내.
-- 크리스 결정으로 등록: 시즌 한정이어도 단체로 함께 가기 좋음(북극성 부합).
--
-- ## 출처 [서울시 생활체육포털 + 공단 보도]
-- - 운영기간: 여름철 한정(2025년 6/29~8/18). 매년 변동 → day_note는 "통상 6월 말~8월 중".
-- - 이용시간: 종일 10:00~18:00 (반일 오전 10:00~14:00 / 오후 14:00~18:00). 매주 월요일 휴장.
--   → 자유수영 가능 시간 = 10:00~18:00 종일 1슬롯으로 표기(반일은 가격 옵션, 시간분리 아님).
-- - 입장료(종일): 성인 5,000원 / 청소년 4,000 / 어린이 3,000. (반일 성인 4,000원)
--   → 평일=주말 동일 5,000원. 반일가는 카드 미표기(요금은 day_note 금지).
-- - 수심 1.1m, 성인풀 면적 400㎡(레인 수 미상). 전화 02-2247-9611.
--
-- 좌표 [신뢰도 중간]: 카카오 지번 매치 "동대문구 장안동 20-5"(REGION_ADDR 중심).
--   야외수영장은 POI 미등록 → 중랑천 제1체육공원 내 지번 좌표 사용.
-- 사진: pool-photos/POOL_0110.jpg 미확보 → photo_url null.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0110', '동대문야외수영장', '서울', '동대문구',
    '서울특별시 동대문구 장안동 20-5',
    37.5681450158225, 127.076200664728, 'outdoor', 'public',
    '02-2247-9611', 'https://www.dfmc.kr/',
    null, null, 1.1, 1.1,
    '{}', false, false, false,
    true, true,
    5000, 5000, null,
    'https://sports.seoul.go.kr/main/facilities/facilities_view.do?ft_idx=1092')
on conflict (id) do nothing;

-- 자유수영 시간표. 종일 10:00~18:00(8시간). 매주 월요일 휴장 → '월' 키 없음.
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0110', '풀스데이', $${
    "화": [{"start":"10:00","end":"18:00","hours":8}],
    "수": [{"start":"10:00","end":"18:00","hours":8}],
    "목": [{"start":"10:00","end":"18:00","hours":8}],
    "금": [{"start":"10:00","end":"18:00","hours":8}],
    "토": [{"start":"10:00","end":"18:00","hours":8}],
    "일": [{"start":"10:00","end":"18:00","hours":8}]
  }$$::jsonb, $${
    "화":"여름철에만 운영하는 야외 수영장입니다(통상 6월 말~8월 중 개장, 매주 월요일 휴장).",
    "수":"여름철에만 운영하는 야외 수영장입니다(통상 6월 말~8월 중 개장, 매주 월요일 휴장).",
    "목":"여름철에만 운영하는 야외 수영장입니다(통상 6월 말~8월 중 개장, 매주 월요일 휴장).",
    "금":"여름철에만 운영하는 야외 수영장입니다(통상 6월 말~8월 중 개장, 매주 월요일 휴장).",
    "토":"여름철에만 운영하는 야외 수영장입니다(통상 6월 말~8월 중 개장, 매주 월요일 휴장).",
    "일":"여름철에만 운영하는 야외 수영장입니다(통상 6월 말~8월 중 개장, 매주 월요일 휴장)."
  }$$::jsonb, '2026-06-07'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_0110'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0110');
