-- Pool's day — 제주종합경기장실내수영장(제주시 오라, 공공) 등록. POOL_0501.
--
-- ## 출처 [1차 — 크리스 현장 캡처, 2026-06-12]
-- 공식 이용시간(연중 06–21 / 주말·공휴일 06–18, 환경정비 12–14, 월휴관)+요금(2시간 개인 3,000) 캡처.
-- 이전 '내부공사중' 보류 → 공사 종료·정상 운영 확인으로 등록 전환.
-- 규격: 경영풀 50m×8레인 + 다이빙풀 25m×21m(수심 5m, has_diving_pool=true). 관리=제주시 체육진흥과.
-- 좌표: 카카오 Local API(POI=수영장 건물 직접 매칭). prod 직접 적용 완료, 파일은 기록용.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0501', '제주종합경기장실내수영장', '제주', '제주시', '제주특별자치도 제주시 서광로2길 24',
    33.4968533433581, 126.516735512312, 'indoor', 'public',
    '064-728-3290', 'https://www.psf.kr', 8, 50, null, null,
    '{}', false, true, false,
    true, true, 3000, 3000, null, 'https://www.psf.kr/sports/bview/26')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0501', '풀스데이', $${"화":[{"start":"06:00","end":"12:00","hours":6},{"start":"14:00","end":"21:00","hours":7}],"수":[{"start":"06:00","end":"12:00","hours":6},{"start":"14:00","end":"21:00","hours":7}],"목":[{"start":"06:00","end":"12:00","hours":6},{"start":"14:00","end":"21:00","hours":7}],"금":[{"start":"06:00","end":"12:00","hours":6},{"start":"14:00","end":"21:00","hours":7}],"토":[{"start":"06:00","end":"12:00","hours":6},{"start":"14:00","end":"18:00","hours":4}],"일":[{"start":"06:00","end":"12:00","hours":6},{"start":"14:00","end":"18:00","hours":4}]}$$::jsonb, '{}'::jsonb, '2026-06-12'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0501' and exists (select 1 from public.schedules where pool_id = 'POOL_0501');
