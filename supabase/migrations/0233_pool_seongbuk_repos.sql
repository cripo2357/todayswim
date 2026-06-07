-- Pool's day — 성북구 배치 시작: 성북종합레포츠타운(맑은물수영장) 추가 (POOL_0114).
--
-- ## 시간표 출처 [1차 — 운영자 공식 안내문]
--
-- 크리스가 '일일 자유수영 운영시간' 공식 안내문(성북구도시관리공단) 캡처 제공.
-- 공식 gongdan.go.kr이 SPA라 정적 fetch 불가 → 캡처가 1차. 첨벙(2차)은 평일 1부를
-- "08:30~08:50(20분)"으로 잘못 적었으나 공식 안내문으로 "08:00~08:50(50분)" 정정.
--
-- - 일일 자유수영(평일 50분, 토 1시간50분 회차):
--   · 평일 1부 08:00–08:50, 2부 12:00–12:50, 4부 21:00–21:50 → 월~금 매일
--   · 평일 3부 18:00–18:50 → 월·수·금만
--   · 토 06:00–07:50, 10:00–11:50, 13:00–14:50, 16:00–17:50 (4부)
--   · 일요일: 정규 미운영. 법정공휴일은 10:00/13:00/16:00 별도 운영(by_day 미표기).
-- - 가격: 평일 성인 4,500 / 토·공휴일 성인 5,500. → price_weekday / price_per_sat.
-- - 유의: 현금결제 불가(회원카드/카드), 수영용품·물놀이기구 사용불가, 정원 마감시 입장제한.
--   평일 4부(21시)는 유아풀 미개방·어린이 입장 불가.
--
-- ## 메타데이터 출처
-- - 성인풀 25m×13m 6레인 수심 1.4m + 어린이풀 15m×5m 수심 0.7m → has_kids_pool=true.
--   (공식 안내문 + 첨벙 일치)
-- - 좌표 [신뢰도 높음]: 카카오 POI "성북종합레포츠타운 수영장"(석관동 382).
-- - 전화: 02-6917-1100.
--
-- 사진: pool-photos/POOL_0114.jpg 미확보 → photo_url null.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_weekday, price_per_sat, photo_url,
  schedule_source_url
) values
  ('POOL_0114', '성북종합레포츠타운', '서울', '성북구',
    '서울특별시 성북구 한천로58길 307',
    37.610242209059386, 127.07002638906067, 'indoor', 'public',
    '02-6917-1100', 'https://www.gongdan.go.kr/',
    6, 25, 1.4, 1.4,
    '{}', true, false, false,
    true, true,
    4500, 5500, null,
    'https://www.gongdan.go.kr/portal/main/contents.do?menuNo=400270')
on conflict (id) do nothing;

-- 자유수영 시간표. 평일 50분=0.83, 토 1시간50분=1.83. 3부(18시)는 월·수·금만.
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0114', '풀스데이', $${
    "월": [
      {"start":"08:00","end":"08:50","hours":0.83},
      {"start":"12:00","end":"12:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83},
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
      {"start":"18:00","end":"18:50","hours":0.83},
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
      {"start":"18:00","end":"18:50","hours":0.83},
      {"start":"21:00","end":"21:50","hours":0.83}
    ],
    "토": [
      {"start":"06:00","end":"07:50","hours":1.83},
      {"start":"10:00","end":"11:50","hours":1.83},
      {"start":"13:00","end":"14:50","hours":1.83},
      {"start":"16:00","end":"17:50","hours":1.83}
    ]
  }$$::jsonb, $${
    "월":"현금 결제가 안 되며, 수영용품·물놀이기구는 사용할 수 없습니다.",
    "화":"현금 결제가 안 되며, 수영용품·물놀이기구는 사용할 수 없습니다.",
    "수":"현금 결제가 안 되며, 수영용품·물놀이기구는 사용할 수 없습니다.",
    "목":"현금 결제가 안 되며, 수영용품·물놀이기구는 사용할 수 없습니다.",
    "금":"현금 결제가 안 되며, 수영용품·물놀이기구는 사용할 수 없습니다.",
    "토":"현금 결제가 안 되며, 수영용품·물놀이기구는 사용할 수 없습니다."
  }$$::jsonb, '2026-06-07'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_0114'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0114');
