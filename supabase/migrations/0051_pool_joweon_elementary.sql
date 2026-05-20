-- Pool's day — Phase 2: 수영장 1곳 추가: 조원초등학교 수영장 (POOL_SEOUL_0009).
--
-- ## 출처 (우선순위)
--
-- 1차: **수영장 현장 시간안내판 사진** (운영자 직접 촬영, 확정 출처).
-- 2차 교차검증:
--   - 첨벙 (cheombeong, 2023-12): 동일 시간대를 50분 단위로 풀어서 표기 → 동일 데이터.
--   - 헬로우스윔 (HELLO,SWIM, 2025-12-15): 시설/규격(주차O, 개인킥판O, 오리발X,
--                                          유아풀X, 25m×5레인).
--
-- ## 채택 결정
--
-- - 시간표: 현장 표 그대로 — 연속 운영 구간을 한 슬롯으로 묶음(50분 단위 분할 X).
--           화·목 12:00~13:50 = 1h50m 한 묶음 / 수 06:00~08:50 = 2h50m / 토 1부·2부 형태.
-- - 가격:   성인 10,000원(현장 안내문 명시). 어린이 8,000원·월권 105,000원은 별도 컬럼 없어 미저장.
-- - 시설:   주차장만 (헬로우스윔 기준, 그 외는 명시 없음 → 추측 금지).
-- - 휴관:   일요일·명절연휴(공휴일은 사전 공지) — day_notes는 슬롯 있는 요일에만 가능해서
--           본 마이그레이션엔 미포함(필요 시 추후 보정).
-- - 좌표 [신뢰도 높음]: 카카오 Local API "서울특별시 관악구 조원로 67" ROAD_ADDR 정확 매치.
--
-- 사진: pool-photos/POOL_SEOUL_0009.jpg 업로드 대기 (별도 UPDATE 불필요).

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url
) values
  ('POOL_SEOUL_0009', '조원초등학교 수영장', '서울', '관악구',
    '서울특별시 관악구 조원로 67',
    37.484127765974, 126.909505620969, 'indoor', 'private',
    '02-857-9400', null,
    5, 25, 1.2, 1.2,
    ARRAY['주차장'], false, false, false,
    true, true,
    10000, 10000, 10000,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_SEOUL_0009.jpg')
on conflict (id) do nothing;

-- 자유수영 시간표 (현장 시간안내판 그대로).
-- hours = (종료 - 시작) 분/60. 50분=0.83, 1h50m=1.83, 2h50m=2.83, 3h50m=3.83.
-- 일요일·명절연휴 휴관 → 키 미포함.
insert into public.schedules (pool_id, author_nickname, by_day, updated_at) values
  ('POOL_SEOUL_0009', '풀스데이', $${
    "월": [
      {"start":"08:00","end":"08:50","hours":0.83},
      {"start":"13:00","end":"13:50","hours":0.83}
    ],
    "화": [
      {"start":"08:00","end":"08:50","hours":0.83},
      {"start":"12:00","end":"13:50","hours":1.83}
    ],
    "수": [
      {"start":"06:00","end":"08:50","hours":2.83},
      {"start":"13:00","end":"13:50","hours":0.83},
      {"start":"19:00","end":"20:50","hours":1.83}
    ],
    "목": [
      {"start":"08:00","end":"08:50","hours":0.83},
      {"start":"12:00","end":"13:50","hours":1.83}
    ],
    "금": [
      {"start":"08:00","end":"08:50","hours":0.83},
      {"start":"13:00","end":"13:50","hours":0.83}
    ],
    "토": [
      {"start":"07:00","end":"10:50","hours":3.83},
      {"start":"14:00","end":"16:50","hours":2.83}
    ]
  }$$::jsonb, '2026-05-20'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_SEOUL_0009'
  and exists (select 1 from public.schedules where pool_id = 'POOL_SEOUL_0009');
