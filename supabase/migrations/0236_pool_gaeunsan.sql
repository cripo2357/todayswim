-- Pool's day — 성북구 배치: 개운산스포츠센터(맑은물수영장) 추가 (POOL_0117).
--
-- ## 시간표 출처 [1차 — 운영자 공식 안내문]
--
-- 크리스가 개운산스포츠센터 '평일 및 주말 자유수영 안내' 공식 표 캡처 제공
-- (레인수·요일·요금 포함). 첨벙 미사용.
--
-- - 자유수영(50분/주말 1시간50분 회차) — 정규 슬롯만 표기:
--   · 평일(월~금): 08:00–08:50, 12:00–12:50, 21:00–21:50
--   · 토         : 09:00–10:50, 16:00–17:50
--   · 공휴일     : 10:00–11:50, 13:00–14:50, 16:00–17:50 (by_day 미표기)
--   · 일요일     : 매주 정기휴관.
--   ※ 단기운영 슬롯(평일 16:00, 토 06:00)은 "정규프로그램 개설 시 폐강 가능"이라 제외.
-- - 가격: 평일 성인 4,500 / 토·공휴일 5,500. 월 이용(평일) 성인 57,000 → price_monthly.
-- - 유의: 평일 자유수영 중학생~성인은 자유형 25m 이상 가능자만. 킥판·보조기구 금지.
--   평일 08·21시는 유아풀 미개방.
--
-- ## 메타데이터 출처
-- - 성인풀 25m×11m 5레인 수심 1.3m + 어린이풀 11m×6m 수심 0.7m → has_kids_pool=true.
--   (크리스 제공 공식 시설 정보)
-- - 좌표 [신뢰도 높음]: 카카오 POI "개운산스포츠센터 수영장"(종암동 54-182).
-- - 전화: 02-925-9960. 북악산로 949-60.
--
-- 사진: pool-photos/POOL_0117.jpg 미확보 → photo_url null.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_weekday, price_per_sat, price_monthly, photo_url,
  schedule_source_url
) values
  ('POOL_0117', '개운산스포츠센터', '서울', '성북구',
    '서울특별시 성북구 북악산로 949-60',
    37.5967632157419, 127.026320553466, 'indoor', 'public',
    '02-925-9960', 'https://www.gongdan.go.kr/',
    5, 25, 1.3, 1.3,
    '{}', true, false, false,
    true, true,
    4500, 5500, 57000, null,
    'https://www.gongdan.go.kr/')
on conflict (id) do nothing;

-- 자유수영 시간표. 평일 50분=0.83, 토 1시간50분=1.83. 일요일 정기휴관. 단기운영 슬롯 제외.
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0117', '풀스데이', $${
    "월": [
      {"start":"08:00","end":"08:50","hours":0.83},
      {"start":"12:00","end":"12:50","hours":0.83},
      {"start":"21:00","end":"21:50","hours":0.83}
    ],
    "화": [
      {"start":"08:00","end":"08:50","hours":0.83},
      {"start":"12:00","end":"12:50","hours":0.83},
      {"start":"21:00","end":"21:50","hours":0.83}
    ],
    "수": [
      {"start":"08:00","end":"08:50","hours":0.83},
      {"start":"12:00","end":"12:50","hours":0.83},
      {"start":"21:00","end":"21:50","hours":0.83}
    ],
    "목": [
      {"start":"08:00","end":"08:50","hours":0.83},
      {"start":"12:00","end":"12:50","hours":0.83},
      {"start":"21:00","end":"21:50","hours":0.83}
    ],
    "금": [
      {"start":"08:00","end":"08:50","hours":0.83},
      {"start":"12:00","end":"12:50","hours":0.83},
      {"start":"21:00","end":"21:50","hours":0.83}
    ],
    "토": [
      {"start":"09:00","end":"10:50","hours":1.83},
      {"start":"16:00","end":"17:50","hours":1.83}
    ]
  }$$::jsonb, $${
    "월":"중학생~성인은 자유형 25m 이상 가능자만 이용할 수 있습니다. 킥판·보조기구 사용 금지.",
    "화":"중학생~성인은 자유형 25m 이상 가능자만 이용할 수 있습니다. 킥판·보조기구 사용 금지.",
    "수":"중학생~성인은 자유형 25m 이상 가능자만 이용할 수 있습니다. 킥판·보조기구 사용 금지.",
    "목":"중학생~성인은 자유형 25m 이상 가능자만 이용할 수 있습니다. 킥판·보조기구 사용 금지.",
    "금":"중학생~성인은 자유형 25m 이상 가능자만 이용할 수 있습니다. 킥판·보조기구 사용 금지.",
    "토":"킥판·보조기구는 사용할 수 없습니다."
  }$$::jsonb, '2026-06-07'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_0117'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0117');
