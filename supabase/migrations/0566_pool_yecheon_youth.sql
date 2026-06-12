-- Pool's day — 예천청소년수련관 실내수영장 등록 (POOL_0671, 1곳).
--
-- ## 출처 [1차 — 운영자 공식 안내, 크리스 캡처 제공 2026-06-13]
-- 예천군 예천읍 동본리. 수영장 운영=화~일 06:00~21:00, 월요일 휴장.
-- 실내수영장 일일이용권 일반 3,000원(청소년 2,000·어린이 1,500). (예천 시내, 도청신도시 맑은누리와 별개.)
--
-- ## prod 적용: scripts/apply-sql-prod.mjs (멱등). db push 금지.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0671', '예천청소년수련관', '경북', '예천군', '경상북도 예천군 예천읍 동본리 434-1',
    36.6563668352113, 128.462961222248, 'indoor', 'public',
    null, 'https://www.ycg.kr', null, null, null, null,
    '{}', false, false, false,
    true, true, 3000, 3000, null, 'https://www.ycg.kr')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0671', '풀스데이', $${"화":[{"start":"06:00","end":"21:00","hours":15}],"수":[{"start":"06:00","end":"21:00","hours":15}],"목":[{"start":"06:00","end":"21:00","hours":15}],"금":[{"start":"06:00","end":"21:00","hours":15}],"토":[{"start":"06:00","end":"21:00","hours":15}],"일":[{"start":"06:00","end":"21:00","hours":15}]}$$::jsonb, $${"화":"매주 월요일 휴장"}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0671' and exists (select 1 from public.schedules where pool_id = 'POOL_0671');
