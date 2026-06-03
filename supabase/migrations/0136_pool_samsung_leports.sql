-- Pool's day — Phase 2: 수영장 1곳 추가: 삼성레포츠센터 (POOL_0041). 서초구(사설).
--
-- ## 시간표·가격 출처
--
-- 공식(ssleports.com) AQUATICS 자유수영시간 — 1차. 자유수영 일일입장 일반개방.
--
-- - 자유수영 시간표 (공식):
--   · 평일: 05:30~06:50, 12:00~13:50, 18:00~18:50, 21:00~21:50
--   · 토요일: 05:30~20:50 (통)
--   · 공휴일: 05:30~20:50 (휴장 12:00~13:00) → by_day 모델 외라 미반영.
--   · 일요일: 공식 표에 미명시(평일/토/공휴일만 구분) → 미포함. ★일요일 운영 여부 확인 권장.
--   · 생후 36개월+ 이용, 1일 1회, 강습 당일 자유수영 불가.
-- - 가격: 일일 성인 평일 18,000 / 주말 19,000.
--
-- ## 메타데이터
--
-- - 좌표 [신뢰도 높음]: 카카오 "서울 서초구 서초대로64길 76-21" ROAD_ADDR 정확 매치.
-- - 전화: 02-3470-0500. ownership=private. 레인·수심은 미확보 → NULL. photo_url=NULL.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0041', '삼성레포츠센터', '서울', '서초구',
    '서울특별시 서초구 서초대로64길 76-21',
    37.491824433908, 127.021530255873, 'indoor', 'private',
    '02-3470-0500', 'https://www.ssleports.com/',
    null, null, null, null,
    '{}', false, false, false,
    true, true,
    18000, 18000, 19000, null,
    'https://www.ssleports.com/sports/program_time.php?cdCode=sccgsm&regCode=sccgsmad')
on conflict (id) do nothing;

-- 자유수영 시간표 (공식). hours: 1h20m=1.33, 1h50m=1.83, 50분=0.83, 토 15h20m=15.33.
insert into public.schedules (pool_id, author_nickname, by_day, updated_at) values
  ('POOL_0041', '풀스데이', $${
    "월": [
      {"start":"05:30","end":"06:50","hours":1.33},
      {"start":"12:00","end":"13:50","hours":1.83},
      {"start":"18:00","end":"18:50","hours":0.83},
      {"start":"21:00","end":"21:50","hours":0.83}
    ],
    "화": [
      {"start":"05:30","end":"06:50","hours":1.33},
      {"start":"12:00","end":"13:50","hours":1.83},
      {"start":"18:00","end":"18:50","hours":0.83},
      {"start":"21:00","end":"21:50","hours":0.83}
    ],
    "수": [
      {"start":"05:30","end":"06:50","hours":1.33},
      {"start":"12:00","end":"13:50","hours":1.83},
      {"start":"18:00","end":"18:50","hours":0.83},
      {"start":"21:00","end":"21:50","hours":0.83}
    ],
    "목": [
      {"start":"05:30","end":"06:50","hours":1.33},
      {"start":"12:00","end":"13:50","hours":1.83},
      {"start":"18:00","end":"18:50","hours":0.83},
      {"start":"21:00","end":"21:50","hours":0.83}
    ],
    "금": [
      {"start":"05:30","end":"06:50","hours":1.33},
      {"start":"12:00","end":"13:50","hours":1.83},
      {"start":"18:00","end":"18:50","hours":0.83},
      {"start":"21:00","end":"21:50","hours":0.83}
    ],
    "토": [
      {"start":"05:30","end":"20:50","hours":15.33}
    ]
  }$$::jsonb, '2026-06-04'::timestamptz)
on conflict (pool_id) do nothing;

update public.pools
set has_schedule = true
where id = 'POOL_0041'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0041');
