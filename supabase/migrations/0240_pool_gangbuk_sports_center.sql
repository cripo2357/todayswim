-- Pool's day — 강북구 배치: 강북종합체육센터 수영장 추가 (POOL_0121). 해수풀.
--
-- ## 시간표 출처 [1차 — 운영자 공식 안내문]
--
-- 크리스가 강북종합체육센터(Sports Island) '자유수영 프로그램' 공식 표 캡처 제공.
--
-- - 자유수영(일일입장, 50분 회차):
--   · 평일(월~금): 08:00–08:50, 11:00–11:50, 18:00–18:50 (성인 4,000)
--   · 토         : 06:00, 07:00, 08:00, 10:00, 11:00, 12:00, 14:00, 15:00, 16:00 (9회차)
--   · 일(2·4주만): 09:00, 10:00, 11:00, 12:00, 14:00, 15:00, 16:00 (7회차) → weeks:[2,4]
--   · 1·3·5째주 일요일 및 공휴일 휴관.
-- - 가격: 평일 성인 4,000 / 주말(토·일) 성인 4,800. 월 정기(평일) 성인 63,000 → price_monthly.
-- - 유의: 해수풀. 초등학생은 신장 130cm 이상 입장(미만은 보호자 동반). 정원 제한.
--
-- ## 메타데이터 출처
-- - 성인풀 25m 6레인(해수풀). 어린이/유아풀 정보 없음 → has_kids_pool=false.
-- - 좌표 [신뢰도 높음]: 카카오 POI "강북종합체육센터"(미아동 811-2).
-- - 전화: 02-6958-8101. 솔샘로48길 14.
--
-- 사진: pool-photos/POOL_0121.jpg 미확보 → photo_url null.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_weekday, price_weekend, price_monthly, photo_url,
  schedule_source_url
) values
  ('POOL_0121', '강북종합체육센터', '서울', '강북구',
    '서울특별시 강북구 솔샘로48길 14',
    37.619550863295736, 127.01760789241109, 'indoor', 'public',
    '02-6958-8101', 'https://www.sports-island-gb.co.kr/',
    6, 25, null, null,
    '{}', false, false, false,
    true, true,
    4000, 4800, 63000, null,
    'https://www.sports-island-gb.co.kr/Gangbuk/program/')
on conflict (id) do nothing;

-- 자유수영 시간표. 50분=0.83. 일요일은 매월 2·4주만 운영(weeks:[2,4]).
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0121', '풀스데이', $${
    "월": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"11:00","end":"11:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}],
    "화": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"11:00","end":"11:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}],
    "수": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"11:00","end":"11:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}],
    "목": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"11:00","end":"11:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}],
    "금": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"11:00","end":"11:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}],
    "토": [
      {"start":"06:00","end":"06:50","hours":0.83},
      {"start":"07:00","end":"07:50","hours":0.83},
      {"start":"08:00","end":"08:50","hours":0.83},
      {"start":"10:00","end":"10:50","hours":0.83},
      {"start":"11:00","end":"11:50","hours":0.83},
      {"start":"12:00","end":"12:50","hours":0.83},
      {"start":"14:00","end":"14:50","hours":0.83},
      {"start":"15:00","end":"15:50","hours":0.83},
      {"start":"16:00","end":"16:50","hours":0.83}
    ],
    "일": [
      {"start":"09:00","end":"09:50","hours":0.83,"weeks":[2,4]},
      {"start":"10:00","end":"10:50","hours":0.83,"weeks":[2,4]},
      {"start":"11:00","end":"11:50","hours":0.83,"weeks":[2,4]},
      {"start":"12:00","end":"12:50","hours":0.83,"weeks":[2,4]},
      {"start":"14:00","end":"14:50","hours":0.83,"weeks":[2,4]},
      {"start":"15:00","end":"15:50","hours":0.83,"weeks":[2,4]},
      {"start":"16:00","end":"16:50","hours":0.83,"weeks":[2,4]}
    ]
  }$$::jsonb, $${
    "월":"해수풀입니다. 초등학생은 신장 130cm 이상 입장 가능합니다(미만은 보호자 동반).",
    "화":"해수풀입니다. 초등학생은 신장 130cm 이상 입장 가능합니다(미만은 보호자 동반).",
    "수":"해수풀입니다. 초등학생은 신장 130cm 이상 입장 가능합니다(미만은 보호자 동반).",
    "목":"해수풀입니다. 초등학생은 신장 130cm 이상 입장 가능합니다(미만은 보호자 동반).",
    "금":"해수풀입니다. 초등학생은 신장 130cm 이상 입장 가능합니다(미만은 보호자 동반).",
    "토":"해수풀입니다. 초등학생은 신장 130cm 이상 입장 가능합니다(미만은 보호자 동반).",
    "일":"매월 둘째·넷째 주 일요일에만 운영합니다. 해수풀입니다."
  }$$::jsonb, '2026-06-07'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_0121'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0121');
