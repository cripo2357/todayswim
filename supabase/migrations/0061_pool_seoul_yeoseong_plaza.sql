-- Pool's day — Phase 2: 수영장 1곳 추가: 서울여성플라자 스포츠센터 (POOL_SEOUL_0014).
--
-- ## 시간표·가격 출처
--
-- 공식 사이트(서울여성플라자 https://www.swomansports.co.kr/program/yoga.asp) — 1차 출처.
-- 첨벙(2차)으로 시설 규격만 보강. 시간표·가격은 공식만 신뢰.
--
-- - 시간표:
--   · 화·목: 08:00–08:50, 13:00–13:50, 21:00–21:50 (3슬롯)
--   · 토   : 06:00–08:50, 10:00–11:50, 13:00–14:50, 16:00–17:50 (4슬롯)
--   · 월·수·금·일: 자유수영 슬롯 없음.
-- - 가격: 평일(화목) 4,800원 / 주말(토) 6,200원.
--
-- ## 메타데이터 출처
--
-- - 25m×6레인: 첨벙(공식엔 미기재).
-- - 수심: 양쪽 모두 "전화문의" → 미상 → NULL.
-- - 유아풀 보유: 운영자 확인 → has_kids_pool=true.
-- - 좌표 [신뢰도 높음]: 카카오 POI "서울여성플라자 스포츠센터 수영장" 정확 매치
--   (lat=37.5114, lng=126.9271, 대방동 345-1, 도로명 여의대방로54길 18).
-- - 운영주체: 서울특별시 여성가족재단(공공) → ownership=public.
-- - 전화 02-822-2425(공식), 첨벙 02-822-2426는 1자리 차이 — 공식 채택.
--
-- 사진: pool-photos/POOL_SEOUL_0014.jpg 업로드 대기.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_SEOUL_0014', '서울여성플라자 스포츠센터', '서울', '동작구',
    '서울특별시 동작구 여의대방로54길 18',
    37.5114047648408, 126.927136587647, 'indoor', 'public',
    '02-822-2425', 'https://www.swomansports.co.kr/',
    6, 25, null, null,
    '{}', true, false, false,
    true, true,
    4800, 4800, 6200,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_SEOUL_0014.jpg',
    'https://www.swomansports.co.kr/program/yoga.asp')
on conflict (id) do nothing;

-- 자유수영 시간표.
-- hours = (종료 - 시작) 분/60. 50분=0.83, 1h50m=1.83, 2h50m=2.83.
-- 월·수·금·일은 자유수영 없음 → 키 미포함.
insert into public.schedules (pool_id, author_nickname, by_day, updated_at) values
  ('POOL_SEOUL_0014', '풀스데이', $${
    "화": [
      {"start":"08:00","end":"08:50","hours":0.83},
      {"start":"13:00","end":"13:50","hours":0.83},
      {"start":"21:00","end":"21:50","hours":0.83}
    ],
    "목": [
      {"start":"08:00","end":"08:50","hours":0.83},
      {"start":"13:00","end":"13:50","hours":0.83},
      {"start":"21:00","end":"21:50","hours":0.83}
    ],
    "토": [
      {"start":"06:00","end":"08:50","hours":2.83},
      {"start":"10:00","end":"11:50","hours":1.83},
      {"start":"13:00","end":"14:50","hours":1.83},
      {"start":"16:00","end":"17:50","hours":1.83}
    ]
  }$$::jsonb, '2026-05-20'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_SEOUL_0014'
  and exists (select 1 from public.schedules where pool_id = 'POOL_SEOUL_0014');
