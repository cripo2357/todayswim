-- Pool's day — Phase 2: 수영장 1곳 추가: 난향초등학교 수영장 (POOL_0032).
--
-- ## 시간표·가격 출처
--
-- 운영자(크리스) 직접 제공 — 난향초 수영장 카카오톡 안내문 사진 + 월 정기권 요금표.
-- **단일 1차 출처.** 2차(블로그)는 메타데이터 참고만, 시간표·가격은 카톡 안내만 신뢰.
--   · 안내문: "자유수영(일일입장) 이용 안내" — 시간대·요금.
--   · 월 정기권표("2026 수영장 이용 요금표"): 자유수영 운영 요일이 월수금 / 화목 그룹으로
--     나뉨을 확정 → 요일별 시간표 교차검증의 핵심 근거. 토·일은 표에 없음 = 주말 미운영.
--
-- - 자유수영 시간표 (안내문 시간대 × 월권표 요일그룹 교차, 운영자 최종 확인):
--   · 월·수·금: 07·08·09·10·18·19·20시 (각 50분, 7슬롯)
--   · 화·목   : 07·08·09·18·20시 (10시·19시 제외 — 운영자 확인, 5슬롯)
--   · 토·일   : 자유수영 없음 → 키 미포함
--   · 09:00~09:50: 안내문엔 "2026년 2월까지 한시 운영" 표기가 있었으나, 운영자가 최신
--     월 정기권표(한시 제한 표기 없음)를 신뢰 기준으로 제시 → 상시 운영으로 확정 등록.
-- - 가격: 대인(14세 이상) 7,000원 단일(평일=주말 동일, 주말 미운영이라 weekend NULL).
--         소인 5,000·10회권(대인 63,000/소인 45,000)은 스키마 컬럼 없어 미저장.
--
-- ## 메타데이터 출처
--
-- - 규격 25m × 5레인(자유 2 + 강습 3): 운영자/블로그.
-- - 유아풀 있음(넓음) → has_kids_pool=true.
-- - 특징: **해수풀** + 드라이기 → facilities 노출(달리 담을 컬럼 없음).
-- - 수심: 블로그 "110/130cm 정도로 기억(부정확)"뿐 — 신뢰 출처 없어 NULL(임의생성 금지).
--         → 추후 운영자 정확값 확보 시 UPDATE 보강.
-- - ownership=private: 학교(위탁) 수영장 — 조원초(POOL_0005) 선례와 동일 컨벤션.
-- - 좌표 [신뢰도 높음]: 카카오 Local API "서울특별시 관악구 난향길 9" ROAD_ADDR 정확 매치.
-- - photo_url=NULL: 사진 미수령 — 운영자 사진 제공 시 정규화 경로로 UPDATE
--   (dev/prod 호스트 baked 회귀 회피, pool_photo_url_dev_baked 교훈).

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url
) values
  ('POOL_0032', '난향초등학교 수영장', '서울', '관악구',
    '서울특별시 관악구 난향길 9',
    37.4628218910704, 126.918336846046, 'indoor', 'private',
    null, null,
    5, 25, null, null,
    ARRAY['해수풀', '드라이기'], true, false, false,
    true, true,
    7000, 7000, null,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0032.jpg')
on conflict (id) do nothing;

-- 자유수영 시간표 (안내문 × 월권표 교차, 운영자 최종 확인).
-- hours = (종료 - 시작) 분/60. 50분=0.83.
insert into public.schedules (pool_id, author_nickname, by_day, updated_at) values
  ('POOL_0032', '풀스데이', $${
    "월": [
      {"start":"07:00","end":"07:50","hours":0.83},
      {"start":"08:00","end":"08:50","hours":0.83},
      {"start":"09:00","end":"09:50","hours":0.83},
      {"start":"10:00","end":"10:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83},
      {"start":"19:00","end":"19:50","hours":0.83},
      {"start":"20:00","end":"20:50","hours":0.83}
    ],
    "화": [
      {"start":"07:00","end":"07:50","hours":0.83},
      {"start":"08:00","end":"08:50","hours":0.83},
      {"start":"09:00","end":"09:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83},
      {"start":"20:00","end":"20:50","hours":0.83}
    ],
    "수": [
      {"start":"07:00","end":"07:50","hours":0.83},
      {"start":"08:00","end":"08:50","hours":0.83},
      {"start":"09:00","end":"09:50","hours":0.83},
      {"start":"10:00","end":"10:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83},
      {"start":"19:00","end":"19:50","hours":0.83},
      {"start":"20:00","end":"20:50","hours":0.83}
    ],
    "목": [
      {"start":"07:00","end":"07:50","hours":0.83},
      {"start":"08:00","end":"08:50","hours":0.83},
      {"start":"09:00","end":"09:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83},
      {"start":"20:00","end":"20:50","hours":0.83}
    ],
    "금": [
      {"start":"07:00","end":"07:50","hours":0.83},
      {"start":"08:00","end":"08:50","hours":0.83},
      {"start":"09:00","end":"09:50","hours":0.83},
      {"start":"10:00","end":"10:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83},
      {"start":"19:00","end":"19:50","hours":0.83},
      {"start":"20:00","end":"20:50","hours":0.83}
    ]
  }$$::jsonb, '2026-06-04'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_0032'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0032');
