-- Pool's day — 도봉구 배치: 도봉동실내스포츠센터 수영장 추가 (POOL_0123).
--
-- ## 시간표 출처 [1차 — 운영자 공식 / 크리스 제공 최신 캡처]
--
-- 크리스가 도봉동실내스포츠센터(도봉구시설관리공단) 자유수영 안내 최신 캡처 제공.
--
-- - 자유수영(50분 회차):
--   · 평일 13:00–13:50 → 월·화·수·목 / 평일 19:00–19:50 → 화·목·금
--   · 토: 06:00, 07:00, 09:00, 10:00, 12:00, 13:00, 15:00, 16:00 (8회차)
--   · 일(2·4주만): 09:00, 10:00, 12:00, 13:00, 15:00, 16:00 (6회차) → weeks:[2,4]
--   · 휴무: 매월 1·3·5주 일요일 및 공휴일.
-- - 가격: 일일권 평일 성인 4,000 / 토·일 성인 5,200.
-- - 1층 키오스크 발권(선착순), 개인장비는 유아풀 초급레인 한정 사용 가능.
--
-- ## 메타데이터 출처
-- - 성인풀 25m 5레인 수심 1.2m + 유아풀 수심 0.8m → has_kids_pool=true.
-- - 좌표 [신뢰도 높음]: 카카오 POI "도봉동 실내스포츠센터 수영장".
-- - 전화: 02-901-5170. 마들로 805(1호선 도봉역 도보 9분).
--
-- 사진: pool-photos/POOL_0123.jpg 미확보 → photo_url null.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0123', '도봉동실내스포츠센터', '서울', '도봉구',
    '서울특별시 도봉구 마들로 805',
    37.68147322656391, 127.05029984658724, 'indoor', 'public',
    '02-901-5170', 'https://www.dobongsiseol.or.kr/',
    5, 25, 1.2, 1.2,
    '{}', true, false, false,
    true, true,
    4000, 5200, null,
    'https://www.dobongsiseol.or.kr/')
on conflict (id) do nothing;

-- 자유수영 시간표. 50분=0.83. 평일 13시=월~목, 19시=화·목·금. 일요일 2·4주만(weeks:[2,4]).
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0123', '풀스데이', $${
    "월": [{"start":"13:00","end":"13:50","hours":0.83}],
    "화": [{"start":"13:00","end":"13:50","hours":0.83},{"start":"19:00","end":"19:50","hours":0.83}],
    "수": [{"start":"13:00","end":"13:50","hours":0.83}],
    "목": [{"start":"13:00","end":"13:50","hours":0.83},{"start":"19:00","end":"19:50","hours":0.83}],
    "금": [{"start":"19:00","end":"19:50","hours":0.83}],
    "토": [
      {"start":"06:00","end":"06:50","hours":0.83},
      {"start":"07:00","end":"07:50","hours":0.83},
      {"start":"09:00","end":"09:50","hours":0.83},
      {"start":"10:00","end":"10:50","hours":0.83},
      {"start":"12:00","end":"12:50","hours":0.83},
      {"start":"13:00","end":"13:50","hours":0.83},
      {"start":"15:00","end":"15:50","hours":0.83},
      {"start":"16:00","end":"16:50","hours":0.83}
    ],
    "일": [
      {"start":"09:00","end":"09:50","hours":0.83,"weeks":[2,4]},
      {"start":"10:00","end":"10:50","hours":0.83,"weeks":[2,4]},
      {"start":"12:00","end":"12:50","hours":0.83,"weeks":[2,4]},
      {"start":"13:00","end":"13:50","hours":0.83,"weeks":[2,4]},
      {"start":"15:00","end":"15:50","hours":0.83,"weeks":[2,4]},
      {"start":"16:00","end":"16:50","hours":0.83,"weeks":[2,4]}
    ]
  }$$::jsonb, $${
    "월":"선착순 입장이며 1층 키오스크에서 발권합니다.",
    "화":"선착순 입장이며 1층 키오스크에서 발권합니다.",
    "수":"선착순 입장이며 1층 키오스크에서 발권합니다.",
    "목":"선착순 입장이며 1층 키오스크에서 발권합니다.",
    "금":"선착순 입장이며 1층 키오스크에서 발권합니다.",
    "토":"선착순 입장이며 1층 키오스크에서 발권합니다.",
    "일":"매월 둘째·넷째 주 일요일에만 운영합니다. 선착순 입장입니다."
  }$$::jsonb, '2026-06-07'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_0123'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0123');
