-- Pool's day — 산청실내수영장·합천체육관 실내수영장 등록 (POOL_0741~0742).
--
-- ## 출처 [1차 — 운영자 공식 현장 안내판, 크리스 캡처 제공 2026-06-13]
-- 산청: 새벽강습 06:00~07:00·청소 07:00~09:00·강습및자유수영 09:00~20:00, 일·공휴일 휴관. 1회2시간 일반 3,800.
-- 합천: 평일 강습 / 토·일·공휴일 자유수영 06:00~18:00, 매주 월요일 휴무. 일일입장 개인 성인 2,500.
--
-- ## prod 적용: scripts/apply-sql-prod.mjs (멱등). db push 금지.

-- 1) 산청실내수영장 (경남 산청군) — 산청문화예술회관 내, 인공해수풀
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0741', '산청실내수영장', '경남', '산청군', '경상남도 산청군 금서면 친환경로2631번길 12',
    35.4201345588618, 127.873170660808, 'indoor', 'public',
    '055-974-0412', 'https://www.sancheong.go.kr', 4, 25, null, null,
    '{}', false, false, false,
    true, true, 3800, 3800, null, 'https://www.sancheong.go.kr')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0741', '풀스데이', $${"월":[{"start":"09:00","end":"20:00","hours":11}],"화":[{"start":"09:00","end":"20:00","hours":11}],"수":[{"start":"09:00","end":"20:00","hours":11}],"목":[{"start":"09:00","end":"20:00","hours":11}],"금":[{"start":"09:00","end":"20:00","hours":11}],"토":[{"start":"09:00","end":"20:00","hours":11}]}$$::jsonb, $${"월":"06:00~07:00 새벽강습·07:00~09:00 내부청소 후 09:00~20:00 강습·자유수영, 일요일·공휴일 휴관, 1회 2시간"}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0741' and exists (select 1 from public.schedules where pool_id = 'POOL_0741');

-- 2) 합천체육관 실내수영장 (경남 합천군)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0742', '합천체육관실내수영장', '경남', '합천군', '경상남도 합천군 합천읍 장수로 1',
    35.5615734624027, 128.153368403803, 'indoor', 'public',
    '055-930-3736', 'https://www.hc.go.kr', 6, 25, 1.2, 1.5,
    '{}', true, false, false,
    true, true, null, 2500, null, 'https://www.hc.go.kr')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0742', '풀스데이', $${"토":[{"start":"06:00","end":"18:00","hours":12}],"일":[{"start":"06:00","end":"18:00","hours":12}]}$$::jsonb, $${"토":"자유수영은 토·일·공휴일 06:00~18:00(평일은 강습), 매주 월요일 휴무","일":"매주 월요일 휴무"}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0742' and exists (select 1 from public.schedules where pool_id = 'POOL_0742');
