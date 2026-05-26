-- Pool's day — Phase 2: 수영장 1곳 추가: 신길종합사회복지관 (POOL_0016).
--
-- ## 시간표 출처
--
-- 운영자(크리스) 직접 제공: 신길종합사회복지관 26-06 생활체육프로그램표 PDF
-- — pool_schedule_source_priority 1차 출처. 2차(블로그·헬로우스윔 등) 일체 미사용.
--
-- - 월·수·금: 15:00-15:50, 16:00-16:50, 18:00-18:50
-- - 화·목  : 08:00-08:50, 13:00-13:50, 14:00-14:50, 15:00-15:50, 18:00-18:50, 21:00-21:50
-- - 토     : 06:00-08:50, 10:00-11:50, 13:00-14:50, 16:00-17:50
-- - 일     : 휴관 (키 미포함)
--
-- PDF 비고("평일 자유수영 유아풀 사용 불가", "부력 보조기구 사용 불가",
-- "평일 월,수,금 11:30~14:30 남자탈의실/샤워장 이용불가") 는 슬롯 단위가 아닌
-- 풀 전체 비고라 schedules.day_notes 미사용 (day_note_constraint: byDay 슬롯 1개일 때만).
--
-- ## 메타데이터 출처
--
-- - 시설(레인 6, 25m, 수심 1.1~1.2m): 운영자 확인.
-- - 유아풀 있음 (단 평일 자유수영 시간엔 사용 불가 — PDF 비고).
-- - 가격: PDF 그대로. 평일 성인 5,300원 / 토요일 성인 6,800원 (아동 별도).
-- - 평일 정기권 95,000원/월은 별도 모델(추가 필드 없어 미반영).
-- - 좌표 [신뢰도 높음]: 카카오 POI "신길종합사회복지관 수영장" 정확 매치
--   (영등포구 신길동 465-1, 도로명 영등포로84길 24-5).
-- - 전화: 02-2138-1277 (1F 접수처, PDF 명시).

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url
) values
  ('POOL_0016', '신길종합사회복지관', '서울', '영등포구',
    '서울특별시 영등포구 영등포로84길 24-5',
    37.5111632459002, 126.92143625805, 'indoor', 'public',
    '02-2138-1277',
    6, 25, 1.1, 1.2,
    '{}', true, false, false,
    true, true,
    5300, 5300, 6800,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0016.jpg')
on conflict (id) do nothing;

-- 자유수영 시간표 (PDF 그대로).
-- hours = (종료 - 시작) 분/60. 50분=0.83, 1h50m=1.83, 2h50m=2.83.
-- 일요일 휴관 → 키 미포함.
insert into public.schedules (pool_id, author_nickname, by_day, updated_at) values
  ('POOL_0016', '풀스데이', $${
    "월": [
      {"start":"15:00","end":"15:50","hours":0.83},
      {"start":"16:00","end":"16:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83}
    ],
    "화": [
      {"start":"08:00","end":"08:50","hours":0.83},
      {"start":"13:00","end":"13:50","hours":0.83},
      {"start":"14:00","end":"14:50","hours":0.83},
      {"start":"15:00","end":"15:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83},
      {"start":"21:00","end":"21:50","hours":0.83}
    ],
    "수": [
      {"start":"15:00","end":"15:50","hours":0.83},
      {"start":"16:00","end":"16:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83}
    ],
    "목": [
      {"start":"08:00","end":"08:50","hours":0.83},
      {"start":"13:00","end":"13:50","hours":0.83},
      {"start":"14:00","end":"14:50","hours":0.83},
      {"start":"15:00","end":"15:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83},
      {"start":"21:00","end":"21:50","hours":0.83}
    ],
    "금": [
      {"start":"15:00","end":"15:50","hours":0.83},
      {"start":"16:00","end":"16:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83}
    ],
    "토": [
      {"start":"06:00","end":"08:50","hours":2.83},
      {"start":"10:00","end":"11:50","hours":1.83},
      {"start":"13:00","end":"14:50","hours":1.83},
      {"start":"16:00","end":"17:50","hours":1.83}
    ]
  }$$::jsonb, '2026-05-26'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_0016'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0016');
