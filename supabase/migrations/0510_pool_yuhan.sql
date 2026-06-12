-- Pool's day — 유한실내수영장(제주시 노형, 사설) 등록. POOL_0533.
--
-- ## 출처 [1차 — 크리스 캡처 + 공식 bubblekids.kr/new/sub2/2_2.php]
-- 자유수영=회원/쿠폰제(일일 입장권 없음). 빅스마일(순수 회원제, 자유수영X)과 달리 자유수영 시간표가
-- 공식에 명확하고 쿠폰으로 1회 이용 가능 → 등록(크리스 결정). 요금은 월 회원제만 반영(쿠폰 생략, 단순화).
-- 시간: 월·수·금 07–18 / 화·목 06–18 / 주말 09–15·18–20.
-- 좌표: 카카오 POI. 레인/길이/수심 미확보 null. prod 직접 적용 완료, 파일은 기록용.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, price_monthly, photo_url, schedule_source_url
) values
  ('POOL_0533', '유한실내수영장', '제주', '제주시', '제주특별자치도 제주시 수덕11길 68',
    33.484053245243, 126.470570830283, 'indoor', 'private',
    '064-746-9944', 'https://bubblekids.kr', null, null, null, null,
    '{}', false, false, false,
    true, true, null, null, 120000, null, 'https://bubblekids.kr/new/sub2/2_2.php')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0533', '풀스데이', $${"월":[{"start":"07:00","end":"18:00","hours":11}],"화":[{"start":"06:00","end":"18:00","hours":12}],"수":[{"start":"07:00","end":"18:00","hours":11}],"목":[{"start":"06:00","end":"18:00","hours":12}],"금":[{"start":"07:00","end":"18:00","hours":11}],"토":[{"start":"09:00","end":"15:00","hours":6},{"start":"18:00","end":"20:00","hours":2}],"일":[{"start":"09:00","end":"15:00","hours":6},{"start":"18:00","end":"20:00","hours":2}]}$$::jsonb, '{}'::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0533' and exists (select 1 from public.schedules where pool_id = 'POOL_0533');
