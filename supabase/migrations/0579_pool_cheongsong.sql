-- Pool's day — 청송군종합문화복지타운 수영장 등록 (POOL_0751, 1곳).
--
-- ## 출처 [1차 — 운영자 공식(csgsports.kr) + 크리스 건물확인·캡처 2026-06-13]
-- 건물 확정: 청송군종합문화복지타운(청송읍 금곡리). 수영장 월~금 06:00~21:00 / 토 06:00~18:00,
-- 일·공휴일 휴관. 1일 성인 3,500원. 강습은 월회원 전용(자유수영은 운영시간 내). 25m 4레인.
-- (보류 사유였던 '월막리 국민체육센터 vs 금곡리 종합문화복지타운' 건물 모호 → 종합문화복지타운으로 확정.)
--
-- ## prod 적용: scripts/apply-sql-prod.mjs (멱등). db push 금지.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0751', '청송군종합문화복지타운', '경북', '청송군', '경상북도 청송군 청송읍 금곡리 813',
    36.429920084561, 129.058910932628, 'indoor', 'public',
    '054-870-6577', 'https://csgsports.kr', 4, 25, 0.8, 1.35,
    '{}', true, false, false,
    true, true, 3500, 3500, null, 'https://csgsports.kr')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0751', '풀스데이', $${"월":[{"start":"06:00","end":"21:00","hours":15}],"화":[{"start":"06:00","end":"21:00","hours":15}],"수":[{"start":"06:00","end":"21:00","hours":15}],"목":[{"start":"06:00","end":"21:00","hours":15}],"금":[{"start":"06:00","end":"21:00","hours":15}],"토":[{"start":"06:00","end":"18:00","hours":12}]}$$::jsonb, $${"월":"강습은 월회원 전용(일반은 운영시간 내 자유수영), 일요일·공휴일 휴관"}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0751' and exists (select 1 from public.schedules where pool_id = 'POOL_0751');
