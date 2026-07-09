-- Pool's day — 에덴스포츠타운수영장(POOL_0898) 신규. 경기 가평군 청평면, 사설(에덴스포츠타운). 자유수영 일일입장.
-- 공식 홈페이지(eden-town.com) 조사(1차, 2026-07-09). 실내 성인풀 25m 6레인 수심1.3~2.0, 유아풀(13m 수심0.9)·온탕.
-- 자유수영: 평일 06:00~11:30·15:00~20:00(11:30~15:00 단체예약), 토 06:00~11:30, 일·공휴일 휴무.
-- 일일입장 평일 성인10000·주말12000. 신장110cm 미만 입장불가.
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0898', '에덴스포츠타운수영장', '경기', '가평군', '경기도 가평군 청평면 경춘로 1436',
   37.7773024727085, 127.464468361187, 'indoor', 'private',
   '031-581-1300', 'http://www.eden-town.com', 6, 25, 1.3, 2.0,
   '{}', true, false, false,
   true, true, 10000, 12000, null, 'http://www.eden-town.com/sports/swim/swim_free.html')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0898', '풀스데이', $${
    "월":[{"start":"06:00","end":"11:30","hours":5.5},{"start":"15:00","end":"20:00","hours":5}],
    "화":[{"start":"06:00","end":"11:30","hours":5.5},{"start":"15:00","end":"20:00","hours":5}],
    "수":[{"start":"06:00","end":"11:30","hours":5.5},{"start":"15:00","end":"20:00","hours":5}],
    "목":[{"start":"06:00","end":"11:30","hours":5.5},{"start":"15:00","end":"20:00","hours":5}],
    "금":[{"start":"06:00","end":"11:30","hours":5.5},{"start":"15:00","end":"20:00","hours":5}],
    "토":[{"start":"06:00","end":"11:30","hours":5.5}]
  }$$::jsonb, $${
    "월":"평일 11:30~15:00은 단체예약으로 자유수영이 제한됩니다. 일요일·공휴일 휴무, 신장 110cm 미만 입장 불가.",
    "화":"평일 11:30~15:00은 단체예약으로 자유수영이 제한됩니다. 일요일·공휴일 휴무, 신장 110cm 미만 입장 불가.",
    "수":"평일 11:30~15:00은 단체예약으로 자유수영이 제한됩니다. 일요일·공휴일 휴무, 신장 110cm 미만 입장 불가.",
    "목":"평일 11:30~15:00은 단체예약으로 자유수영이 제한됩니다. 일요일·공휴일 휴무, 신장 110cm 미만 입장 불가.",
    "금":"평일 11:30~15:00은 단체예약으로 자유수영이 제한됩니다. 일요일·공휴일 휴무, 신장 110cm 미만 입장 불가.",
    "토":"일요일·공휴일 휴무. 신장 110cm 미만 입장 불가."
  }$$::jsonb, '2026-07-09'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0898' and exists (select 1 from public.schedules where pool_id = 'POOL_0898');
