-- Pool's day — 덕풍스포츠문화센터(POOL_0896) 신규. 경기 하남시 역말로 71, 공공(하남시).
-- 크리스 제공 운영자 공식 홈페이지 캡처(1차, 2026-07-09). 25m 5레인 수심1.4, 지하1층(1B).
-- 영법 가능자 자유수영: 월~금 08:00~08:50·21:00~21:50 / 토 16:00~17:50 / 일 09:00~10:50·11:00~12:50·14:00~15:50·16:00~17:50(둘째·넷째주 일요일만).
-- 일일입장 성인 평일(50분)1650·주말(1시간50분)3300. 관외(하남 외) 200% 할증. 좌표=카카오 도로명 지오코딩.
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0896', '덕풍스포츠문화센터', '경기', '하남시', '경기도 하남시 역말로 71',
   37.5379825112918, 127.202902709442, 'indoor', 'public',
   '031-730-4850', 'https://hanamsport.or.kr', 5, 25, 1.4, 1.4,
   '{}', false, false, false,
   true, true, 1650, 3300, null, 'https://hanamsport.or.kr/wwwroot/ds/center/location.php')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0896', '풀스데이', $${
    "월":[{"start":"08:00","end":"08:50","hours":0.83},{"start":"21:00","end":"21:50","hours":0.83}],
    "화":[{"start":"08:00","end":"08:50","hours":0.83},{"start":"21:00","end":"21:50","hours":0.83}],
    "수":[{"start":"08:00","end":"08:50","hours":0.83},{"start":"21:00","end":"21:50","hours":0.83}],
    "목":[{"start":"08:00","end":"08:50","hours":0.83},{"start":"21:00","end":"21:50","hours":0.83}],
    "금":[{"start":"08:00","end":"08:50","hours":0.83},{"start":"21:00","end":"21:50","hours":0.83}],
    "토":[{"start":"16:00","end":"17:50","hours":1.83}],
    "일":[{"start":"09:00","end":"10:50","hours":1.83,"weeks":[2,4]},{"start":"11:00","end":"12:50","hours":1.83,"weeks":[2,4]},{"start":"14:00","end":"15:50","hours":1.83,"weeks":[2,4]},{"start":"16:00","end":"17:50","hours":1.83,"weeks":[2,4]}]
  }$$::jsonb, $${
    "월":"영법 가능자 자유수영입니다.",
    "화":"영법 가능자 자유수영입니다.",
    "수":"영법 가능자 자유수영입니다.",
    "목":"영법 가능자 자유수영입니다.",
    "금":"영법 가능자 자유수영입니다.",
    "토":"영법 가능자 자유수영입니다.",
    "일":"영법 가능자 자유수영입니다. 매월 둘째·넷째 주 일요일만 운영합니다."
  }$$::jsonb, '2026-07-09'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0896' and exists (select 1 from public.schedules where pool_id = 'POOL_0896');
