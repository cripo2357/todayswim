-- Pool's day — Phase 2: 수영장 1곳 추가: 서일체육문화센터 (POOL_0043). 서초구 서초동(사설/위탁).
--
-- ## 시간표·가격 출처
--
-- 현장 안내판 사진(블로그 경유) — 운영시간 + "자유수영 입장불가 시간"(강습) 표. 1차에 준함.
--
-- - 운영: 평일 06:00~21:50, 토 09:00~17:50, 일요일 휴무, 공휴일 09:00~17:50(by_day 외).
-- - 자유수영 = 운영시간 − 입장불가(강습) 시간. 시간제한(50분) 없음.
--   · 입장불가: 월수금 07:00~08:00·12:00~13:00·19:00~21:00 / 화목 12:00~13:00.
--   · 월·수·금 자유수영: 06:00~07:00, 08:00~12:00, 13:00~19:00, 21:00~21:50
--   · 화·목 자유수영: 06:00~12:00, 13:00~21:50
--   · 토: 09:00~17:50 / 일: 휴무.
-- - 유아풀 있음(안내판 "유아풀 이용가능") → has_kids_pool=true.
-- - 가격: 일일입장 비회원 성인 12,000.
--
-- ## 메타데이터
--
-- - 시설: 25m × 5레인.
-- - 좌표 [신뢰도 높음]: 카카오 "서울 서초구 서운로21길 2" ROAD_ADDR 정확 매치.
-- - 전화: 02-3478-8870(안내판). ownership=private. photo_url=NULL.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url
) values
  ('POOL_0043', '서일체육문화센터', '서울', '서초구',
    '서울특별시 서초구 서운로21길 2',
    37.4985298571843, 127.023220688907, 'indoor', 'private',
    '02-3478-8870', null,
    5, 25, null, null,
    '{}', true, false, false,
    true, true,
    12000, 12000, 12000, null)
on conflict (id) do nothing;

-- 자유수영 시간표 (운영시간 − 강습). hours = (종료 - 시작) 시간. 50분=0.83, 8h50m=8.83.
insert into public.schedules (pool_id, author_nickname, by_day, updated_at) values
  ('POOL_0043', '풀스데이', $${
    "월": [
      {"start":"06:00","end":"07:00","hours":1},
      {"start":"08:00","end":"12:00","hours":4},
      {"start":"13:00","end":"19:00","hours":6},
      {"start":"21:00","end":"21:50","hours":0.83}
    ],
    "화": [
      {"start":"06:00","end":"12:00","hours":6},
      {"start":"13:00","end":"21:50","hours":8.83}
    ],
    "수": [
      {"start":"06:00","end":"07:00","hours":1},
      {"start":"08:00","end":"12:00","hours":4},
      {"start":"13:00","end":"19:00","hours":6},
      {"start":"21:00","end":"21:50","hours":0.83}
    ],
    "목": [
      {"start":"06:00","end":"12:00","hours":6},
      {"start":"13:00","end":"21:50","hours":8.83}
    ],
    "금": [
      {"start":"06:00","end":"07:00","hours":1},
      {"start":"08:00","end":"12:00","hours":4},
      {"start":"13:00","end":"19:00","hours":6},
      {"start":"21:00","end":"21:50","hours":0.83}
    ],
    "토": [
      {"start":"09:00","end":"17:50","hours":8.83}
    ]
  }$$::jsonb, '2026-06-04'::timestamptz)
on conflict (pool_id) do nothing;

update public.pools
set has_schedule = true
where id = 'POOL_0043'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0043');
