-- Pool's day — 남원읍문화체육복합센터(서귀포 남원읍, 공공) 등록. POOL_0534.
--
-- ## 출처 [1차 — 크리스 현장 안내판 캡처, 2026-06-13]
-- 공식 운영시간 안내판: 평일 06–21 / 토·일·공휴일 06–18, 브레이크 12–14(시설정비·수질점검), 휴관 매주 목요일.
-- 운영시간=자유수영(브레이크 제외). 표선면·서귀포시민 문화체육복합센터 계열이나 휴관이 목요일.
-- 규격: 25m 7레인, 성인풀 수심 1.2m, 어린이풀 0.6~0.9m(has_kids_pool). 요금 3,000(크리스 확인, 계열 동일).
-- 좌표: 카카오 POI. prod 직접 적용 완료, 파일은 기록용.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0534', '남원읍문화체육복합센터', '제주', '서귀포시', '제주특별자치도 서귀포시 남원읍 태위로 551-27',
    33.2774662608233, 126.705283730479, 'indoor', 'public',
    '064-900-1790', null, 7, 25, 1.2, 1.2,
    '{}', true, false, false,
    true, true, 3000, 3000, null, null)
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0534', '풀스데이', $${"월":[{"start":"06:00","end":"12:00","hours":6},{"start":"14:00","end":"21:00","hours":7}],"화":[{"start":"06:00","end":"12:00","hours":6},{"start":"14:00","end":"21:00","hours":7}],"수":[{"start":"06:00","end":"12:00","hours":6},{"start":"14:00","end":"21:00","hours":7}],"금":[{"start":"06:00","end":"12:00","hours":6},{"start":"14:00","end":"21:00","hours":7}],"토":[{"start":"06:00","end":"12:00","hours":6},{"start":"14:00","end":"18:00","hours":4}],"일":[{"start":"06:00","end":"12:00","hours":6},{"start":"14:00","end":"18:00","hours":4}]}$$::jsonb, '{}'::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0534' and exists (select 1 from public.schedules where pool_id = 'POOL_0534');
