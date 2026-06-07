-- Pool's day — 강북구 배치: 시립강북청소년센터(난나) 수영장 추가 (POOL_0122).
--
-- ## 시간표 출처 [1차 — 운영자 공식]
--
-- 크리스가 시립강북청소년센터(nanna.seoul.kr) '자유수영 안내' 공식 표 캡처 제공.
--
-- - 자유수영(일일자유, 50분 회차):
--   · 월·수·금: 13:00–13:50
--   · 화·목   : 13:00–13:50, 14:00–14:50, 19:00–19:50, 20:00–20:50
--   · 토       : 15:00–15:50, 16:00–16:50 (※ 청소년 전용 — 성인 이용 불가)
--   · 일       : 수영장 미운영.
-- - 가격(1회): 성인 5,000 / 청소년 평일 2,500·주말 3,000 / 유아 1,800. 평일 성인가 5,000 채택.
--   토요일은 청소년 전용이라 성인 일일가 없음 → price_weekend 미설정.
-- - 정원 매 시간 70명. 개인물품: 킥판·헬퍼·구명조끼 반입 가능 / 튜브·오리발·물총·에어볼 금지.
--
-- ## 메타데이터 출처
-- - 좌표 [신뢰도 높음]: 카카오 POI "시립강북청소년센터"(수유동 535-380).
-- - 전화: 02-6715-6600. 4.19로 74. 레인/길이/수심 정보 없음 → null. has_kids_pool=false.
--
-- 사진: pool-photos/POOL_0122.jpg 미확보 → photo_url null.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_weekday, photo_url,
  schedule_source_url
) values
  ('POOL_0122', '시립강북청소년센터', '서울', '강북구',
    '서울특별시 강북구 4.19로 74',
    37.6459887310416, 127.00636352285, 'indoor', 'public',
    '02-6715-6600', 'https://nanna.seoul.kr/',
    null, null, null, null,
    '{}', false, false, false,
    true, true,
    5000, null,
    'https://nanna.seoul.kr/swimming')
on conflict (id) do nothing;

-- 자유수영 시간표. 50분=0.83. 토요일은 청소년 전용. 일요일 미운영.
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0122', '풀스데이', $${
    "월": [{"start":"13:00","end":"13:50","hours":0.83}],
    "화": [
      {"start":"13:00","end":"13:50","hours":0.83},
      {"start":"14:00","end":"14:50","hours":0.83},
      {"start":"19:00","end":"19:50","hours":0.83},
      {"start":"20:00","end":"20:50","hours":0.83}
    ],
    "수": [{"start":"13:00","end":"13:50","hours":0.83}],
    "목": [
      {"start":"13:00","end":"13:50","hours":0.83},
      {"start":"14:00","end":"14:50","hours":0.83},
      {"start":"19:00","end":"19:50","hours":0.83},
      {"start":"20:00","end":"20:50","hours":0.83}
    ],
    "금": [{"start":"13:00","end":"13:50","hours":0.83}],
    "토": [
      {"start":"15:00","end":"15:50","hours":0.83},
      {"start":"16:00","end":"16:50","hours":0.83}
    ]
  }$$::jsonb, $${
    "월":"킥판·헬퍼·구명조끼는 사용할 수 있으나 튜브·오리발·물총 등은 반입할 수 없습니다.",
    "화":"킥판·헬퍼·구명조끼는 사용할 수 있으나 튜브·오리발·물총 등은 반입할 수 없습니다.",
    "수":"킥판·헬퍼·구명조끼는 사용할 수 있으나 튜브·오리발·물총 등은 반입할 수 없습니다.",
    "목":"킥판·헬퍼·구명조끼는 사용할 수 있으나 튜브·오리발·물총 등은 반입할 수 없습니다.",
    "금":"킥판·헬퍼·구명조끼는 사용할 수 있으나 튜브·오리발·물총 등은 반입할 수 없습니다.",
    "토":"매주 토요일은 청소년만 이용할 수 있습니다(매월 마지막 주 토요일 청소년 무료)."
  }$$::jsonb, '2026-06-07'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_0122'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0122');
