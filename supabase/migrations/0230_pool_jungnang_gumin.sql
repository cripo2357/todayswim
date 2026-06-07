-- Pool's day — 중랑구 배치 시작: 중랑구민체육센터 수영장 추가 (POOL_0111).
--
-- ## 시간표 출처 [1차 — 운영자 공식]
--
-- 크리스가 공식 홈페이지(jungnangimc.or.kr) '이용안내 → 자유이용' 표를 직접 제공(캡처).
-- 공식이 SPA라 정적 fetch 불가 → 캡처가 1차 출처. 2차(첨벙/25m/swimmingis)는 일요일
-- 시간을 2시간 블록으로 잘못 적었으나, 공식은 50분 6부임을 확인해 정정.
--
-- - 자유수영(회차당 50분, 정원 선착순):
--   · 평일(월·수·금): 18:00–18:50 (1~2레인, 정원 30명). 화·목 미운영.
--   · 토         : 15:00–15:50, 16:00–16:50, 17:00–17:50, 18:00–18:50, 19:00–19:50 (5부)
--   · 일(2·4주만): 09:30–10:20, 10:30–11:20, 11:30–12:20, 13:30–14:20, 14:30–15:20,
--                  15:30–16:20 (6부, 12:20~13:30 휴장, 정원 90명) → weeks:[2,4]로 구조화.
--   · 일요일 1·3·5주는 정기휴무.
-- - 가격: 평일 성인 4,100 / 주말(토·일) 성인 5,400.
-- - 평일 유의: 자유형 이상만, 개인킥판·오리발·헬퍼·풀부이 사용금지 → day_note.
--
-- ## 메타데이터 출처
-- - 6레인 × 25m, 수심 1.2~1.4m, 유아풀 보유(일요일 유의 "어린이는 유아풀/성인6레인만"):
--   첨벙(cbswim) + 공식 유의사항. → has_kids_pool=true.
-- - 좌표 [신뢰도 높음]: 카카오 POI "중랑구민체육센터 수영장"(묵동 22-1).
-- - 전화: 02-3423-1070.
--
-- 사진: pool-photos/POOL_0111.jpg 미확보 → photo_url null.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0111', '중랑구민체육센터', '서울', '중랑구',
    '서울특별시 중랑구 신내로15길 189',
    37.6152113238518, 127.087349090737, 'indoor', 'public',
    '02-3423-1070', 'https://www.jungnangimc.or.kr/',
    6, 25, 1.2, 1.4,
    '{}', true, false, false,
    true, true,
    4100, 5400, null,
    'https://www.jungnangimc.or.kr/html/01010300')
on conflict (id) do nothing;

-- 자유수영 시간표. 50분=0.83. 일요일은 매월 2·4주만 운영(weeks:[2,4]).
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0111', '풀스데이', $${
    "월": [{"start":"18:00","end":"18:50","hours":0.83}],
    "수": [{"start":"18:00","end":"18:50","hours":0.83}],
    "금": [{"start":"18:00","end":"18:50","hours":0.83}],
    "토": [
      {"start":"15:00","end":"15:50","hours":0.83},
      {"start":"16:00","end":"16:50","hours":0.83},
      {"start":"17:00","end":"17:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83},
      {"start":"19:00","end":"19:50","hours":0.83}
    ],
    "일": [
      {"start":"09:30","end":"10:20","hours":0.83,"weeks":[2,4]},
      {"start":"10:30","end":"11:20","hours":0.83,"weeks":[2,4]},
      {"start":"11:30","end":"12:20","hours":0.83,"weeks":[2,4]},
      {"start":"13:30","end":"14:20","hours":0.83,"weeks":[2,4]},
      {"start":"14:30","end":"15:20","hours":0.83,"weeks":[2,4]},
      {"start":"15:30","end":"16:20","hours":0.83,"weeks":[2,4]}
    ]
  }$$::jsonb, $${
    "월":"자유형 이상만 이용할 수 있으며 킥판·오리발·헬퍼·풀부이는 사용할 수 없습니다.",
    "수":"자유형 이상만 이용할 수 있으며 킥판·오리발·헬퍼·풀부이는 사용할 수 없습니다.",
    "금":"자유형 이상만 이용할 수 있으며 킥판·오리발·헬퍼·풀부이는 사용할 수 없습니다.",
    "일":"매월 둘째·넷째 주 일요일에만 운영합니다."
  }$$::jsonb, '2026-06-07'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_0111'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0111');
