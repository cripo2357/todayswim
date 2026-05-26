-- Pool's day — Phase 2: 수영장 1곳 추가: 금나래문화체육센터 (POOL_0018).
--
-- ## 시간표 출처
--
-- 1차 출처(공식 안내판): 운영자(크리스) 제공 "2025년 일일자유수영 운영 확대 안내"
-- (금나래문화체육센터 로고 포함, 회원 공지) — pool_schedule_source_priority 1차만.
-- 보조(시설 메타만): gfmc.kr/sub05_030202 (동일 운영주체=금천구시설관리공단).
-- 운영자가 안내한 블로그(saetbuel1)는 정책상 일체 미사용.
--
-- - 평일(월~금):
--   · 08:00-08:50, 12:00-12:50, 13:00-13:50, 18:00-18:50
-- - 토요일(매주 운영, 시즌 무관):
--   · 10:00-11:50, 13:00-14:50, 16:00-17:50
-- - 일요일:
--   · 기본: 매월 2·4주 일요일 10:00-11:50, 13:00-14:50 (시행 2025-01-12~)
--   · 성수기 7·8월: 매주 일요일 + 3부 16:00-17:50 추가
-- - 요금:
--   · 평일: 성인 5,000 / 청소년 3,800 / 어린이 2,900
--   · 주말: 성인 6,500 / 청소년 4,940 / 어린이 3,770
--
-- ## 데이터 모델링
--
-- - by_day = 평일·토(매주 동일)·일(기본=2·4주, 1·2부) 슬롯.
--   요일 칩/게이팅 기준. 토요일은 시즌 변동 없어 by_day만으로 충분.
-- - slot_groups.일 = 2개 그룹 (일요일만 시즌 분기):
--   · "기본 운영 (매월 2·4주 일요일)" months:[1~6, 9~12] — 1·2부
--   · "여름 운영 (7,8월 매주 일요일, 3부 추가)" months:[7,8] — 1·2·3부
--   (주차 제한 "2·4주"는 슬롯 모델로 표현 불가 → 라벨 텍스트에 명시. KBS 패턴.)
-- - 평일/토요일은 slot_groups에 넣지 않음(시즌 변동 없음 → by_day 폴백).
-- - day_notes는 슬롯 1개+ 요일일 때만 사용(day_note_constraint) → 미사용.
--   "20분 전 발권/구명물품 금지/비치용 반바지 금지/공간 이용 제한" 등 풀 전체
--   비고는 슬롯별이 아니라 별도 필드 도입 전엔 DB 미반영.
--
-- ## 메타데이터 출처
--
-- - 시설(성인풀 6레인 25m, 어린이풀, 유아풀, 860.16㎡): 공식 sub05_030202.
-- - 수심: 공식·안내판 미명시 → null (추후 운영자 확인 시 UPDATE).
-- - 가격: 안내판 그대로. 성인 기준으로 price_weekday/weekend 분리.
--   price_per_session=평일 성인 가격.
-- - 좌표 [신뢰도 높음]: 카카오 POI "금나래문화체육센터" 정확 매치
--   (금천구 독산동 1148, 도로명 시흥대로79길 32).
-- - 전화: 02-805-7678 (공식).
--
-- 사진: pool-photos/POOL_0018.jpg 업로드 대기 (안내판 이미지 ≠ 풀 사진).

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0018', '금나래문화체육센터', '서울', '금천구',
    '서울특별시 금천구 시흥대로79길 32',
    37.45895727781942, 126.89608339873034, 'indoor', 'public',
    '02-805-7678', 'https://www.gfmc.kr/page/business/sub05_030202.php',
    6, 25, null, null,
    '{}', true, false, false,
    true, true,
    5000, 5000, 6500,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0018.jpg',
    'https://www.gfmc.kr/page/business/sub05_030202.php')
on conflict (id) do nothing;

-- 자유수영 시간표 (운영자 제공 공식 안내판 그대로).
-- hours = (종료 - 시작) 분/60. 50분=0.83, 1h50m=1.83.
insert into public.schedules (pool_id, author_nickname, by_day, slot_groups, updated_at) values
  ('POOL_0018', '풀스데이', $${
    "월": [
      {"start":"08:00","end":"08:50","hours":0.83},
      {"start":"12:00","end":"12:50","hours":0.83},
      {"start":"13:00","end":"13:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83}
    ],
    "화": [
      {"start":"08:00","end":"08:50","hours":0.83},
      {"start":"12:00","end":"12:50","hours":0.83},
      {"start":"13:00","end":"13:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83}
    ],
    "수": [
      {"start":"08:00","end":"08:50","hours":0.83},
      {"start":"12:00","end":"12:50","hours":0.83},
      {"start":"13:00","end":"13:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83}
    ],
    "목": [
      {"start":"08:00","end":"08:50","hours":0.83},
      {"start":"12:00","end":"12:50","hours":0.83},
      {"start":"13:00","end":"13:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83}
    ],
    "금": [
      {"start":"08:00","end":"08:50","hours":0.83},
      {"start":"12:00","end":"12:50","hours":0.83},
      {"start":"13:00","end":"13:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83}
    ],
    "토": [
      {"start":"10:00","end":"11:50","hours":1.83},
      {"start":"13:00","end":"14:50","hours":1.83},
      {"start":"16:00","end":"17:50","hours":1.83}
    ],
    "일": [
      {"start":"10:00","end":"11:50","hours":1.83},
      {"start":"13:00","end":"14:50","hours":1.83}
    ]
  }$$::jsonb, $${
    "일": [
      {"label":"기본 운영 (매월 2·4주 일요일)", "months":[1,2,3,4,5,6,9,10,11,12], "slots":[
        {"start":"10:00","end":"11:50","hours":1.83},
        {"start":"13:00","end":"14:50","hours":1.83}
      ]},
      {"label":"여름 운영 (7,8월 매주 일요일, 3부 추가)", "months":[7,8], "slots":[
        {"start":"10:00","end":"11:50","hours":1.83},
        {"start":"13:00","end":"14:50","hours":1.83},
        {"start":"16:00","end":"17:50","hours":1.83}
      ]}
    ]
  }$$::jsonb, '2026-05-26'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_0018'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0018');
