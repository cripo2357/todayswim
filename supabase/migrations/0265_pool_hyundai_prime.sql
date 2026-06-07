-- Pool's day — 광진구 배치: 현대프라임스포츠센터 수영장 추가 (POOL_0135). 사설.
--
-- ## 시간표 출처 [1차 — 운영자 공식]
-- 크리스가 현대프라임스포츠센터 공식 '자유수영 시간 안내' 안내판 + 요금표 캡처 제공.
--
-- - 자유수영:
--   · 월·금: 06:00–08:50, 15:00–19:50, 21:00–21:50
--   · 화·목: 06:00–08:50, 12:00–18:50, 21:00–21:50
--   · 수   : 06:00–11:50, 15:00–21:50
--   · 토·공휴일: 06:00–19:40 (공휴일 by_day 미표기)
--   · 일요일: 휴관.
--   · 어린이는 토·공휴일만 입장, 신장 120cm 이상.
-- - 가격(일일입장): 자유수영 13,000(회원 9,000).
--
-- ## 메타데이터 출처
-- - 좌표 [신뢰도 높음]: 카카오 POI "현대프라임스포츠센터"(구의동 611).
-- - 레인/길이/수심 8/25/1.2~1.7 [2차 — 권세민 블로그]. 유아풀 정보 없음 → false.
-- - 전화 02-446-5300. 사설(웰빙클럽) → ownership=private.
-- 사진: 미확보 → photo_url null.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0135', '현대프라임스포츠센터', '서울', '광진구',
    '서울특별시 광진구 광나루로56길 32',
    37.53737468528906, 127.09518748913426, 'indoor', 'private',
    '02-446-5300', 'https://www.wbc4u.com/',
    8, 25, 1.2, 1.7,
    '{}', false, false, false,
    true, true,
    13000, 13000, null,
    'https://www.wbc4u.com/center/detail?SPT_SISUL_TYPE=ALL&SSB_CD=SBAT15070007')
on conflict (id) do nothing;

-- 자유수영. 06:00-08:50=2.83, 15:00-19:50=4.83, 21:00-21:50=0.83, 12:00-18:50=6.83,
-- 06:00-11:50=5.83, 15:00-21:50=6.83, 토 06:00-19:40=13.67. 일 휴관.
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0135', '풀스데이', $${
    "월": [{"start":"06:00","end":"08:50","hours":2.83},{"start":"15:00","end":"19:50","hours":4.83},{"start":"21:00","end":"21:50","hours":0.83}],
    "화": [{"start":"06:00","end":"08:50","hours":2.83},{"start":"12:00","end":"18:50","hours":6.83},{"start":"21:00","end":"21:50","hours":0.83}],
    "수": [{"start":"06:00","end":"11:50","hours":5.83},{"start":"15:00","end":"21:50","hours":6.83}],
    "목": [{"start":"06:00","end":"08:50","hours":2.83},{"start":"12:00","end":"18:50","hours":6.83},{"start":"21:00","end":"21:50","hours":0.83}],
    "금": [{"start":"06:00","end":"08:50","hours":2.83},{"start":"15:00","end":"19:50","hours":4.83},{"start":"21:00","end":"21:50","hours":0.83}],
    "토": [{"start":"06:00","end":"19:40","hours":13.67}]
  }$$::jsonb, $${
    "월":"어린이는 토요일·공휴일에만 입장할 수 있습니다.",
    "화":"어린이는 토요일·공휴일에만 입장할 수 있습니다.",
    "수":"어린이는 토요일·공휴일에만 입장할 수 있습니다.",
    "목":"어린이는 토요일·공휴일에만 입장할 수 있습니다.",
    "금":"어린이는 토요일·공휴일에만 입장할 수 있습니다.",
    "토":"어린이는 신장 120cm 이상만 입장할 수 있습니다."
  }$$::jsonb, '2026-06-08'::timestamptz)
on conflict (pool_id) do nothing;

update public.pools set has_schedule = true
where id = 'POOL_0135' and exists (select 1 from public.schedules where pool_id = 'POOL_0135');
