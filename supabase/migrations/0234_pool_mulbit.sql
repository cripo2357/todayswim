-- Pool's day — 성북구 배치: 물빛수영장 추가 (POOL_0115).
--
-- ## 시간표 출처 [1차 — 운영자 공식 안내문]
--
-- 크리스가 성북구도시관리공단 물빛수영장 '자유수영(평일/토요일/공휴일)' 공식 표 + 시설안내
-- 캡처 제공. 공식 SPA라 정적 fetch 불가 → 캡처가 1차.
--
-- - 자유수영:
--   · 평일 오전(월~금): 08:00–08:50 (일일입장 가능, 성인 5,000)
--   · 평일 오후(월~금): 18:00–18:50 → 월 등록 회원 전용, 일일입장 불가 → by_day 제외(day_note 안내)
--   · 토 1부 06:00–07:50, 2부 09:00–10:50, 3부 13:00–14:50, 4부 16:00–17:50 (성인 5,700)
--   · 공휴일: 10:00/13:00/16:00 별도(by_day 미표기). 일요일 정규 미운영.
-- - 가격: 평일 일일 성인 5,000 / 토 성인 5,700. 월 등록(오전) 성인 74,000 → price_monthly.
-- - 유의: 정원제 선착순, 도구(킥판·헬퍼) 금지, 중간입장 불가, 유아 입장 시 보호자 동반.
--
-- ## 메타데이터 출처 [공식 시설안내]
-- - 성인풀 25m×15m 6레인 수심 1.2~1.4m + 어린이풀 10m×4m 수심 0.75~0.8m
--   + 유아풀 3m×4m 수심 0.6m → has_kids_pool=true.
-- - 좌표 [신뢰도 높음]: 카카오 POI "물빛수영장"(길음동 1286-8, 성북미디어문화마루 지하1층).
-- - 전화: 02-2241-0151.
--
-- 사진: pool-photos/POOL_0115.jpg 미확보 → photo_url null.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_weekday, price_per_sat, price_monthly, photo_url,
  schedule_source_url
) values
  ('POOL_0115', '물빛수영장', '서울', '성북구',
    '서울특별시 성북구 길음로7길 20',
    37.603755750079, 127.022205374179, 'indoor', 'public',
    '02-2241-0151', 'https://www.gongdan.go.kr/',
    6, 25, 1.2, 1.4,
    '{}', true, false, false,
    true, true,
    5000, 5700, 74000, null,
    'https://www.gongdan.go.kr/portal/main/contents.do?menuNo=400614')
on conflict (id) do nothing;

-- 자유수영 시간표. 평일 50분=0.83, 토 1시간50분=1.83. 평일 18시는 월등록 전용이라 제외.
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0115', '풀스데이', $${
    "월": [{"start":"08:00","end":"08:50","hours":0.83}],
    "화": [{"start":"08:00","end":"08:50","hours":0.83}],
    "수": [{"start":"08:00","end":"08:50","hours":0.83}],
    "목": [{"start":"08:00","end":"08:50","hours":0.83}],
    "금": [{"start":"08:00","end":"08:50","hours":0.83}],
    "토": [
      {"start":"06:00","end":"07:50","hours":1.83},
      {"start":"09:00","end":"10:50","hours":1.83},
      {"start":"13:00","end":"14:50","hours":1.83},
      {"start":"16:00","end":"17:50","hours":1.83}
    ]
  }$$::jsonb, $${
    "월":"오후 18시 자유수영은 월 등록 회원 전용입니다(일일입장 불가).",
    "화":"오후 18시 자유수영은 월 등록 회원 전용입니다(일일입장 불가).",
    "수":"오후 18시 자유수영은 월 등록 회원 전용입니다(일일입장 불가).",
    "목":"오후 18시 자유수영은 월 등록 회원 전용입니다(일일입장 불가).",
    "금":"오후 18시 자유수영은 월 등록 회원 전용입니다(일일입장 불가).",
    "토":"회차 중간 입장은 불가하며, 킥판·헬퍼 등 도구를 사용할 수 없습니다."
  }$$::jsonb, '2026-06-07'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_0115'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0115');
