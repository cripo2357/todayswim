-- Pool's day — 의성군청소년센터 수영장 등록 (POOL_0721, 1곳).
--
-- ## 출처 [1차 — 운영자 공식, 크리스 캡처 제공 2026-06-13]
-- 자유수영은 토요일만 06:00~21:00. 수영장 1일 일반 3,000원(청소년 2,000·어린이 1,500).
-- 성인풀 25m·4레인, 유아풀 4m×11m. 지하2층.
--
-- ## prod 적용: scripts/apply-sql-prod.mjs (멱등). db push 금지.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0721', '의성군청소년센터', '경북', '의성군', '경상북도 의성군 의성읍 충효로 68',
    36.3548323912191, 128.704654121189, 'indoor', 'public',
    '054-830-6950', 'https://www.usc.go.kr', 4, 25, null, null,
    '{}', true, false, false,
    true, true, null, 3000, null, 'https://www.usc.go.kr')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0721', '풀스데이', $${"토":[{"start":"06:00","end":"21:00","hours":15}]}$$::jsonb, $${"토":"자유수영은 토요일만 운영, 1회 2시간 기준"}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0721' and exists (select 1 from public.schedules where pool_id = 'POOL_0721');
