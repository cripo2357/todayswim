-- Pool's day — 중구 배치: 봉래체육문화센터 수영장 추가 (POOL_0133). 사설(봉래초 내).
--
-- ## 시간표 출처 [2차 — 블로그 캡처, 운영자 공식 URL 미확보]
-- 크리스가 블로그(여의도 정보다람쥐) 캡처 제공. 일일권·주소는 명확하나 운영자 공식 시간표 URL은 미확보.
-- → schedule_source_url null. 후속으로 운영자 공식 출처 확보 시 백필 필요.
--
-- - 자유수영: 평일 06:00–21:50(변동가능), 토 09:00–17:50, 공휴일 09:00–17:50(by_day 미표기), 일요일 휴관.
-- - 가격(일일 비회원): 12,000(수건 제공). 주차 2시간 무료.
--
-- ## 메타데이터 출처
-- - 좌표 [신뢰도 높음]: 카카오 POI "봉래체육문화센터"(만리동2가 2, 봉래초 내).
-- - 레인/길이/수심 6/25/1.0~1.2, 유아풀 있음 [2차 — 권세민 블로그] → has_kids_pool=true.
-- - 운영주체 불명확(봉래초 내 위탁) → ownership=private(잠정). 전화 미확보 → null.
-- 사진: 미확보 → photo_url null.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0133', '봉래체육문화센터', '서울', '중구',
    '서울특별시 중구 손기정로 73',
    37.55600049005831, 126.96372314401351, 'indoor', 'private',
    null, null,
    6, 25, 1.0, 1.2,
    '{}', true, false, false,
    true, true,
    12000, 12000, null,
    null)
on conflict (id) do nothing;

-- 자유수영. 평일 06:00-21:50=15.83(변동가능), 토 09:00-17:50=8.83. 공휴일 09:00-17:50(미표기), 일 휴관.
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0133', '풀스데이', $${
    "월": [{"start":"06:00","end":"21:50","hours":15.83}],
    "화": [{"start":"06:00","end":"21:50","hours":15.83}],
    "수": [{"start":"06:00","end":"21:50","hours":15.83}],
    "목": [{"start":"06:00","end":"21:50","hours":15.83}],
    "금": [{"start":"06:00","end":"21:50","hours":15.83}],
    "토": [{"start":"09:00","end":"17:50","hours":8.83}]
  }$$::jsonb, '{}'::jsonb, '2026-06-08'::timestamptz)
on conflict (pool_id) do nothing;

update public.pools set has_schedule = true
where id = 'POOL_0133' and exists (select 1 from public.schedules where pool_id = 'POOL_0133');
