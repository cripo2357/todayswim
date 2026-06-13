-- Pool's day — 영덕문화체육센터 실내수영장 등록 (POOL_0731, 1곳).
--
-- ## 출처 [1차 — 운영자 공식 안내, 크리스 캡처 제공 2026-06-13]
-- 운영 월~토 06:00~20:00, 일·공휴일 휴무. 강습 화·수·목·금. **자유수영은 월·토요일 운영**(강습 없는 날).
-- 1회입장 성인 4,000원(1일 2시간). 전화 054-730-7369.
-- (별개 시설 '영덕국민체육센터'는 체육관·헬스장만으로 수영장 없음 → 미등록.)
--
-- ## prod 적용: scripts/apply-sql-prod.mjs (멱등). db push 금지.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0731', '영덕문화체육센터', '경북', '영덕군', '경상북도 영덕군 영덕읍 강변길 324',
    36.4203678102182, 129.361971877612, 'indoor', 'public',
    '054-730-7369', 'https://www.yd.go.kr', null, null, null, null,
    '{}', false, false, false,
    true, true, 4000, 4000, null, 'https://www.yd.go.kr')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0731', '풀스데이', $${"월":[{"start":"06:00","end":"20:00","hours":14}],"토":[{"start":"06:00","end":"20:00","hours":14}]}$$::jsonb, $${"월":"자유수영은 월·토요일 운영(화~금은 강습 위주), 1회 2시간, 일·공휴일 휴무"}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0731' and exists (select 1 from public.schedules where pool_id = 'POOL_0731');
