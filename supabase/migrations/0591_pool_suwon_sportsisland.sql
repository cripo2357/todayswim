-- Pool's day — 수원스포츠아일랜드(POOL_0899) 신규. 경기 수원시 팔달구, 공공(경기도수원월드컵경기장관리재단). 자유수영 일일입장.
-- 크리스 제공 운영자 공식 카드(1차, 2026-07-10). 50m 풀을 평상시 25m 20레인으로 분할 운영(고양어울림 방식) → pool_length=50, lane_count=10.
-- 수심 1.15~1.35(25m 구성), 유아풀 2레인 수심0.7·해수풀, 다이빙풀 보유(크리스 잠수풀 리스트 5m).
-- 자유수영: 월~금 06:00~22:00(12:20~13:00 휴장) / 토 06:00~21:00 / 일·공휴일 06:00~20:00. 일일 성인8500.
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0899', '수원스포츠아일랜드', '경기', '수원시 팔달구', '경기도 수원시 팔달구 창룡대로210번길 41',
   37.2901068993408, 127.035026697855, 'indoor', 'public',
   '031-259-2137', 'https://suwonworldcup.gg.go.kr', 10, 50, 1.15, 1.35,
   '{}', true, true, false,
   true, true, 8500, 8500, null, 'https://suwonworldcup.gg.go.kr/gg_worldcup_building/center/swim')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0899', '풀스데이', $${
    "월":[{"start":"06:00","end":"12:20","hours":6.33},{"start":"13:00","end":"22:00","hours":9}],
    "화":[{"start":"06:00","end":"12:20","hours":6.33},{"start":"13:00","end":"22:00","hours":9}],
    "수":[{"start":"06:00","end":"12:20","hours":6.33},{"start":"13:00","end":"22:00","hours":9}],
    "목":[{"start":"06:00","end":"12:20","hours":6.33},{"start":"13:00","end":"22:00","hours":9}],
    "금":[{"start":"06:00","end":"12:20","hours":6.33},{"start":"13:00","end":"22:00","hours":9}],
    "토":[{"start":"06:00","end":"21:00","hours":15}],
    "일":[{"start":"06:00","end":"20:00","hours":14}]
  }$$::jsonb, $${
    "월":"12:20~13:00은 휴장입니다.",
    "화":"12:20~13:00은 휴장입니다.",
    "수":"12:20~13:00은 휴장입니다.",
    "목":"12:20~13:00은 휴장입니다.",
    "금":"12:20~13:00은 휴장입니다.",
    "일":"일·공휴일 자유수영은 센터 행사 시 이용이 제한될 수 있습니다."
  }$$::jsonb, '2026-07-10'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0899' and exists (select 1 from public.schedules where pool_id = 'POOL_0899');
