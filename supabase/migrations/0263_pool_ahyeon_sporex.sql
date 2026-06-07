-- Pool's day — 마포구 배치: 아현스포렉스 수영장 추가 (POOL_0137). 사설(다빈스포츠, 아현중 내).
--
-- ## 시간표 출처 [1차 — 운영자 공식 시간표(다빈스포츠 공지를 옮긴 캡처)]
-- 크리스가 아현스포렉스 자유수영 요일별 시간표 + 요금표 캡처 제공. schedule_source_url=davinsport 공식.
--
-- - 자유수영(요일별):
--   · 월·수·금: 08:00–08:50, 13:00–13:50, 18:00–22:50
--   · 화·목   : 06:00–08:50, 13:00–15:50, 18:00–22:50
--   · 토       : 08:00–09:50, 10:00–12:50, 13:00–17:50
--   · 일·공휴일: 10:00–12:50, 14:00–17:50 (13:00–13:50은 점검 제외)
-- - 가격(일일입장): 비회원 성인 15,000 / 어린이 10,000(회원 성인 11,000/어린이 6,000). 월 150,000.
--
-- ## 메타데이터 출처
-- - 좌표 [신뢰도 높음]: 카카오 POI "아현스포렉스"(아현동 267-1, 아현중 내).
-- - 레인/길이/수심 6/25/1.15~1.2 [2차 — 권세민 블로그]. 해수풀. 유아풀 정보 없음 → false.
-- - 전화 02-392-8008. 사설(다빈스포츠, 0063 성일스포렉스와 동일 운영사) → ownership=private.
-- 사진: 미확보 → photo_url null.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_weekday, price_weekend, price_monthly, photo_url,
  schedule_source_url
) values
  ('POOL_0137', '아현스포렉스', '서울', '마포구',
    '서울특별시 마포구 마포대로 247',
    37.55639339315304, 126.95597500794037, 'indoor', 'private',
    '02-392-8008', 'https://www.davinsport.com/',
    6, 25, 1.15, 1.2,
    '{}', false, false, false,
    true, true,
    15000, 15000, 150000, null,
    'https://www.davinsport.com/31')
on conflict (id) do nothing;

-- 자유수영. 08:00-08:50=0.83, 13:00-13:50=0.83, 18:00-22:50=4.83, 06:00-08:50=2.83,
-- 13:00-15:50=2.83, 토 08:00-09:50=1.83/10:00-12:50=2.83/13:00-17:50=4.83, 일 10:00-12:50=2.83/14:00-17:50=3.83.
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0137', '풀스데이', $${
    "월": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"13:00","end":"13:50","hours":0.83},{"start":"18:00","end":"22:50","hours":4.83}],
    "화": [{"start":"06:00","end":"08:50","hours":2.83},{"start":"13:00","end":"15:50","hours":2.83},{"start":"18:00","end":"22:50","hours":4.83}],
    "수": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"13:00","end":"13:50","hours":0.83},{"start":"18:00","end":"22:50","hours":4.83}],
    "목": [{"start":"06:00","end":"08:50","hours":2.83},{"start":"13:00","end":"15:50","hours":2.83},{"start":"18:00","end":"22:50","hours":4.83}],
    "금": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"13:00","end":"13:50","hours":0.83},{"start":"18:00","end":"22:50","hours":4.83}],
    "토": [{"start":"08:00","end":"09:50","hours":1.83},{"start":"10:00","end":"12:50","hours":2.83},{"start":"13:00","end":"17:50","hours":4.83}],
    "일": [{"start":"10:00","end":"12:50","hours":2.83},{"start":"14:00","end":"17:50","hours":3.83}]
  }$$::jsonb, $${
    "일":"공휴일도 일요일과 동일하게 운영하며, 13:00~13:50은 점검시간입니다."
  }$$::jsonb, '2026-06-08'::timestamptz)
on conflict (pool_id) do nothing;

update public.pools set has_schedule = true
where id = 'POOL_0137' and exists (select 1 from public.schedules where pool_id = 'POOL_0137');
