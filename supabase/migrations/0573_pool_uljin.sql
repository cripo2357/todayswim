-- Pool's day — 울진국민체육센터 등록 (POOL_0691, 1곳).
--
-- ## 출처 [1차 — 운영자 공식(uljin.go.kr), 크리스 캡처 제공 2026-06-13]
-- 울진군 울진읍 현내항길 92-13. 수영장 이용: 월~금 06:00~20:30 / 토 06:00~16:50 / 일 휴무.
-- 성인풀 6레인 수심 1.25~1.45, 유아풀 2레인 수심 0.8. 자유수영 2시간 개인 어른 2,500원.
--
-- ## prod 적용: scripts/apply-sql-prod.mjs (멱등). db push 금지.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0691', '울진국민체육센터', '경북', '울진군', '경상북도 울진군 울진읍 현내항길 92-13',
    36.9906990817588, 129.407521747299, 'indoor', 'public',
    '054-789-5851', 'https://www.uljin.go.kr/index.uljin?menuCd=DOM_000000105009002007', 6, null, 1.25, 1.45,
    '{}', true, false, false,
    true, true, 2500, 2500, null, 'https://www.uljin.go.kr/index.uljin?menuCd=DOM_000000105009002007')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0691', '풀스데이', $${"월":[{"start":"06:00","end":"20:30","hours":14.5}],"화":[{"start":"06:00","end":"20:30","hours":14.5}],"수":[{"start":"06:00","end":"20:30","hours":14.5}],"목":[{"start":"06:00","end":"20:30","hours":14.5}],"금":[{"start":"06:00","end":"20:30","hours":14.5}],"토":[{"start":"06:00","end":"16:50","hours":10.83}]}$$::jsonb, $${"월":"일요일 휴무, 1회 2시간 이용"}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0691' and exists (select 1 from public.schedules where pool_id = 'POOL_0691');
