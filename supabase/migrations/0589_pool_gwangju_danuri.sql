-- Pool's day — 하남다누리체육센터(POOL_0897) 신규. 광주 광산구 하남울로48번길 5, 공공(광산구).
-- 크리스 제공 현장 운영 안내판 캡처(1차, 2026-07-09). 25m 4레인 수심1.2, 지상2층, 체온조절탕.
-- 수영장 이용시간: 평일 06:00~21:00·주말 09:00~17:00, 점검 12:00~13:00·17:00~18:00 입장불가.
-- 휴관: 매월 1·3주 일요일·법정공휴일. 일일 일반4000·군경청소년3500·어린이3000(월회원 56000).
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0897', '하남다누리체육센터', '광주', '광산구', '광주광역시 광산구 하남울로48번길 5',
   35.1849342886382, 126.802705498005, 'indoor', 'public',
   '062-616-5841', 'https://gwangsansports.org', 4, 25, 1.2, 1.2,
   '{}', false, false, false,
   true, true, 4000, 4000, null, 'https://gwangsansports.org')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0897', '풀스데이', $${
    "월":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"17:00","hours":4},{"start":"18:00","end":"21:00","hours":3}],
    "화":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"17:00","hours":4},{"start":"18:00","end":"21:00","hours":3}],
    "수":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"17:00","hours":4},{"start":"18:00","end":"21:00","hours":3}],
    "목":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"17:00","hours":4},{"start":"18:00","end":"21:00","hours":3}],
    "금":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"17:00","hours":4},{"start":"18:00","end":"21:00","hours":3}],
    "토":[{"start":"09:00","end":"12:00","hours":3},{"start":"13:00","end":"17:00","hours":4}],
    "일":[{"start":"09:00","end":"12:00","hours":3,"weeks":[2,4,5]},{"start":"13:00","end":"17:00","hours":4,"weeks":[2,4,5]}]
  }$$::jsonb, $${
    "월":"12:00~13:00·17:00~18:00은 수영조 점검으로 입장 불가합니다.",
    "화":"12:00~13:00·17:00~18:00은 수영조 점검으로 입장 불가합니다.",
    "수":"12:00~13:00·17:00~18:00은 수영조 점검으로 입장 불가합니다.",
    "목":"12:00~13:00·17:00~18:00은 수영조 점검으로 입장 불가합니다.",
    "금":"12:00~13:00·17:00~18:00은 수영조 점검으로 입장 불가합니다.",
    "토":"12:00~13:00은 수영조 점검으로 입장 불가합니다.",
    "일":"12:00~13:00은 수영조 점검으로 입장 불가합니다. 매월 1·3주 일요일·공휴일은 휴관합니다."
  }$$::jsonb, '2026-07-09'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0897' and exists (select 1 from public.schedules where pool_id = 'POOL_0897');
