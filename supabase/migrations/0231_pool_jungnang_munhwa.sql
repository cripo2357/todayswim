-- Pool's day — 중랑구 배치: 중랑문화체육관 수영장 추가 (POOL_0112).
--
-- ## 시간표 출처 [1차 — 운영자 공식]
--
-- 크리스가 공식 홈페이지(jungnangimc.or.kr/html/01020300) '자유이용' 표 캡처 제공.
-- 공식 SPA라 정적 fetch 불가 → 캡처가 1차. 2차(첨벙)는 평일을 "월~금 15:00"으로,
-- 일요일을 2시간 블록으로 잘못 적었으나 공식으로 정정(평일=화·목만, 일=50분 6부).
--
-- - 자유수영(회차당 50분):
--   · 평일(화·목만): 1부 15:00–15:50, 2부 18:00–18:50. 월·수·금 미운영.
--   · 토         : 08:00–08:50, 11:00–11:50, 15:00–15:50, 16:00–16:50, 17:00–17:50 (5부)
--   · 일(1·3주만): 09:30–10:20, 10:30–11:20, 11:30–12:20, 13:30–14:20, 14:30–15:20,
--                  15:30–16:20 (6부) → weeks:[1,3]로 구조화.
--   · 정기휴관: 매월 둘째·넷째·다섯째 일요일 및 공휴일.
-- - 가격: 평일 성인 4,100 / 주말(토·일) 성인 5,400.
-- - 유의: 어린이는 유아풀만, 36개월 이상 입장(만7세 미만 보호자 동반), 튜브·오리발 금지.
--
-- ## 메타데이터 출처
-- - 25m × 6레인(서울시 생활체육포털 ft_idx=1193 "성인풀 25m 6레인"), 수심 1.2~1.4m(첨벙).
--   유아풀 보유(공식 유의 "어린이는 유아풀만") → has_kids_pool=true.
-- - 좌표 [신뢰도 높음]: 카카오 POI "중랑문화체육관"(면목동 519).
-- - 전화: 02-436-9200. 지하 2층.
--
-- 사진: pool-photos/POOL_0112.jpg 미확보 → photo_url null.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0112', '중랑문화체육관', '서울', '중랑구',
    '서울특별시 중랑구 사가정로72길 47',
    37.5792876140323, 127.095861208569, 'indoor', 'public',
    '02-436-9200', 'https://www.jungnangimc.or.kr/',
    6, 25, 1.2, 1.4,
    '{}', true, false, false,
    true, true,
    4100, 5400, null,
    'https://www.jungnangimc.or.kr/html/01020300')
on conflict (id) do nothing;

-- 자유수영 시간표. 50분=0.83. 일요일은 매월 1·3주만 운영(weeks:[1,3]).
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0112', '풀스데이', $${
    "화": [
      {"start":"15:00","end":"15:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83}
    ],
    "목": [
      {"start":"15:00","end":"15:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83}
    ],
    "토": [
      {"start":"08:00","end":"08:50","hours":0.83},
      {"start":"11:00","end":"11:50","hours":0.83},
      {"start":"15:00","end":"15:50","hours":0.83},
      {"start":"16:00","end":"16:50","hours":0.83},
      {"start":"17:00","end":"17:50","hours":0.83}
    ],
    "일": [
      {"start":"09:30","end":"10:20","hours":0.83,"weeks":[1,3]},
      {"start":"10:30","end":"11:20","hours":0.83,"weeks":[1,3]},
      {"start":"11:30","end":"12:20","hours":0.83,"weeks":[1,3]},
      {"start":"13:30","end":"14:20","hours":0.83,"weeks":[1,3]},
      {"start":"14:30","end":"15:20","hours":0.83,"weeks":[1,3]},
      {"start":"15:30","end":"16:20","hours":0.83,"weeks":[1,3]}
    ]
  }$$::jsonb, $${
    "일":"매월 첫째·셋째 주 일요일에만 운영합니다."
  }$$::jsonb, '2026-06-07'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_0112'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0112');
