-- Pool's day — Phase 2: 수영장 1곳 추가: 방배현대스포츠클럽 (POOL_0039). 서초구 방배동(사설).
--
-- ## 시간표·가격 출처
--
-- 공식 정보 기반(방배현대스포츠클럽, swimmingis 경유 확인) — 사설 자유수영 일일입장.
-- 적합성: 사설이나 자유수영 일일입장 일반개방(성인 15,000) → 등록([[pool_eligibility_exceptions]]).
--   가격이 공공보다 비싸나 운영자 정책상 "자유수영 되면 등록, 가격은 사용자 선택"(2026-06-04).
--
-- - 자유수영 시간표:
--   · 월~금: 06:00~09:00, 13:00~16:00, 18:00~22:00
--   · 토: 06:00~18:00 (종일)
--   · 일: 2~5주차 휴관(첫째주 일부만 운영) → 매주 패턴 아니라 by_day 미포함.
-- - 가격: 일일입장 성인 15,000 / 어린이 10,000 (평일·주말 동일).
--
-- ## 메타데이터
--
-- - 시설: 25m × 5레인, 수심 1.2m.
-- - 좌표 [신뢰도 높음]: 카카오 "서울 서초구 방배로 12" ROAD_ADDR 정확 매치(현대맨션).
-- - 전화: 02-597-3303. ownership=private(사설). photo_url=NULL.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url
) values
  ('POOL_0039', '방배현대스포츠클럽', '서울', '서초구',
    '서울특별시 서초구 방배로 12',
    37.4761056771361, 127.001616779629, 'indoor', 'private',
    '02-597-3303', null,
    5, 25, 1.2, 1.2,
    '{}', false, false, false,
    true, true,
    15000, 15000, 15000, null)
on conflict (id) do nothing;

-- 자유수영 시간표. hours = (종료 - 시작) 시간. 일요일 미포함(2~5주 휴관).
insert into public.schedules (pool_id, author_nickname, by_day, updated_at) values
  ('POOL_0039', '풀스데이', $${
    "월": [
      {"start":"06:00","end":"09:00","hours":3},
      {"start":"13:00","end":"16:00","hours":3},
      {"start":"18:00","end":"22:00","hours":4}
    ],
    "화": [
      {"start":"06:00","end":"09:00","hours":3},
      {"start":"13:00","end":"16:00","hours":3},
      {"start":"18:00","end":"22:00","hours":4}
    ],
    "수": [
      {"start":"06:00","end":"09:00","hours":3},
      {"start":"13:00","end":"16:00","hours":3},
      {"start":"18:00","end":"22:00","hours":4}
    ],
    "목": [
      {"start":"06:00","end":"09:00","hours":3},
      {"start":"13:00","end":"16:00","hours":3},
      {"start":"18:00","end":"22:00","hours":4}
    ],
    "금": [
      {"start":"06:00","end":"09:00","hours":3},
      {"start":"13:00","end":"16:00","hours":3},
      {"start":"18:00","end":"22:00","hours":4}
    ],
    "토": [
      {"start":"06:00","end":"18:00","hours":12}
    ]
  }$$::jsonb, '2026-06-04'::timestamptz)
on conflict (pool_id) do nothing;

update public.pools
set has_schedule = true
where id = 'POOL_0039'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0039');
