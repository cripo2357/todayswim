-- Pool's day — Phase 2: 수영장 1곳 추가: 마곡레포츠센터 (POOL_0026).
--
-- ## 시간표 출처
--
-- 공식 sport.gssi.or.kr (강서구시설관리공단) — pool_schedule_source_priority 1차.
-- - /page/prgGuide/05/ 일일자유이용 탭
-- - /page/sisul/05/ 시설안내
-- SSL 체인 오류 → curl -k. 운영자 안내 블로그(delight22_)는 정책상 미사용.
--
-- - 일일 자유이용 / 일일 수영 (공식 그대로):
--   · 월~금: 08:00~08:50, 14:00~14:50, 18:00~18:50
--   · 토   : 07:00~08:50, 10:00~11:50, 13:00~14:50 (각 1h50m)
--   · 일   : 정기 휴관
-- - 요금: 평일 성인 3,500 / 청소년 2,500 / 어린이 2,000
--         토   성인 7,000 / 청소년 5,000 / 어린이 4,000
-- - 비고: 자유수영 80명 입장 제한 (토 2부 50명). 월~금 1시간 / 주말 2시간 기준.
--   슬롯 모델 표현 불가 → schedule_source_url 우회.
--
-- ## 데이터 모델링
--
-- - by_day = 월~금 3슬롯 + 토 3슬롯(1h50m). 일요일 키 미포함(정기 휴관).
-- - 시즌 분기 없음 → slot_groups 미사용.
-- - day_notes는 슬롯 1개+ 요일일 때만 사용 → 미사용.
--
-- ## 메타데이터 출처
--
-- - 시설: 성인풀 25m × 6레인 수심 1.0~1.2m, 유아풀 수심 0.55m. 공식 /sisul/05/.
-- - 주소: 서울특별시 강서구 양천로 251 (공식 도로명).
-- - 좌표 [신뢰도 높음]: 카카오 POI "마곡레포츠센터 수영장" 정확 매치
--   (강서구 마곡동 56-22).
-- - 전화: 02-3663-7171 (공식 상담).

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0026', '마곡레포츠센터', '서울', '강서구',
    '서울특별시 강서구 양천로 251',
    37.5731994265113, 126.832183004243, 'indoor', 'public',
    '02-3663-7171', 'https://sport.gssi.or.kr/page/sisul/05/',
    6, 25, 1.0, 1.2,
    '{}', true, false, false,
    true, true,
    3500, 3500, 7000,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0026.jpg',
    'https://sport.gssi.or.kr/page/prgGuide/05/')
on conflict (id) do nothing;

-- 자유수영 시간표 (공식 일일자유이용 탭 그대로).
-- hours: 50분=0.83, 1h50m=1.83.
insert into public.schedules (pool_id, author_nickname, by_day, updated_at) values
  ('POOL_0026', '풀스데이', $${
    "월": [
      {"start":"08:00","end":"08:50","hours":0.83},
      {"start":"14:00","end":"14:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83}
    ],
    "화": [
      {"start":"08:00","end":"08:50","hours":0.83},
      {"start":"14:00","end":"14:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83}
    ],
    "수": [
      {"start":"08:00","end":"08:50","hours":0.83},
      {"start":"14:00","end":"14:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83}
    ],
    "목": [
      {"start":"08:00","end":"08:50","hours":0.83},
      {"start":"14:00","end":"14:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83}
    ],
    "금": [
      {"start":"08:00","end":"08:50","hours":0.83},
      {"start":"14:00","end":"14:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83}
    ],
    "토": [
      {"start":"07:00","end":"08:50","hours":1.83},
      {"start":"10:00","end":"11:50","hours":1.83},
      {"start":"13:00","end":"14:50","hours":1.83}
    ]
  }$$::jsonb, '2026-05-26'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_0026'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0026');
