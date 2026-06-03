-- Pool's day — Phase 2: 수영장 1곳 추가: 언남문화체육센터 (POOL_0036). 서초구 양재동.
--
-- ## 시간표·가격 출처
--
-- 공식 서초 공공체육시설(seocho.go.kr/sports/fmcs/163) 자유수영 안내 — 1차.
--
-- - 자유수영 시간표 (공식 표 그대로):
--   · 평일(월~금): 12:00~13:50, 18:00~18:50
--   · 토요일: 10:00~12:30, 14:00~17:50
--   · 일요일: 휴장 → 키 미포함
--   · 단서: "토요일 자유수영은 등록 프로그램 시간에만 이용 가능" 안내가 있었음 —
--     요금표에 비회원가가 있어 일단 비회원 일일입장 가능으로 등록. ★토요일 비회원 가부 추후 확인.
-- - 가격: 1회 **비회원 성인 6,000 / 어린이 5,000** 저장(일반 일일입장 기준).
--   수강회원가(성인 3,500)는 미저장.
--
-- ## 메타데이터 / 미상
--
-- - 좌표 [신뢰도 높음]: 카카오 "서울 서초구 동산로13길 35" ROAD_ADDR 정확 매치
--   (양재동, 언남중고 공공복합시설 지하1층).
-- - 유아풀 있음(수심 50cm) → has_kids_pool=true. 성인풀 레인·수심은 미상 → NULL.
-- - 전화: 공식 푸터가 서초종합체육관과 공통이라 불확실 → NULL. ownership=public(공공복합시설).
-- - photo_url=NULL: 사진 미수령.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0036', '언남문화체육센터', '서울', '서초구',
    '서울특별시 서초구 동산로13길 35',
    37.4723300184587, 127.043005236379, 'indoor', 'public',
    null, 'https://www.seocho.go.kr/sports/fmcs/163',
    null, null, null, null,
    '{}', true, false, false,
    true, true,
    6000, 6000, 6000,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0036.jpg',
    'https://www.seocho.go.kr/sports/fmcs/163')
on conflict (id) do nothing;

-- 자유수영 시간표 (공식 표 그대로). 일요일 휴장.
-- hours = (종료 - 시작) 분/60. 1h50m=1.83, 50분=0.83, 2h30m=2.5, 3h50m=3.83.
insert into public.schedules (pool_id, author_nickname, by_day, updated_at) values
  ('POOL_0036', '풀스데이', $${
    "월": [
      {"start":"12:00","end":"13:50","hours":1.83},
      {"start":"18:00","end":"18:50","hours":0.83}
    ],
    "화": [
      {"start":"12:00","end":"13:50","hours":1.83},
      {"start":"18:00","end":"18:50","hours":0.83}
    ],
    "수": [
      {"start":"12:00","end":"13:50","hours":1.83},
      {"start":"18:00","end":"18:50","hours":0.83}
    ],
    "목": [
      {"start":"12:00","end":"13:50","hours":1.83},
      {"start":"18:00","end":"18:50","hours":0.83}
    ],
    "금": [
      {"start":"12:00","end":"13:50","hours":1.83},
      {"start":"18:00","end":"18:50","hours":0.83}
    ],
    "토": [
      {"start":"10:00","end":"12:30","hours":2.5},
      {"start":"14:00","end":"17:50","hours":3.83}
    ]
  }$$::jsonb, '2026-06-04'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_0036'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0036');
