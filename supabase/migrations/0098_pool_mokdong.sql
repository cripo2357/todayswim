-- Pool's day — Phase 2: 수영장 1곳 추가: 목동문화체육센터 (POOL_0021).
--
-- ## 시간표 출처
--
-- 공식 사이트 ycs.or.kr (양천구시설관리공단) — pool_schedule_source_priority 1차 출처.
-- - /fmcs/25 (시설안내): 위치/풀 제원
-- - /fmcs/27 (프로그램안내): 일일자유수영 시간/요금
-- WebFetch가 SSL 체인 오류 → curl -k 로 취득 (0036 KBS 패턴).
-- 운영자가 안내한 블로그(olbye)는 정책상 일체 미사용.
--
-- - 일일자유수영 (공식 /fmcs/27 그대로):
--   · 평일 1부 월~금 13:00~13:50 (20명)
--   · 평일 2부 월~금 16:00~16:50 (50명)
--   · 평일 3부 월~금 17:00~17:50 (50명)
--   · 토 1부      16:00~16:50 (50명)
--   · 토 2부      17:00~17:50 (50명)
--   · 토 3부      18:00~18:50
-- - 일요일: 시간표 없음 → 미운영.
-- - 요금: 성인 3,500원 / 청소년 2,200원 / 어린이 1,800원 (평일·주말 동일).
-- - 비고(풀 전체):
--   · 자유수영시 스노클, 오리발 사용 불가
--   · 유아/미취학아동·신장 130cm 이하 어린이는 동성 보호자 동반 필수
--   · (안내 시점) 6월 15~30일 수영장 공사 휴관 — 일시적 안내라 DB 미반영
--   슬롯 모델 표현 불가 → schedule_source_url 우회.
--
-- ## 데이터 모델링
--
-- - by_day = 월~금 3슬롯(13/16/17) + 토 3슬롯(16/17/18). 일요일 키 미포함.
-- - 시즌 분기 없음 → slot_groups 미사용.
-- - day_notes는 슬롯 1개+ 요일일 때만 사용(day_note_constraint) → 미사용.
--
-- ## 메타데이터 출처
--
-- - 시설(성인풀 25m×6레인 수심 1.2~1.5m, 어린이풀 수심 0.57m): 공식 /fmcs/25.
-- - 좌표 [신뢰도 높음]: 카카오 POI "목동문화체육센터 수영장" 정확 매치
--   (양천구 목동 946-1, 도로명 목동중앙본로 73).
-- - 전화: 02-2062-1862 (공식 /fmcs/25, 대표 1862~1864).

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0021', '목동문화체육센터', '서울', '양천구',
    '서울특별시 양천구 목동중앙본로 73',
    37.5429150109914, 126.86912563639, 'indoor', 'public',
    '02-2062-1862', 'https://www.ycs.or.kr/fmcs/25',
    6, 25, 1.2, 1.5,
    '{}', true, false, false,
    true, true,
    3500, 3500, 3500,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0021.jpg',
    'https://www.ycs.or.kr/fmcs/27')
on conflict (id) do nothing;

-- 자유수영 시간표 (공식 /fmcs/27 그대로).
-- hours = 50분 = 0.83.
insert into public.schedules (pool_id, author_nickname, by_day, updated_at) values
  ('POOL_0021', '풀스데이', $${
    "월": [
      {"start":"13:00","end":"13:50","hours":0.83},
      {"start":"16:00","end":"16:50","hours":0.83},
      {"start":"17:00","end":"17:50","hours":0.83}
    ],
    "화": [
      {"start":"13:00","end":"13:50","hours":0.83},
      {"start":"16:00","end":"16:50","hours":0.83},
      {"start":"17:00","end":"17:50","hours":0.83}
    ],
    "수": [
      {"start":"13:00","end":"13:50","hours":0.83},
      {"start":"16:00","end":"16:50","hours":0.83},
      {"start":"17:00","end":"17:50","hours":0.83}
    ],
    "목": [
      {"start":"13:00","end":"13:50","hours":0.83},
      {"start":"16:00","end":"16:50","hours":0.83},
      {"start":"17:00","end":"17:50","hours":0.83}
    ],
    "금": [
      {"start":"13:00","end":"13:50","hours":0.83},
      {"start":"16:00","end":"16:50","hours":0.83},
      {"start":"17:00","end":"17:50","hours":0.83}
    ],
    "토": [
      {"start":"16:00","end":"16:50","hours":0.83},
      {"start":"17:00","end":"17:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83}
    ]
  }$$::jsonb, '2026-05-26'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_0021'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0021');
