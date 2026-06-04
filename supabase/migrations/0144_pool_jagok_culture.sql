-- Pool's day — Phase 2: 수영장 1곳 추가: 자곡동복합문화센터 (POOL_0048). 강남구 자곡동(공공).
--
-- ## 시간표·가격 출처
--
-- 현장 안내판 사진(운영자 제공) + 공식 — 1차. 일일 자유수영 = 월~금, "자유수영 3~6 선택".
--
-- - 자유수영 시간표 (일일입장 가능 시간대):
--   · 월~금: 자유수영3 09:30~10:20, 자유수영4 10:30~11:20, 자유수영6 17:00~17:50.
--   · ★자유수영5 시간대는 안내판 캡처가 잘려 미확인 → 누락. 추후 보강(운영자 확인).
--   · 토·일: 정기 휴관.
-- - 가격: 일일 자유수영 5,000원/회.
--
-- ## 메타데이터
--
-- - 좌표 [신뢰도 높음]: 카카오 "서울 강남구 자곡로 100" ROAD_ADDR 정확 매치(2022년 개관, 지하1층 수영장).
-- - 전화: 02-6712-0580. ownership=public. 레인·수심 미상 → NULL. photo_url=NULL.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0048', '자곡동복합문화센터', '서울', '강남구',
    '서울특별시 강남구 자곡로 100',
    37.4714960885035, 127.094495808084, 'indoor', 'public',
    '02-6712-0580', 'https://life.gangnam.go.kr/fmcs/301',
    null, null, null, null,
    '{}', false, false, false,
    true, true,
    5000, 5000, null, null,
    'https://life.gangnam.go.kr/fmcs/301')
on conflict (id) do nothing;

-- 자유수영 시간표(월~금, 자유수영3·4·6 시간대. 5번은 캡처 잘림으로 누락). 각 50분=0.83.
insert into public.schedules (pool_id, author_nickname, by_day, updated_at) values
  ('POOL_0048', '풀스데이', $${
    "월": [
      {"start":"09:30","end":"10:20","hours":0.83},
      {"start":"10:30","end":"11:20","hours":0.83},
      {"start":"17:00","end":"17:50","hours":0.83}
    ],
    "화": [
      {"start":"09:30","end":"10:20","hours":0.83},
      {"start":"10:30","end":"11:20","hours":0.83},
      {"start":"17:00","end":"17:50","hours":0.83}
    ],
    "수": [
      {"start":"09:30","end":"10:20","hours":0.83},
      {"start":"10:30","end":"11:20","hours":0.83},
      {"start":"17:00","end":"17:50","hours":0.83}
    ],
    "목": [
      {"start":"09:30","end":"10:20","hours":0.83},
      {"start":"10:30","end":"11:20","hours":0.83},
      {"start":"17:00","end":"17:50","hours":0.83}
    ],
    "금": [
      {"start":"09:30","end":"10:20","hours":0.83},
      {"start":"10:30","end":"11:20","hours":0.83},
      {"start":"17:00","end":"17:50","hours":0.83}
    ]
  }$$::jsonb, '2026-06-04'::timestamptz)
on conflict (pool_id) do nothing;

update public.pools
set has_schedule = true
where id = 'POOL_0048'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0048');
