-- Pool's day — 마포구 배치: 소의체육문화센터 수영장 추가 (POOL_0132). 사설.
--
-- ## 시간표 출처 [1차 — 운영자 공식]
-- 크리스가 소의체육문화센터 공식 '프로그램 및 이용요금' 안내판 캡처 제공. 공식 soeuisc.com.
--
-- - 자유수영: 월~금 06:00–21:50(변동가능), 토 09:00–17:50, 공휴일 09:00–17:50(by_day 미표기), 일요일 휴무.
-- - 가격(일일입장 비회원): 성인 8,000 / 청소년 7,000 / 유아·어린이 5,000. 월 자유수영 129,000(주6회).
--
-- ## 메타데이터 출처
-- - 좌표 [신뢰도 높음]: 카카오 POI "소의체육문화센터"(아현동 386-1).
-- - 레인/길이/수심 5/25/1.2~1.5, 유아풀 있음 [2차 — 권세민 블로그] → has_kids_pool=true.
-- - 전화 02-364-8876(공식 안내판). 사설 운영 → ownership=private.
-- 사진: 미확보 → photo_url null.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_weekday, price_weekend, price_monthly, photo_url,
  schedule_source_url
) values
  ('POOL_0132', '소의체육문화센터', '서울', '마포구',
    '서울특별시 마포구 마포대로24길 42',
    37.552505536447455, 126.96095106825764, 'indoor', 'private',
    '02-364-8876', 'https://www.soeuisc.com',
    5, 25, 1.2, 1.5,
    '{}', true, false, false,
    true, true,
    8000, 8000, 129000, null,
    'https://www.soeuisc.com')
on conflict (id) do nothing;

-- 자유수영. 월~금 06:00-21:50=15.83(변동가능), 토 09:00-17:50=8.83. 공휴일 09:00-17:50(미표기), 일 휴무.
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0132', '풀스데이', $${
    "월": [{"start":"06:00","end":"21:50","hours":15.83}],
    "화": [{"start":"06:00","end":"21:50","hours":15.83}],
    "수": [{"start":"06:00","end":"21:50","hours":15.83}],
    "목": [{"start":"06:00","end":"21:50","hours":15.83}],
    "금": [{"start":"06:00","end":"21:50","hours":15.83}],
    "토": [{"start":"09:00","end":"17:50","hours":8.83}]
  }$$::jsonb, '{}'::jsonb, '2026-06-08'::timestamptz)
on conflict (pool_id) do nothing;

update public.pools set has_schedule = true
where id = 'POOL_0132' and exists (select 1 from public.schedules where pool_id = 'POOL_0132');
