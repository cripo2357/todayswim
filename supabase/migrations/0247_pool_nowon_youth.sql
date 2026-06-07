-- Pool's day — 노원구 보강: 시립노원청소년센터 수영장 추가 (POOL_0127).
--
-- ## 시간표 출처 [1차 — 운영자 공식]
--
-- 크리스가 시립노원청소년센터 자유수영 공식 안내 캡처 제공. 요금은 크리스 확인(4,730).
--
-- - 자유수영:
--   · 평일(월~금): 12:00–12:50
--   · 토·일: 미운영. 국경일·대체공휴일 휴관. 매월 마지막 주 환경미화로 하루 휴장.
-- - 가격: 성인 일일 4,730.
-- - 자유수영은 1·2·3레인 이용, 센터 비치 킥판 등 물품 사용 불가. 발권 11:30~/입장 11:40~.
--
-- ## 메타데이터 출처
-- - 좌표 [신뢰도 높음]: 카카오 POI "시립노원청소년센터"(상계동 772).
-- - 전화: 02-3391-4141. 덕릉로70길 99. 레인/길이/수심 정보 없음 → null. has_kids_pool=false.
--
-- 사진: pool-photos/POOL_0127.jpg 미확보 → photo_url null.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_weekday, photo_url,
  schedule_source_url
) values
  ('POOL_0127', '시립노원청소년센터', '서울', '노원구',
    '서울특별시 노원구 덕릉로70길 99',
    37.6403309941757, 127.059580986248, 'indoor', 'public',
    '02-3391-4141', 'https://www.youthcenter.or.kr/',
    null, null, null, null,
    '{}', false, false, false,
    true, true,
    4730, null,
    'https://www.youthcenter.or.kr/79')
on conflict (id) do nothing;

-- 자유수영 시간표. 평일 50분=0.83. 토·일 미운영.
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0127', '풀스데이', $${
    "월": [{"start":"12:00","end":"12:50","hours":0.83}],
    "화": [{"start":"12:00","end":"12:50","hours":0.83}],
    "수": [{"start":"12:00","end":"12:50","hours":0.83}],
    "목": [{"start":"12:00","end":"12:50","hours":0.83}],
    "금": [{"start":"12:00","end":"12:50","hours":0.83}]
  }$$::jsonb, $${
    "월":"자유수영은 1·2·3레인에서 이용하며, 센터 비치 킥판 등 물품은 사용할 수 없습니다.",
    "화":"자유수영은 1·2·3레인에서 이용하며, 센터 비치 킥판 등 물품은 사용할 수 없습니다.",
    "수":"자유수영은 1·2·3레인에서 이용하며, 센터 비치 킥판 등 물품은 사용할 수 없습니다.",
    "목":"자유수영은 1·2·3레인에서 이용하며, 센터 비치 킥판 등 물품은 사용할 수 없습니다.",
    "금":"자유수영은 1·2·3레인에서 이용하며, 센터 비치 킥판 등 물품은 사용할 수 없습니다."
  }$$::jsonb, '2026-06-07'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_0127'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0127');
