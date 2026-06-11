-- Pool's day — 제주 수영장 3차 배치 (서귀포시민·해돋이·외도). 운영자 캡처(공식 안내판)=1차 출처.
--
-- ## 출처 [1차 — 크리스 현장 캡처, 2026-06-12]
-- - POOL_0228 서귀포시민문화체육복합센터: 공식 운영시간(평일 06–21/주말 06–18, 정화 12–14, 화휴무)+요금 캡처.
--   제주시국민체육센터와 동일 구조. 시범운영 중 무료지만 정식 요금 3,000(반영).
-- - POOL_0268 해돋이힐링센터(사설, 구좌): 공식 수영장 운영시간표(강습 병행, 자유수영 가능 구간만 추출).
--   캡처는 평일=화·목 기준 → 평일 전체에 적용(월·수·금 강습일정 다르면 자유수영 시간 조정 필요).
--   아쿠아로빅(11:10–12:00)·점심(12–13)·저녁(16:30–17:30) 정비시간 제외. 일일 2,000.
-- - POOL_0269 외도실내수영장(공공): '도민 누구나' 자유수영 개방 확인(수영부 전용 보류 → 등록 전환).
--   화~금 06–21 / 토·일·공휴일 08–17, 정비 12–14, 월휴관. 일일 2,000. 경영장 비정규 5레인.
--
-- ## 메타: 좌표 카카오 Local API(주소·POI 약 10m 일치). prod 직접 적용 완료, 파일은 기록용.
-- 같은 확인에서 제외: 서귀포홍리(자유수영 미운영), 표선면(자유수영 시간표 캡처 대기).

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0228', '서귀포시민문화체육복합센터', '제주', '서귀포시', '제주특별자치도 서귀포시 동홍로 30',
    33.2510514955821, 126.568859747664, 'indoor', 'public',
    '064-732-7330', 'http://www.ssca.kr', null, null, null, null,
    '{}', false, false, false,
    true, true, 3000, 3000, null, 'http://www.ssca.kr')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0228', '풀스데이', $${"월":[{"start":"06:00","end":"12:00","hours":6},{"start":"14:00","end":"21:00","hours":7}],"수":[{"start":"06:00","end":"12:00","hours":6},{"start":"14:00","end":"21:00","hours":7}],"목":[{"start":"06:00","end":"12:00","hours":6},{"start":"14:00","end":"21:00","hours":7}],"금":[{"start":"06:00","end":"12:00","hours":6},{"start":"14:00","end":"21:00","hours":7}],"토":[{"start":"06:00","end":"12:00","hours":6},{"start":"14:00","end":"18:00","hours":4}],"일":[{"start":"06:00","end":"12:00","hours":6},{"start":"14:00","end":"18:00","hours":4}]}$$::jsonb, '{}'::jsonb, '2026-06-12'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0228' and exists (select 1 from public.schedules where pool_id = 'POOL_0228');

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0268', '해돋이힐링센터', '제주', '제주시', '제주특별자치도 제주시 구좌읍 조천우회로 982-72',
    33.5403746358980, 126.707118493930, 'indoor', 'private',
    '064-783-5634', null, null, null, null, null,
    '{}', false, false, false,
    true, true, 2000, 2000, null, null)
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0268', '풀스데이', $${"월":[{"start":"06:00","end":"11:00","hours":5},{"start":"13:00","end":"16:20","hours":3.33},{"start":"17:30","end":"20:20","hours":2.83}],"화":[{"start":"06:00","end":"11:00","hours":5},{"start":"13:00","end":"16:20","hours":3.33},{"start":"17:30","end":"20:20","hours":2.83}],"수":[{"start":"06:00","end":"11:00","hours":5},{"start":"13:00","end":"16:20","hours":3.33},{"start":"17:30","end":"20:20","hours":2.83}],"목":[{"start":"06:00","end":"11:00","hours":5},{"start":"13:00","end":"16:20","hours":3.33},{"start":"17:30","end":"20:20","hours":2.83}],"금":[{"start":"06:00","end":"11:00","hours":5},{"start":"13:00","end":"16:20","hours":3.33},{"start":"17:30","end":"20:20","hours":2.83}],"토":[{"start":"08:00","end":"11:30","hours":3.5},{"start":"13:00","end":"16:30","hours":3.5}],"일":[{"start":"08:00","end":"11:30","hours":3.5},{"start":"13:00","end":"16:30","hours":3.5}]}$$::jsonb, '{}'::jsonb, '2026-06-12'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0268' and exists (select 1 from public.schedules where pool_id = 'POOL_0268');

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0269', '외도실내수영장', '제주', '제주시', '제주특별자치도 제주시 조공포길 7',
    33.4915074495802, 126.434615841197, 'indoor', 'public',
    '064-759-8375', 'https://www.psf.kr', 5, null, null, null,
    '{}', false, false, false,
    true, true, 2000, 2000, null, 'https://www.psf.kr/sports/bview/129')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0269', '풀스데이', $${"화":[{"start":"06:00","end":"12:00","hours":6},{"start":"14:00","end":"21:00","hours":7}],"수":[{"start":"06:00","end":"12:00","hours":6},{"start":"14:00","end":"21:00","hours":7}],"목":[{"start":"06:00","end":"12:00","hours":6},{"start":"14:00","end":"21:00","hours":7}],"금":[{"start":"06:00","end":"12:00","hours":6},{"start":"14:00","end":"21:00","hours":7}],"토":[{"start":"08:00","end":"12:00","hours":4},{"start":"14:00","end":"17:00","hours":3}],"일":[{"start":"08:00","end":"12:00","hours":4},{"start":"14:00","end":"17:00","hours":3}]}$$::jsonb, '{}'::jsonb, '2026-06-12'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0269' and exists (select 1 from public.schedules where pool_id = 'POOL_0269');
