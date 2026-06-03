-- Pool's day — Phase 2: 수영장 1곳 추가: 상계구민체육센터 (POOL_0029).
--
-- ## 시간표 출처
--
-- 공식 nowonsc.kr (노원구시설관리공단) — pool_schedule_source_priority 1차.
-- - /fmcs/379 이용안내 (일일 자유수영 표·요금)
-- - /fmcs/378 시설안내, /fmcs/382 오시는길 (주소)
-- 운영자 안내 블로그(narara_nabi)는 시간표 출처로 미사용(정책).
--
-- - 일일 자유수영 (공식 표 그대로 — 회차 구분 없는 '연속 시간대' 표기):
--   · 평일(월~금) 1부 06:00~13:50, 2부 15:00~21:50
--   · 토 1부 09:00~11:50, 2부 13:00~16:50
--   · 일요일·공휴일 휴관
--   공식 페이지에 50분 회차 분할이 없어 연속 시간대 그대로 슬롯화(운영자 확인).
-- - 요금(성인): 평일 4,800 / 토 6,240
--   (청소년 3,300/4,290, 초등 2,400/3,120 — 스키마는 성인 기준만 보관)
--
-- ## 데이터 모델링
--
-- - by_day = 월~금 2슬롯(연속 시간대) + 토 2슬롯. 일요일 키 미포함.
-- - 시즌 분기 없음 → slot_groups 미사용.
-- - day_notes는 슬롯 1개+ 요일일 때만 → 미사용.
--
-- ## 메타데이터 출처
--
-- - 주소: (01648) 서울특별시 노원구 덕릉로 748. 공식 /fmcs/378·/fmcs/382.
-- - 전화: 02-2289-6770 (대표). 문의 02-2289-6781~2.
-- - 시설: 25m × 4레인, 수심 1.2m, 유아풀(경사 워킹풀) 보유.
--   ⚠️ 신축(2023)이라 공식·서울시 포털 모두 규격 미등록 → 운영자 제공
--   블로그(narara_nabi, 2차·신뢰도 낮음)에서 레인/수심/길이 참고. 운영자 확인.
--   depth_min/max = 1.2 단일값.
-- - 좌표 [신뢰도 높음]: 카카오 POI "상계구민체육센터"(상계동 95-356)와
--   도로명 주소(덕릉로 748)가 ~4m 이내 일치.
-- - 사진 없음 → photo_url 미설정(pool_photo_workflow로 추후 추가).

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend,
  schedule_source_url
) values
  ('POOL_0029', '상계구민체육센터', '서울', '노원구',
    '서울특별시 노원구 덕릉로 748',
    37.6642519982078, 127.076866062014, 'indoor', 'public',
    '02-2289-6770', 'https://www.nowonsc.kr/fmcs/378',
    4, 25, 1.2, 1.2,
    '{}', true, false, false,
    true, true,
    4800, 4800, 6240,
    'https://www.nowonsc.kr/fmcs/379')
on conflict (id) do nothing;

-- 자유수영 시간표 (공식 이용안내 표 그대로 — 연속 시간대).
-- hours: 7h50m=7.83, 6h50m=6.83, 2h50m=2.83, 3h50m=3.83.
insert into public.schedules (pool_id, author_nickname, by_day, updated_at) values
  ('POOL_0029', '풀스데이', $${
    "월": [
      {"start":"06:00","end":"13:50","hours":7.83},
      {"start":"15:00","end":"21:50","hours":6.83}
    ],
    "화": [
      {"start":"06:00","end":"13:50","hours":7.83},
      {"start":"15:00","end":"21:50","hours":6.83}
    ],
    "수": [
      {"start":"06:00","end":"13:50","hours":7.83},
      {"start":"15:00","end":"21:50","hours":6.83}
    ],
    "목": [
      {"start":"06:00","end":"13:50","hours":7.83},
      {"start":"15:00","end":"21:50","hours":6.83}
    ],
    "금": [
      {"start":"06:00","end":"13:50","hours":7.83},
      {"start":"15:00","end":"21:50","hours":6.83}
    ],
    "토": [
      {"start":"09:00","end":"11:50","hours":2.83},
      {"start":"13:00","end":"16:50","hours":3.83}
    ]
  }$$::jsonb, '2026-06-03'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_0029'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0029');
