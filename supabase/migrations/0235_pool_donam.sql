-- Pool's day — 성북구 배치: 돈암문화스포츠센터 수영장 추가 (POOL_0116).
--
-- ## 시간표 출처 [1차 — 운영자 공식 안내문]
--
-- 크리스가 돈암문화스포츠센터 '일일 자유수영 안내' 공식 안내문 캡처 제공(시간표+요금).
-- 시설/전화는 공식 홈페이지(돈암교육문화관 korspo.co.kr/donam.php) 및 복수 공개 출처로 확인.
-- (첨벙 cbswim 미사용 — 데이터 신뢰 불가)
--
-- - 자유수영(긴 블록제 — 해당 시간대 내 자유 입수):
--   · 월·수·금: 06:00–08:50, 13:00–13:50, 18:00–22:50
--   · 화·목   : 06:00–08:50, 12:00–14:50, 18:00–22:50
--   · 토       : 06:00–17:50 (종일)
--   · 공휴일   : 09:00–11:50, 13:00–16:50 (by_day 미표기)
--   · 일요일   : 항시 휴관.
-- - 가격(일일): 성인 비회원 10,000 / 회원 8,000 → 일일 방문 기준 비회원 10,000 채택.
--   (초등·영유아 비회원 8,000 / 회원 7,000)
-- - 운영시간: 평일 06:00~23:00, 토 06:00~18:00, 공휴일 09:00~17:00.
--
-- ## 메타데이터 출처
-- - 레인/길이/수심: 공식 페이지 텍스트 미확인(시설 이미지) → null. 일일권은 1일 무제한 입장.
--   유아풀 정보 없음 → has_kids_pool=false.
-- - 좌표 [신뢰도 높음]: 카카오 POI "돈암문화스포츠센터"(동소문동6가 27-1).
-- - 전화: 02-922-9026(공식 홈페이지·복수 공개 출처 확인). 동소문로13길 38(돈암교육문화관 내).
-- - 출처: 돈암교육문화관 공식(korspo.co.kr/donam.php) + 크리스 제공 공식 안내문 캡처.
--
-- 사진: pool-photos/POOL_0116.jpg 미확보 → photo_url null.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_weekday, price_per_sat, photo_url,
  schedule_source_url
) values
  ('POOL_0116', '돈암문화스포츠센터', '서울', '성북구',
    '서울특별시 성북구 동소문로13길 38',
    37.5928118517243, 127.013284133887, 'indoor', 'public',
    '02-922-9026', 'http://www.korspo.co.kr/donam.php',
    null, null, null, null,
    '{}', false, false, false,
    true, true,
    10000, 10000, null,
    'http://www.korspo.co.kr/donam.php')
on conflict (id) do nothing;

-- 자유수영 시간표(긴 블록). 06:00~08:50=2.83, 13:00~13:50=0.83, 18:00~22:50=4.83,
-- 화목 12:00~14:50=2.83, 토 06:00~17:50=11.83. 일요일 휴관.
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0116', '풀스데이', $${
    "월": [
      {"start":"06:00","end":"08:50","hours":2.83},
      {"start":"13:00","end":"13:50","hours":0.83},
      {"start":"18:00","end":"22:50","hours":4.83}
    ],
    "화": [
      {"start":"06:00","end":"08:50","hours":2.83},
      {"start":"12:00","end":"14:50","hours":2.83},
      {"start":"18:00","end":"22:50","hours":4.83}
    ],
    "수": [
      {"start":"06:00","end":"08:50","hours":2.83},
      {"start":"13:00","end":"13:50","hours":0.83},
      {"start":"18:00","end":"22:50","hours":4.83}
    ],
    "목": [
      {"start":"06:00","end":"08:50","hours":2.83},
      {"start":"12:00","end":"14:50","hours":2.83},
      {"start":"18:00","end":"22:50","hours":4.83}
    ],
    "금": [
      {"start":"06:00","end":"08:50","hours":2.83},
      {"start":"13:00","end":"13:50","hours":0.83},
      {"start":"18:00","end":"22:50","hours":4.83}
    ],
    "토": [
      {"start":"06:00","end":"17:50","hours":11.83}
    ]
  }$$::jsonb, $${
    "토":"토요일은 06:00~17:50 종일 자유수영으로 운영합니다."
  }$$::jsonb, '2026-06-07'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_0116'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0116');
