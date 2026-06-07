-- Pool's day — 종로구 배치: 서울스포츠클럽 수영장 추가 (POOL_0136). 사설.
--
-- ## 시간표 출처 [1차 — 운영자 공식]
-- 서울스포츠클럽 공식(sl-ssc.co.kr/programs/swimming/)에서 자유수영 시간·요금 추출.
--
-- - 자유수영: 평일 06:00–22:00, 토 07:00–17:00, 일·공휴일 미표기(by_day 제외).
-- - 가격: 일일 입장 18,000. 월 180,000(1개월).
--
-- ## 메타데이터 출처
-- - 좌표 [신뢰도 높음]: 카카오 POI "서울스포츠클럽"(연지동 136-74).
-- - 레인/길이/수심 6/25/1.3~1.4 [2차 — 권세민 블로그]. 해수풀. 유아풀 정보 없음 → false.
-- - 전화 02-747-9000. 사설 → ownership=private. 종로5가역 인근.
-- 사진: 미확보 → photo_url null.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_weekday, price_weekend, price_monthly, photo_url,
  schedule_source_url
) values
  ('POOL_0136', '서울스포츠클럽', '서울', '종로구',
    '서울특별시 종로구 김상옥로 29',
    37.5736358542821, 127.000606756705, 'indoor', 'private',
    '02-747-9000', 'https://sl-ssc.co.kr/',
    6, 25, 1.3, 1.4,
    '{}', false, false, false,
    true, true,
    18000, 18000, 180000, null,
    'https://sl-ssc.co.kr/programs/swimming/')
on conflict (id) do nothing;

-- 자유수영. 평일 06:00-22:00=16.0, 토 07:00-17:00=10.0. 일·공휴일 미표기.
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0136', '풀스데이', $${
    "월": [{"start":"06:00","end":"22:00","hours":16.0}],
    "화": [{"start":"06:00","end":"22:00","hours":16.0}],
    "수": [{"start":"06:00","end":"22:00","hours":16.0}],
    "목": [{"start":"06:00","end":"22:00","hours":16.0}],
    "금": [{"start":"06:00","end":"22:00","hours":16.0}],
    "토": [{"start":"07:00","end":"17:00","hours":10.0}]
  }$$::jsonb, '{}'::jsonb, '2026-06-08'::timestamptz)
on conflict (pool_id) do nothing;

update public.pools set has_schedule = true
where id = 'POOL_0136' and exists (select 1 from public.schedules where pool_id = 'POOL_0136');
