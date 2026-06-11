-- Pool's day — 표선면문화체육복합센터(서귀포 표선면, 공공) 등록. POOL_0420.
--
-- ## 출처 [1차 — 크리스 현장 캡처, 2026-06-12]
-- 공식 운영시간(평일 06–21 / 주말·공휴일 06–18, 정화 12–14, 화휴관) + 요금 안내판 캡처.
-- 제주시국민체육센터와 동일 구조 → 운영시간=자유수영(정화 제외) 등록.
-- 요금: 수영 1회 개인 성인 3,000(청소년·경로·어린이 1,500). 유아풀 있음(크리스 확인).
-- 좌표: 카카오 Local API(주소·POI 약 3m 일치). prod 직접 적용 완료, 파일은 기록용.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0420', '표선면문화체육복합센터', '제주', '서귀포시', '제주특별자치도 서귀포시 표선면 민속해안로 631-12',
    33.3240910139580, 126.839479286637, 'indoor', 'public',
    '064-901-2770', null, null, null, null, null,
    '{}', true, false, false,
    true, true, 3000, 3000, null, null)
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0420', '풀스데이', $${"월":[{"start":"06:00","end":"12:00","hours":6},{"start":"14:00","end":"21:00","hours":7}],"수":[{"start":"06:00","end":"12:00","hours":6},{"start":"14:00","end":"21:00","hours":7}],"목":[{"start":"06:00","end":"12:00","hours":6},{"start":"14:00","end":"21:00","hours":7}],"금":[{"start":"06:00","end":"12:00","hours":6},{"start":"14:00","end":"21:00","hours":7}],"토":[{"start":"06:00","end":"12:00","hours":6},{"start":"14:00","end":"18:00","hours":4}],"일":[{"start":"06:00","end":"12:00","hours":6},{"start":"14:00","end":"18:00","hours":4}]}$$::jsonb, '{}'::jsonb, '2026-06-12'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0420' and exists (select 1 from public.schedules where pool_id = 'POOL_0420');
