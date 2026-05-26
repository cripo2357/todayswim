-- Pool's day — Phase 2: 수영장 1곳 추가: 강서구민올림픽체육센터 (POOL_0025).
--
-- ## 시간표 출처
--
-- 공식 사이트 sport.gssi.or.kr (강서구시설관리공단) — pool_schedule_source_priority 1차.
-- - /page/prgGuide/01/ 일일입장 탭 (자유수영 시간/요금)
-- - /page/sisul/01/ 시설안내 (풀 제원)
-- SSL 체인 오류 → curl -k (KBS 패턴).
-- 운영자 안내 블로그(niceiupkmk)는 정책상 미사용.
--
-- - 일일입장 자유수영 (공식 그대로):
--   · 평일 1부 08:00~08:50 (월~금)
--   · 평일 2부 12:00~12:50 (월~금)
--   · 평일 3부 18:00~18:50 (월~금)
--   · 평일 4부 21:00~21:50 (월·수·금)
--   · 토 1부 07:00~08:50 (1h50m)
--   · 토 2부 09:50~11:40 (1h50m)
--   · 토 3부 13:00~14:50 (1h50m)
-- - 일요일: 자유수영 없음.
-- - 요금: 평일 성인 3,500원 / 청소년 2,700원 / 어린이 1,900원
--         토   성인 7,000원 / 청소년 5,000원 / 어린이 4,000원
-- - 비고: 토요일 자유수영 걷기레인 운영 안 함. 오리발/패들 사용 금지(월자유수영 안내).
--   슬롯 모델 표현 불가 → schedule_source_url 우회.
--
-- ## 데이터 모델링
--
-- - by_day = 월/수/금 4슬롯 + 화/목 3슬롯 + 토 3슬롯. 일요일 키 미포함.
-- - 시즌 분기 없음 → slot_groups 미사용.
-- - day_notes는 슬롯 1개+ 요일일 때만 사용 → 미사용.
--
-- ## 메타데이터 출처
--
-- - 시설: 성인풀 7레인 (수심 1,2,3레인 1.2~1.3m / 4,5,6,7레인 1.4~1.5m),
--   유아풀 수심 0.6m. 공식 /page/sisul/01/.
-- - 풀 길이: 공식 미명시 → null.
-- - depth_min/max = 성인풀 기준(1.2~1.5m).
-- - 좌표 [신뢰도 높음]: 카카오 POI "강서구민올림픽체육센터 수영장" 정확 매치
--   (강서구 등촌동 707-3, 도로명 화곡로65길 62).
-- - 전화: 02-2607-9113 (강서구시설관리공단 대표).

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0025', '강서구민올림픽체육센터', '서울', '강서구',
    '서울특별시 강서구 화곡로65길 62',
    37.5597020326672, 126.85059818871, 'indoor', 'public',
    '02-2607-9113', 'https://sport.gssi.or.kr/page/sisul/01/',
    7, null, 1.2, 1.5,
    '{}', true, false, false,
    true, true,
    3500, 3500, 7000,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0025.jpg',
    'https://sport.gssi.or.kr/page/prgGuide/01/')
on conflict (id) do nothing;

-- 자유수영 시간표 (공식 일일입장 탭 그대로).
-- hours: 50분=0.83, 1h50m=1.83.
insert into public.schedules (pool_id, author_nickname, by_day, updated_at) values
  ('POOL_0025', '풀스데이', $${
    "월": [
      {"start":"08:00","end":"08:50","hours":0.83},
      {"start":"12:00","end":"12:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83},
      {"start":"21:00","end":"21:50","hours":0.83}
    ],
    "화": [
      {"start":"08:00","end":"08:50","hours":0.83},
      {"start":"12:00","end":"12:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83}
    ],
    "수": [
      {"start":"08:00","end":"08:50","hours":0.83},
      {"start":"12:00","end":"12:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83},
      {"start":"21:00","end":"21:50","hours":0.83}
    ],
    "목": [
      {"start":"08:00","end":"08:50","hours":0.83},
      {"start":"12:00","end":"12:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83}
    ],
    "금": [
      {"start":"08:00","end":"08:50","hours":0.83},
      {"start":"12:00","end":"12:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83},
      {"start":"21:00","end":"21:50","hours":0.83}
    ],
    "토": [
      {"start":"07:00","end":"08:50","hours":1.83},
      {"start":"09:50","end":"11:40","hours":1.83},
      {"start":"13:00","end":"14:50","hours":1.83}
    ]
  }$$::jsonb, '2026-05-26'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_0025'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0025');
