-- Pool's day — 충청북도학생수영장(POOL_0895) 신규. 충북 청주시 청원구, 공공(충청북도교육청).
-- 크리스 제공 운영자 공식 상세카드(1차, 2026-07-09). 50m 8레인 수심1.2~1.4, 다이빙장(25×21 수심5) 별도.
-- 일반인 자유수영: 월~토 06:00~08:00만(그 외 09:00~20:00은 고등학생 이하 학생 전용). 일요일·관공서 공휴일 휴장(어린이날 제외).
-- 수질관리 08:00~09:00·12:00~13:00 입장불가(일반인 창구 06~08과 무관). 일일 일반수영 성인3000·중고2000·초1500.
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0895', '충청북도학생수영장', '충북', '청주시 청원구', '충청북도 청주시 청원구 공항로59번길 33',
   36.6621606696299, 127.485080704666, 'indoor', 'public',
   '043-254-7251', 'https://www.cbstc.go.kr/pool/main.php', 8, 50, 1.2, 1.4,
   '{}', false, true, false,
   true, true, 3000, 3000, null, 'https://www.cbstc.go.kr/pool/sub.php?menukey=70019')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0895', '풀스데이', $${
    "월":[{"start":"06:00","end":"08:00","hours":2}],
    "화":[{"start":"06:00","end":"08:00","hours":2}],
    "수":[{"start":"06:00","end":"08:00","hours":2}],
    "목":[{"start":"06:00","end":"08:00","hours":2}],
    "금":[{"start":"06:00","end":"08:00","hours":2}],
    "토":[{"start":"06:00","end":"08:00","hours":2}]
  }$$::jsonb, $${
    "월":"일반인 자유수영은 06:00~08:00만 이용 가능합니다(그 외 시간은 고등학생 이하 학생 전용). 일요일·관공서 공휴일 휴장.",
    "화":"일반인 자유수영은 06:00~08:00만 이용 가능합니다(그 외 시간은 고등학생 이하 학생 전용). 일요일·관공서 공휴일 휴장.",
    "수":"일반인 자유수영은 06:00~08:00만 이용 가능합니다(그 외 시간은 고등학생 이하 학생 전용). 일요일·관공서 공휴일 휴장.",
    "목":"일반인 자유수영은 06:00~08:00만 이용 가능합니다(그 외 시간은 고등학생 이하 학생 전용). 일요일·관공서 공휴일 휴장.",
    "금":"일반인 자유수영은 06:00~08:00만 이용 가능합니다(그 외 시간은 고등학생 이하 학생 전용). 일요일·관공서 공휴일 휴장.",
    "토":"일반인 자유수영은 06:00~08:00만 이용 가능합니다(그 외 시간은 고등학생 이하 학생 전용). 일요일·관공서 공휴일 휴장."
  }$$::jsonb, '2026-07-09'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0895' and exists (select 1 from public.schedules where pool_id = 'POOL_0895');
