-- Pool's day — 고흥군실내수영장 등록 (POOL_0548). 전라도 군 보류분 해소.
-- 보류 사유였던 명칭 불일치 해소: 카카오 POI '고흥브이실내수영장'(현 운영 브랜드)과
-- 군청 공식 '고흥군실내수영장'은 동일 시설(장전신전길 140-31 = 등암리 885, 좌표 34.5825/127.2700,
-- 4레인 25×9m). 군청 공식 페이지가 1차 출처. 안정적인 군 공식명으로 등록.
-- 운영시간 06:00~20:00(연중·일/공휴일 휴장, 강습 월수금 일부 제외)=자유수영 윈도우로 등록.
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0548', '고흥군실내수영장', '전남', '고흥군', '전라남도 고흥군 고흥읍 장전신전길 140-31',
    34.5825006277512, 127.270061313388, 'indoor', 'public',
    '061-830-6731', 'https://www.goheung.go.kr', 4, 25, 1.2, 1.5,
    '{}', false, false, false,
    true, true, 3000, 3000, null, 'https://www.goheung.go.kr/culture/contentsView.do?pageId=culture12')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0548', '풀스데이', $${"월":[{"start":"06:00","end":"20:00","hours":14}],"화":[{"start":"06:00","end":"20:00","hours":14}],"수":[{"start":"06:00","end":"20:00","hours":14}],"목":[{"start":"06:00","end":"20:00","hours":14}],"금":[{"start":"06:00","end":"20:00","hours":14}],"토":[{"start":"06:00","end":"20:00","hours":14}]}$$::jsonb, '{}'::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0548' and exists (select 1 from public.schedules where pool_id = 'POOL_0548');
