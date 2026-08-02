-- Pool's day — 야현체육센터(POOL_0900) 신규. 충북 충주시 교현동(야현1길 9), 공공(충주시설관리공단 직영). 2026-07-01 정식개관.
-- 조사(1차, 충주시설관리공단 cjfmc.or.kr key=639). 크리스 제보의 "아현체육센터"는 실제 야현체육센터(野峴)의 오기.
-- 성인풀 25m 7레인 수심1.2~1.3, 유아풀 별도. 7레인 중 5레인 상시 자유수영(강습 3레인 병행).
-- 자유수영=운영시간: 평일 06:00~21:00 / 토·격주(2·4주) 일요일 09:00~18:00. 휴관 1·3·5주 일요일. 일일 성인3000·청소년2500.
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0900', '야현체육센터', '충북', '충주시', '충청북도 충주시 야현1길 9',
   36.9802735732985, 127.937411904312, 'indoor', 'public',
   '043-830-9250', 'https://www.cjfmc.or.kr', 7, 25, 1.2, 1.3,
   '{}', true, false, false,
   true, true, 3000, 3000, null, 'https://www.cjfmc.or.kr/www/contents.do?key=639')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0900', '풀스데이', $${
    "월":[{"start":"06:00","end":"21:00","hours":15}],
    "화":[{"start":"06:00","end":"21:00","hours":15}],
    "수":[{"start":"06:00","end":"21:00","hours":15}],
    "목":[{"start":"06:00","end":"21:00","hours":15}],
    "금":[{"start":"06:00","end":"21:00","hours":15}],
    "토":[{"start":"09:00","end":"18:00","hours":9}],
    "일":[{"start":"09:00","end":"18:00","hours":9,"weeks":[2,4]}]
  }$$::jsonb, $${
    "월":"성인풀 7레인 중 5레인이 상시 자유수영으로 운영됩니다. 수영모 착용 필수.",
    "화":"성인풀 7레인 중 5레인이 상시 자유수영으로 운영됩니다. 수영모 착용 필수.",
    "수":"성인풀 7레인 중 5레인이 상시 자유수영으로 운영됩니다. 수영모 착용 필수.",
    "목":"성인풀 7레인 중 5레인이 상시 자유수영으로 운영됩니다. 수영모 착용 필수.",
    "금":"성인풀 7레인 중 5레인이 상시 자유수영으로 운영됩니다. 수영모 착용 필수.",
    "토":"성인풀 7레인 중 5레인이 상시 자유수영으로 운영됩니다. 수영모 착용 필수.",
    "일":"매월 2·4주 일요일만 운영합니다. 수영모 착용 필수."
  }$$::jsonb, '2026-07-14'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0900' and exists (select 1 from public.schedules where pool_id = 'POOL_0900');
