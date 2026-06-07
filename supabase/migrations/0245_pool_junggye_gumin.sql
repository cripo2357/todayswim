-- Pool's day — 노원구 보강: 중계구민체육센터 수영장 추가 (POOL_0125). 누락 신규.
--
-- ## 시간표 출처 [1차 — 운영자 공식]
--
-- 크리스가 중계구민체육센터(노원구시설관리공단) '일일 자유이용' 공식표 캡처 제공.
--
-- - 자유수영:
--   · 평일 12:00–12:50 → 월·수·금 / 평일 20:00–20:50 → 월~금
--   · 토: 20:00–21:50 (21시 이후 입장 불가)
--   · 일·공휴일: 09:00–11:30, 12:00–14:30, 15:00–17:30 (3부)
-- - 가격: 평일 성인 3,900 / 주말(토·일·공휴일) 성인 5,000.
-- - 임산부 입장 제한. 평일·토는 6레인 중 2개 레인, 일·공휴일은 6레인 전체.
--
-- ## 메타데이터 출처
-- - 성인풀 6레인. 길이/수심·유아풀 정보 없음 → null / has_kids_pool=false.
-- - 좌표 [신뢰도 높음]: 카카오 도로명 "노원구 동일로 1229".
-- - 전화: 02-2289-6700.
--
-- 사진: pool-photos/POOL_0125.jpg 미확보 → photo_url null.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0125', '중계구민체육센터', '서울', '노원구',
    '서울특별시 노원구 동일로 1229',
    37.638960500598, 127.06634514211, 'indoor', 'public',
    '02-2289-6700', 'https://www.nowonsc.kr/',
    6, null, null, null,
    '{}', false, false, false,
    true, true,
    3900, 5000, null,
    'https://www.nowonsc.kr/fmcs/75')
on conflict (id) do nothing;

-- 자유수영 시간표. 50분=0.83, 토 1시간50분=1.83, 일 2시간30분=2.5.
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0125', '풀스데이', $${
    "월": [{"start":"12:00","end":"12:50","hours":0.83},{"start":"20:00","end":"20:50","hours":0.83}],
    "화": [{"start":"20:00","end":"20:50","hours":0.83}],
    "수": [{"start":"12:00","end":"12:50","hours":0.83},{"start":"20:00","end":"20:50","hours":0.83}],
    "목": [{"start":"20:00","end":"20:50","hours":0.83}],
    "금": [{"start":"12:00","end":"12:50","hours":0.83},{"start":"20:00","end":"20:50","hours":0.83}],
    "토": [{"start":"20:00","end":"21:50","hours":1.83}],
    "일": [
      {"start":"09:00","end":"11:30","hours":2.5},
      {"start":"12:00","end":"14:30","hours":2.5},
      {"start":"15:00","end":"17:30","hours":2.5}
    ]
  }$$::jsonb, $${
    "월":"임산부는 안전상 입장이 제한됩니다. 평일·토는 6레인 중 2개 레인으로 운영합니다.",
    "화":"임산부는 안전상 입장이 제한됩니다. 평일·토는 6레인 중 2개 레인으로 운영합니다.",
    "수":"임산부는 안전상 입장이 제한됩니다. 평일·토는 6레인 중 2개 레인으로 운영합니다.",
    "목":"임산부는 안전상 입장이 제한됩니다. 평일·토는 6레인 중 2개 레인으로 운영합니다.",
    "금":"임산부는 안전상 입장이 제한됩니다. 평일·토는 6레인 중 2개 레인으로 운영합니다.",
    "토":"임산부는 안전상 입장이 제한됩니다. 평일·토는 6레인 중 2개 레인으로 운영합니다.",
    "일":"임산부는 안전상 입장이 제한됩니다. 일·공휴일은 6레인 전체를 이용할 수 있습니다."
  }$$::jsonb, '2026-06-07'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_0125'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0125');
