-- Pool's day — Phase 2: 수영장 1곳 추가: 기아스포츠센터 광명점 (POOL_0033).
-- ※ 첫 경기도(광명시) 풀.
--
-- ## 시간표·가격 출처
--
-- 운영자(크리스) 제공 공식 요금표(kiasportscenter.qshop.ai/price) "일일입장 이용요금" 표 — 1차.
--
-- - 적합성: 사설 종합스포츠센터(수영/배드민턴/탁구 등)지만 **자유수영 일일입장을 일반개방**
--   (초등학생부터, 미취학 불가) → 등록 정책 예외 통과. 호텔/키즈전용/휘트니스부속 아님.
-- - 자유수영 시간표 (요금표 그대로):
--   · 토요일      : 14:00~19:30 (5h30m)
--   · 일요일·공휴일: 09:00~17:30 (8h30m)
--   · 평일(월~금) : 일일 자유수영 없음 → 키 미포함
--   · 공휴일은 by_day 요일 모델로 표현 불가 → 일요일과 동일 시간이나 DB 미반영(주석으로만).
-- - 가격: 성인 6,000원 (초등학생 5,000은 스키마 컬럼 없어 미저장). 카드결제만.
--
-- ## 메타데이터 출처 / 미상 항목
--
-- - 정식 명칭: "기아스포츠센터 광명점"으로 등록(도메인 타이틀 기준) — ★운영자 확인 요망.
-- - 좌표 [신뢰도 높음]: 카카오 Local API "경기도 광명시 서면로 79" ROAD_ADDR 정확 매치.
-- - 레인수·수심·25/50m: 요금표에 없음 → NULL(임의생성 금지). 추후 보강.
-- - has_kids_pool: "미취학아동 입장불가" 단서로 false 추정 — ★확인 요망.
-- - phone: 신뢰 1차 출처 없어 NULL(2차 애그리게이터 번호 미채택).
-- - ownership=private(사설). photo_url=NULL(사진 미수령 → 정규화 경로로 추후 UPDATE).

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0033', '기아스포츠센터 광명점', '경기', '광명시',
    '경기도 광명시 서면로 79',
    37.4379641403238, 126.883732348619, 'indoor', 'private',
    null, 'https://kiasportscenter.qshop.ai/',
    null, null, null, null,
    '{}', false, false, false,
    true, true,
    6000, 6000, 6000, null,
    'https://kiasportscenter.qshop.ai/price')
on conflict (id) do nothing;

-- 자유수영 시간표 (공식 일일입장 요금표 그대로).
-- hours = (종료 - 시작) 분/60. 14:00~19:30=5.5, 09:00~17:30=8.5.
insert into public.schedules (pool_id, author_nickname, by_day, updated_at) values
  ('POOL_0033', '풀스데이', $${
    "토": [
      {"start":"14:00","end":"19:30","hours":5.5}
    ],
    "일": [
      {"start":"09:00","end":"17:30","hours":8.5}
    ]
  }$$::jsonb, '2026-06-04'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_0033'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0033');
