-- Pool's day — Phase 2: 수영장 1곳 추가: 양천구민체육센터 (POOL_0019).
--
-- ## 시간표 출처
--
-- 운영자(크리스) 제공 "일일입장(자유수영) 프로그램" 공식 표 캡쳐
-- — pool_schedule_source_priority 1차 정본. (양천구시설관리공단 ycs.or.kr 정본 표)
-- 보조(시설/위치/연락처): /fmcs/17 시설안내. (자유수영 시간은 운영자 표 우선)
--
-- - 자유수영A: 월~토 13:00~13:50 (성인풀 60명 / 유아풀 20명)
-- - 자유수영B: 토   16:00~16:50
-- - 자유수영C: 토   17:00~17:50
-- - 자유수영D: 월~토 18:00~18:50
-- - 일요일: 시간표 없음 → 미운영.
-- - 요금: 성인 3,500원 / 청소년 2,200원 / 어린이 1,800원 (평일·주말 동일).
-- - 비고(풀 전체):
--   · 매시간 자유수영 시 오리발 사용불가
--   · 18시 슬롯은 18:10까지 접수 가능
--   · 매월 셋째주 수요일 휴장
--   슬롯 모델로 표현 불가 → schedule_source_url 우회.
--
-- ## 데이터 모델링
--
-- - by_day = 월~금 2슬롯(13/18) + 토 4슬롯(13/16/17/18). 일요일 키 미포함.
-- - 시즌 분기 없음 → slot_groups 미사용.
-- - day_notes는 슬롯 1개+ 요일일 때만 사용(day_note_constraint) → 미사용.
--
-- ## 메타데이터 출처
--
-- - 시설(성인풀 25m×7레인, 유아풀 13m×3레인): 공식 /fmcs/17.
-- - 수심(성인풀 1.3~1.6m, 유아풀 0.9m): 공식 /fmcs/19. depth_min/max=성인풀 기준.
-- - 좌표 [신뢰도 높음]: 카카오 POI "양천구민체육센터" 정확 매치
--   (양천구 신정동 322-10, 도로명 목동동로 87).
-- - 전화: 02-2652-1792 (공식 /fmcs/17).
--
-- 사진: pool-photos/POOL_0019.jpg 업로드 대기.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0019', '양천구민체육센터', '서울', '양천구',
    '서울특별시 양천구 목동동로 87',
    37.5163300770486, 126.864335314868, 'indoor', 'public',
    '02-2652-1792', 'https://www.ycs.or.kr/fmcs/17',
    7, 25, 1.3, 1.6,
    '{}', true, false, false,
    true, true,
    3500, 3500, 3500,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0019.jpg',
    'https://www.ycs.or.kr/fmcs/19')
on conflict (id) do nothing;

-- 자유수영 시간표 (운영자 제공 정본 표 그대로).
-- hours = 50분 = 0.83.
insert into public.schedules (pool_id, author_nickname, by_day, updated_at) values
  ('POOL_0019', '풀스데이', $${
    "월": [
      {"start":"13:00","end":"13:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83}
    ],
    "화": [
      {"start":"13:00","end":"13:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83}
    ],
    "수": [
      {"start":"13:00","end":"13:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83}
    ],
    "목": [
      {"start":"13:00","end":"13:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83}
    ],
    "금": [
      {"start":"13:00","end":"13:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83}
    ],
    "토": [
      {"start":"13:00","end":"13:50","hours":0.83},
      {"start":"16:00","end":"16:50","hours":0.83},
      {"start":"17:00","end":"17:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83}
    ]
  }$$::jsonb, '2026-05-26'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_0019'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0019');
