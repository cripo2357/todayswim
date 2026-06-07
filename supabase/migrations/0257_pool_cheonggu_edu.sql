-- Pool's day — 중구 배치: 청구교육문화관 수영장 추가 (POOL_0131). 공공(교육문화관, korspo 위탁).
--
-- ## 시간표 출처 [1차 — 운영자 공식 안내문]
-- 크리스가 청구교육문화관 자유수영 공식 안내 캡처 제공(시간표+요금). 전화 02-2231-9362~3 일치.
--
-- - 자유수영:
--   · 평일: 06:00–08:50, 13:00–21:50
--   · 토   : 06:00–17:50 (어린이수영 13:00부터 입장)
--   · 일요일: 휴무(크리스 확인).
-- - 가격(일일): 일반 10,000 / 어린이 6,000. 월 자유수영 105,000.
--
-- ## 메타데이터 출처
-- - 좌표 [신뢰도 높음]: 카카오 주소검색 "중구 다산로 170".
-- - 레인/길이/수심 6/25/1.3~1.4 [2차 — 권세민 블로그]. 유아풀 정보 없음 → false.
-- - 운영사 korspo(0116 돈암 동일 계열) → ownership=public. 전화 02-2231-9362.
-- 사진: 미확보 → photo_url null.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_weekday, price_weekend, price_monthly, photo_url,
  schedule_source_url
) values
  ('POOL_0131', '청구교육문화관', '서울', '중구',
    '서울특별시 중구 다산로 170',
    37.5591166793514, 127.013724413955, 'indoor', 'public',
    '02-2231-9362', 'http://www.korspo.co.kr/cheonggu.php',
    6, 25, 1.3, 1.4,
    '{}', false, false, false,
    true, true,
    10000, 10000, 105000, null,
    'http://www.korspo.co.kr/cheonggu.php')
on conflict (id) do nothing;

-- 자유수영. 평일 06:00-08:50=2.83, 13:00-21:50=8.83. 토 06:00-17:50=11.83. 일요일 휴무.
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0131', '풀스데이', $${
    "월": [{"start":"06:00","end":"08:50","hours":2.83},{"start":"13:00","end":"21:50","hours":8.83}],
    "화": [{"start":"06:00","end":"08:50","hours":2.83},{"start":"13:00","end":"21:50","hours":8.83}],
    "수": [{"start":"06:00","end":"08:50","hours":2.83},{"start":"13:00","end":"21:50","hours":8.83}],
    "목": [{"start":"06:00","end":"08:50","hours":2.83},{"start":"13:00","end":"21:50","hours":8.83}],
    "금": [{"start":"06:00","end":"08:50","hours":2.83},{"start":"13:00","end":"21:50","hours":8.83}],
    "토": [{"start":"06:00","end":"17:50","hours":11.83}]
  }$$::jsonb, $${
    "토":"어린이는 13:00부터 입장할 수 있습니다."
  }$$::jsonb, '2026-06-08'::timestamptz)
on conflict (pool_id) do nothing;

update public.pools set has_schedule = true
where id = 'POOL_0131' and exists (select 1 from public.schedules where pool_id = 'POOL_0131');
