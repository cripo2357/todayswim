-- Pool's day — Phase 2: 수영장 1곳 추가: 공항동문화체육센터 (POOL_0027).
--
-- ## 시간표 출처
--
-- 공식 sport.gssi.or.kr (강서구시설관리공단) — pool_schedule_source_priority 1차.
-- - /page/prgGuide/07/ 자유수영 탭 (일일 자유수영 표)
-- - /page/sisul/07/ 시설안내
-- SSL 체인 오류 → curl -k. 운영자 안내 블로그(letter918)는 정책상 미사용.
--
-- - 일일 자유수영 (공식 표 그대로):
--   · 월~금 2부 15:00~15:50, 4부 18:00~18:50, 5부 21:00~21:50
--   · 월·수·금 추가 3부 16:00~16:50
--   · 토 1부 09:00~11:50 (2h50m), 2부 13:00~15:50 (2h50m)
--   · 일 정기 휴무
-- - 요금: 평일 성인 3,500 / 청소년 2,400 / 어린이 1,900
--         토   성인 5,500 / 청소년 4,400 / 어린이 3,500
-- - 비고: 평일 1시간 / 주말 2시간 이용시간 / 훈련용품(오리발·패들) 제한.
--   임시 안내(2025-03-19~별도공지 시까지 1·2부 일일입장 불가) — 일시적이라 DB 미반영.
--   슬롯 모델 표현 불가 비고는 schedule_source_url 우회.
--
-- ## 데이터 모델링
--
-- - by_day = 월/수/금 4슬롯(15/16/18/21) + 화/목 3슬롯(15/18/21) + 토 2슬롯(2h50m).
--   일요일 키 미포함(정기 휴무).
-- - 시즌 분기 없음 → slot_groups 미사용.
-- - day_notes는 슬롯 1개+ 요일일 때만 사용 → 미사용.
--
-- ## 메타데이터 출처
--
-- - 시설: 성인풀 25m × 5레인 수심 1.1~1.3m, 재활풀 25m × 1레인 수심 0.8m,
--   유아풀 수심 0.55m. 공식 /sisul/07/.
-- - depth_min/max = 성인풀 기준.
-- - 좌표 [신뢰도 높음]: 카카오 POI "공항동문화체육센터" 정확 매치
--   (강서구 공항동 60-28).
-- - 주소·전화: 공식 /sisul/07/.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0027', '공항동문화체육센터', '서울', '강서구',
    '서울특별시 강서구 송정로 45',
    37.55878489744033, 126.80991695639655, 'indoor', 'public',
    '02-2666-9003', 'https://sport.gssi.or.kr/page/sisul/07/',
    5, 25, 1.1, 1.3,
    '{}', true, false, false,
    true, true,
    3500, 3500, 5500,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0027.jpg',
    'https://sport.gssi.or.kr/page/prgGuide/07/')
on conflict (id) do nothing;

-- 자유수영 시간표 (공식 자유수영 탭 그대로).
-- hours: 50분=0.83, 2h50m=2.83.
insert into public.schedules (pool_id, author_nickname, by_day, updated_at) values
  ('POOL_0027', '풀스데이', $${
    "월": [
      {"start":"15:00","end":"15:50","hours":0.83},
      {"start":"16:00","end":"16:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83},
      {"start":"21:00","end":"21:50","hours":0.83}
    ],
    "화": [
      {"start":"15:00","end":"15:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83},
      {"start":"21:00","end":"21:50","hours":0.83}
    ],
    "수": [
      {"start":"15:00","end":"15:50","hours":0.83},
      {"start":"16:00","end":"16:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83},
      {"start":"21:00","end":"21:50","hours":0.83}
    ],
    "목": [
      {"start":"15:00","end":"15:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83},
      {"start":"21:00","end":"21:50","hours":0.83}
    ],
    "금": [
      {"start":"15:00","end":"15:50","hours":0.83},
      {"start":"16:00","end":"16:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83},
      {"start":"21:00","end":"21:50","hours":0.83}
    ],
    "토": [
      {"start":"09:00","end":"11:50","hours":2.83},
      {"start":"13:00","end":"15:50","hours":2.83}
    ]
  }$$::jsonb, '2026-05-26'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_0027'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0027');
