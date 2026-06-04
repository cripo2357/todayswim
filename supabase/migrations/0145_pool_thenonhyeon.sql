-- Pool's day — Phase 2: 수영장 1곳 추가: 더논현스포츠센터 (POOL_0049). 강남구 논현동(사설, 논현초 내).
--
-- ## 시간표·가격 출처
--
-- 운영자(크리스) 제공 자유수영 시간표 — 1차. 자유수영 일일입장 일반개방.
--
-- - 자유수영 시간표:
--   · 평일 1부 08:00~08:50 (화·목만) / 2부 13:00~14:50 / 3부 21:00~21:50
--     → 월·수·금: 2·3부 / 화·목: 1·2·3부
--   · 주말·공휴일: 1부 10:00~11:50, 2부 13:00~14:50, 3부 16:00~17:50
--   · 일요일 운영은 계절별 상이 → day_note 안내.
-- - 가격: ★일일입장 요금 미수령(캡처에 없음) → price NULL. 운영자 확인 시 보강.
--
-- ## 메타데이터
--
-- - 좌표 [신뢰도 높음]: 카카오 "서울 강남구 강남대로120길 33" ROAD_ADDR 정확 매치(논현초 내).
-- - ownership=private(사설). 전화·레인·수심 미상 → NULL. photo_url=NULL.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url
) values
  ('POOL_0049', '더논현스포츠센터', '서울', '강남구',
    '서울특별시 강남구 강남대로120길 33',
    37.5084895751287, 127.026222910697, 'indoor', 'private',
    null, null,
    null, null, null, null,
    '{}', false, false, false,
    true, true,
    null, null, null, null)
on conflict (id) do nothing;

-- 자유수영 시간표. hours: 50분=0.83, 1h50m=1.83.
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0049', '풀스데이', $${
    "월": [
      {"start":"13:00","end":"14:50","hours":1.83},
      {"start":"21:00","end":"21:50","hours":0.83}
    ],
    "화": [
      {"start":"08:00","end":"08:50","hours":0.83},
      {"start":"13:00","end":"14:50","hours":1.83},
      {"start":"21:00","end":"21:50","hours":0.83}
    ],
    "수": [
      {"start":"13:00","end":"14:50","hours":1.83},
      {"start":"21:00","end":"21:50","hours":0.83}
    ],
    "목": [
      {"start":"08:00","end":"08:50","hours":0.83},
      {"start":"13:00","end":"14:50","hours":1.83},
      {"start":"21:00","end":"21:50","hours":0.83}
    ],
    "금": [
      {"start":"13:00","end":"14:50","hours":1.83},
      {"start":"21:00","end":"21:50","hours":0.83}
    ],
    "토": [
      {"start":"10:00","end":"11:50","hours":1.83},
      {"start":"13:00","end":"14:50","hours":1.83},
      {"start":"16:00","end":"17:50","hours":1.83}
    ],
    "일": [
      {"start":"10:00","end":"11:50","hours":1.83},
      {"start":"13:00","end":"14:50","hours":1.83},
      {"start":"16:00","end":"17:50","hours":1.83}
    ]
  }$$::jsonb, $${
    "일": "일요일 운영은 계절별로 다를 수 있습니다."
  }$$::jsonb, '2026-06-04'::timestamptz)
on conflict (pool_id) do nothing;

update public.pools
set has_schedule = true
where id = 'POOL_0049'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0049');
