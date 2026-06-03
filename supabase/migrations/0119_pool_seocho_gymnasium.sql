-- Pool's day — Phase 2: 수영장 1곳 추가: 서초종합체육관 (POOL_0035). 서초구 첫 풀.
--
-- ## 시간표·가격 출처
--
-- 공식 서초 공공체육시설(seocho.go.kr/sports/fmcs/90) 자유수영 안내 — 1차.
--
-- - 자유수영 시간표 (공식 표 그대로):
--   · 평일(월~금): 08:00~08:50, 12:00~13:50, 18:00~18:50, 20:50~21:40
--   · 토·일·공휴일: 09:30~11:30, 13:00~15:00, 15:30~17:30
--   · 공휴일은 by_day 요일 모델 외 → 일요일과 동일 시간이나 DB 미반영(주석으로만).
-- - 가격: 자유수영 1회 **비회원 성인 기준** 저장(일반 일일입장 기준). 평일 5,500.
--   토·일·공휴일은 "500~1,000원 추가" → weekend는 상한 적용 6,500 잠정(★정확액 추후 보강).
--   회원가(성인 4,000)·청소년·어린이 차등은 스키마 단일가라 미저장.
--
-- ## 메타데이터 / 미상
--
-- - 좌표 [신뢰도 높음]: 카카오 POI "서초종합체육관"(원지동 28) 정확 매치.
--   (fmcs 사이트 푸터 주소는 언남과 섞여 부정확 → POI 좌표 채택.)
-- - 전화: 02-2155-6216. ownership=public.
-- - 레인수·수심·유아풀: 공식 페이지 미기재 → NULL/false(임의생성 금지). 추후 보강.
-- - photo_url=NULL: 사진 미수령.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0035', '서초종합체육관', '서울', '서초구',
    '서울특별시 서초구 원지동 28',
    37.45895034286056, 127.04230629541324, 'indoor', 'public',
    '02-2155-6216', 'https://www.seocho.go.kr/sports/fmcs/90',
    null, null, null, null,
    '{}', false, false, false,
    true, true,
    5500, 5500, 6500, null,
    'https://www.seocho.go.kr/sports/fmcs/90')
on conflict (id) do nothing;

-- 자유수영 시간표 (공식 표 그대로).
-- hours = (종료 - 시작) 분/60. 50분=0.83, 1h50m=1.83, 2h00m=2.
insert into public.schedules (pool_id, author_nickname, by_day, updated_at) values
  ('POOL_0035', '풀스데이', $${
    "월": [
      {"start":"08:00","end":"08:50","hours":0.83},
      {"start":"12:00","end":"13:50","hours":1.83},
      {"start":"18:00","end":"18:50","hours":0.83},
      {"start":"20:50","end":"21:40","hours":0.83}
    ],
    "화": [
      {"start":"08:00","end":"08:50","hours":0.83},
      {"start":"12:00","end":"13:50","hours":1.83},
      {"start":"18:00","end":"18:50","hours":0.83},
      {"start":"20:50","end":"21:40","hours":0.83}
    ],
    "수": [
      {"start":"08:00","end":"08:50","hours":0.83},
      {"start":"12:00","end":"13:50","hours":1.83},
      {"start":"18:00","end":"18:50","hours":0.83},
      {"start":"20:50","end":"21:40","hours":0.83}
    ],
    "목": [
      {"start":"08:00","end":"08:50","hours":0.83},
      {"start":"12:00","end":"13:50","hours":1.83},
      {"start":"18:00","end":"18:50","hours":0.83},
      {"start":"20:50","end":"21:40","hours":0.83}
    ],
    "금": [
      {"start":"08:00","end":"08:50","hours":0.83},
      {"start":"12:00","end":"13:50","hours":1.83},
      {"start":"18:00","end":"18:50","hours":0.83},
      {"start":"20:50","end":"21:40","hours":0.83}
    ],
    "토": [
      {"start":"09:30","end":"11:30","hours":2},
      {"start":"13:00","end":"15:00","hours":2},
      {"start":"15:30","end":"17:30","hours":2}
    ],
    "일": [
      {"start":"09:30","end":"11:30","hours":2},
      {"start":"13:00","end":"15:00","hours":2},
      {"start":"15:30","end":"17:30","hours":2}
    ]
  }$$::jsonb, '2026-06-04'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_0035'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0035');
