-- Pool's day — Phase 2: 호텔 수영장 1곳 추가:
-- 르컬렉티브 해운대 패러그라프 (POOL_BUSAN_HOTEL_0001).
--
-- ## 시간표 출처
--
-- 운영자(크리스) 직접 제보 — pool_schedule_source_priority 1차 출처.
-- - 운영 시간: 매일 10:00 - 21:00
-- - 정비 시간(휴장): 12:00 - 13:00, 18:00 - 19:00
-- - 자유수영 슬롯(매일 동일):
--   · 10:00 - 12:00 (2h)
--   · 13:00 - 18:00 (5h)
--   · 19:00 - 21:00 (2h)
--
-- ## 메타데이터 출처
--
-- - 시설: 수심 1.1m, 레인 없음(lane_count/pool_length=null) — 운영자 제보.
-- - 일일 입장 가능, 27,000원 (투숙객/일반 동일 가정 — 별도 안내 시 분리).
-- - 좌표 [신뢰도 높음]: 카카오 POI "르컬렉티브 해운대 패러그라프" 정확 매치
--   (해운대구 우동 645-6).
-- - is_hotel_pool=true → 호텔 마커/칩 분기.
--
-- 사진: pool-photos/POOL_BUSAN_HOTEL_0001.jpg 업로드 대기.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url
) values
  ('POOL_BUSAN_HOTEL_0001', '르컬렉티브 해운대 패러그라프', '부산', '해운대구',
    '부산광역시 해운대구 우동 645-6',
    35.16025615265655, 129.15697067442542, 'indoor', 'private',
    null, null, 1.1, 1.1,
    '{}', false, false, true,
    true, true,
    27000, 27000, 27000,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_BUSAN_HOTEL_0001.jpg')
on conflict (id) do nothing;

-- 자유수영 시간표 (호텔 일일 입장, 매일 동일).
-- hours = (종료 - 시작) 분/60.
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_BUSAN_HOTEL_0001', '르컬렉티브패러그라프', $${
    "월": [
      {"start":"10:00","end":"12:00","hours":2},
      {"start":"13:00","end":"18:00","hours":5},
      {"start":"19:00","end":"21:00","hours":2}
    ],
    "화": [
      {"start":"10:00","end":"12:00","hours":2},
      {"start":"13:00","end":"18:00","hours":5},
      {"start":"19:00","end":"21:00","hours":2}
    ],
    "수": [
      {"start":"10:00","end":"12:00","hours":2},
      {"start":"13:00","end":"18:00","hours":5},
      {"start":"19:00","end":"21:00","hours":2}
    ],
    "목": [
      {"start":"10:00","end":"12:00","hours":2},
      {"start":"13:00","end":"18:00","hours":5},
      {"start":"19:00","end":"21:00","hours":2}
    ],
    "금": [
      {"start":"10:00","end":"12:00","hours":2},
      {"start":"13:00","end":"18:00","hours":5},
      {"start":"19:00","end":"21:00","hours":2}
    ],
    "토": [
      {"start":"10:00","end":"12:00","hours":2},
      {"start":"13:00","end":"18:00","hours":5},
      {"start":"19:00","end":"21:00","hours":2}
    ],
    "일": [
      {"start":"10:00","end":"12:00","hours":2},
      {"start":"13:00","end":"18:00","hours":5},
      {"start":"19:00","end":"21:00","hours":2}
    ]
  }$$::jsonb, '{}'::jsonb, '2026-05-25'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_BUSAN_HOTEL_0001'
  and exists (select 1 from public.schedules where pool_id = 'POOL_BUSAN_HOTEL_0001');
