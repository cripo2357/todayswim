-- Pool's day — Phase 2: 수영장 1곳 추가: 양천구민체육센터 (POOL_0019).
--
-- ## 시간표 출처
--
-- 공식 사이트 ycs.or.kr (양천구시설관리공단) — pool_schedule_source_priority 1차 출처.
-- - /fmcs/17 (시설안내): 위치/풀 제원
-- - /fmcs/19 (프로그램안내): 자유수영 일일입장 시간/요금
-- WebFetch가 SSL 체인 오류 → curl -k 로 취득 (KBS 케이스와 동일, 0036 참고).
--
-- - 자유수영 일일입장 (공식 /fmcs/19 그대로):
--   · 월~금 2부 16:00~16:50 (45명)
--   · 월~금 3부 17:00~17:50 (45명) ※ 17:00~17:40 식사시간
--   · 월~금 4부 18:00~18:50 (60명)
--   · 토 2부 17:00~17:50 (100명)
--   · 토 3부 18:00~18:50 (100명)
-- - 1부 13:00~13:50 화·목·토는 "수영불가/유아풀" 명시(수중걷기 전용) →
--   운영자(크리스) 컨펌으로 자유수영 시간표 제외(일반 자유수영 사용자 혼동 방지).
-- - 일요일: 자유수영 안내 없음 → 미운영.
-- - 요금: 성인 3,500원 / 청소년 2,200원 / 어린이 1,800원 (평일·주말 동일).
--
-- ## 데이터 모델링
--
-- - by_day = 월~금 3슬롯(16/17/18) + 토 2슬롯(17/18). 일요일 키 미포함.
-- - 시즌 분기 없음 → slot_groups 미사용.
-- - 비고("매월 마지막주 금요일 18시 환경정비/자유수영 미운영", "17:00-17:40 식사시간",
--   "토 17·18시 1레인 핀전용", "13시 수중걷기")는 슬롯별 표현 불가 →
--   schedule_source_url(공식 /fmcs/19)로 우회. day_notes 미사용
--   (day_note_constraint: 슬롯 1개+ 요일일 때만).
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

-- 자유수영 시간표 (공식 /fmcs/19 그대로, 13시 수중걷기 슬롯 제외).
-- hours = 50분 = 0.83.
insert into public.schedules (pool_id, author_nickname, by_day, updated_at) values
  ('POOL_0019', '풀스데이', $${
    "월": [
      {"start":"16:00","end":"16:50","hours":0.83},
      {"start":"17:00","end":"17:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83}
    ],
    "화": [
      {"start":"16:00","end":"16:50","hours":0.83},
      {"start":"17:00","end":"17:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83}
    ],
    "수": [
      {"start":"16:00","end":"16:50","hours":0.83},
      {"start":"17:00","end":"17:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83}
    ],
    "목": [
      {"start":"16:00","end":"16:50","hours":0.83},
      {"start":"17:00","end":"17:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83}
    ],
    "금": [
      {"start":"16:00","end":"16:50","hours":0.83},
      {"start":"17:00","end":"17:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83}
    ],
    "토": [
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
