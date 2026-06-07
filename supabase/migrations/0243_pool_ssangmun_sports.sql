-- Pool's day — 도봉구 배치: 쌍문종합체육센터 수영장 추가 (POOL_0124). 2024-06 개관.
--
-- ## 시간표 출처 [1차 — 운영자 공식 안내문]
--
-- 크리스가 쌍문종합체육센터(도봉구시설관리공단) 자유수영 안내 캡처 제공
-- (대기표 배부 안내 + 주말 시간표). 평일 요금은 크리스 확인(4,000).
--
-- - 자유수영(50분 회차):
--   · 평일: 14:00–14:50, 19:00–19:50 (※수요일 14시 미운영 → 수는 19시만)
--   · 토: 09:00, 10:00, 12:00, 13:00, 15:00, 16:00 (6회차)
--   · 일(1·3주만): 09:00, 10:00, 12:00, 13:00, 15:00, 16:00 (6회차) → weeks:[1,3]
-- - 가격: 평일 성인 4,000 / 주말(토·일) 성인 5,200.
-- - 선착순 40명. 키오스크 발권(여름 7~8월 대기표 배부). 튜브·구명조끼 반입 금지.
--
-- ## 메타데이터 출처
-- - 수영장 5레인(개관 보도). 길이/수심·유아풀 정보 없음 → null / has_kids_pool=false.
-- - 좌표 [신뢰도 높음]: 카카오 POI "쌍문종합체육센터"(쌍문동 265).
-- - 주소: 시루봉로 42. 전화 직통 미확인 → null(도봉구시설관리공단 대표 02-901-5000).
--
-- 사진: pool-photos/POOL_0124.jpg 미확보 → photo_url null.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0124', '쌍문종합체육센터', '서울', '도봉구',
    '서울특별시 도봉구 시루봉로 42',
    37.65434028195192, 127.02847814036419, 'indoor', 'public',
    null, 'https://www.dobongsiseol.or.kr/',
    5, null, null, null,
    '{}', false, false, false,
    true, true,
    4000, 5200, null,
    'https://www.dobongsiseol.or.kr/')
on conflict (id) do nothing;

-- 자유수영 시간표. 50분=0.83. 수요일 14시 미운영. 일요일 1·3주만(weeks:[1,3]).
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0124', '풀스데이', $${
    "월": [{"start":"14:00","end":"14:50","hours":0.83},{"start":"19:00","end":"19:50","hours":0.83}],
    "화": [{"start":"14:00","end":"14:50","hours":0.83},{"start":"19:00","end":"19:50","hours":0.83}],
    "수": [{"start":"19:00","end":"19:50","hours":0.83}],
    "목": [{"start":"14:00","end":"14:50","hours":0.83},{"start":"19:00","end":"19:50","hours":0.83}],
    "금": [{"start":"14:00","end":"14:50","hours":0.83},{"start":"19:00","end":"19:50","hours":0.83}],
    "토": [
      {"start":"09:00","end":"09:50","hours":0.83},
      {"start":"10:00","end":"10:50","hours":0.83},
      {"start":"12:00","end":"12:50","hours":0.83},
      {"start":"13:00","end":"13:50","hours":0.83},
      {"start":"15:00","end":"15:50","hours":0.83},
      {"start":"16:00","end":"16:50","hours":0.83}
    ],
    "일": [
      {"start":"09:00","end":"09:50","hours":0.83,"weeks":[1,3]},
      {"start":"10:00","end":"10:50","hours":0.83,"weeks":[1,3]},
      {"start":"12:00","end":"12:50","hours":0.83,"weeks":[1,3]},
      {"start":"13:00","end":"13:50","hours":0.83,"weeks":[1,3]},
      {"start":"15:00","end":"15:50","hours":0.83,"weeks":[1,3]},
      {"start":"16:00","end":"16:50","hours":0.83,"weeks":[1,3]}
    ]
  }$$::jsonb, $${
    "월":"선착순 40명 입장이며 튜브·구명조끼는 반입할 수 없습니다.",
    "화":"선착순 40명 입장이며 튜브·구명조끼는 반입할 수 없습니다.",
    "수":"선착순 40명 입장이며 튜브·구명조끼는 반입할 수 없습니다.",
    "목":"선착순 40명 입장이며 튜브·구명조끼는 반입할 수 없습니다.",
    "금":"선착순 40명 입장이며 튜브·구명조끼는 반입할 수 없습니다.",
    "토":"선착순 40명 입장이며 튜브·구명조끼는 반입할 수 없습니다.",
    "일":"매월 첫째·셋째 주 일요일에만 운영합니다. 선착순 40명 입장입니다."
  }$$::jsonb, '2026-06-07'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_0124'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0124');
