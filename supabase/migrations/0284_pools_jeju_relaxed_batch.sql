-- Pool's day — 제주 공공 수영장 2차 배치 (POOL_0217~0220, 4곳). 완화기준 적용.
--
-- ## 시간표 출처 [1차] + 완화기준 (크리스 승인 2026-06-12)
-- 제주는 부산·전라와 달리 공식 페이지가 '자유수영 전용 시간표'를 거의 안 줌(운영시간/강습표만).
-- 전라도 선례처럼 **공식 운영시간 = 자유수영**으로 간주(블록형 아님). 휴관 요일은 by_day에서 제외.
-- - 서귀포·서부·동부: psf.kr(제주 공공체육시설 통합예약) 공식 운영시간.
-- - 제주혁신도시: 서귀포시 체육회 위탁(seogwiposports.org)·공개 운영시간(평일 06–21 화휴무 / 주말 06–18).
--
-- ## 요금
-- - 서귀포국민만 psf에 요금 명시(성인 3,000). 서부·동부(코오롱스포렉스 위탁, 요금 JS렌더 미확보)·
--   혁신도시(요금 공식 텍스트 없음)는 price null — 추후 현장/Studio UPDATE로 보강.
--
-- ## 이번 배치에 제외된 제주 후보 (운영시간조차 1차 미확보)
-- - 표선면문화체육복합센터·서귀포시민문화체육복합센터·해돋이힐링센터(사설)·
--   서귀포홍리실내수영장(사설, 전화문의)·도두봉실내수영장 DDC(사이트 접속거부)·제주종합경기장(공사중).
--
-- ## 메타
-- - 좌표: 카카오 Local API(주소 ROAD_ADDR). 사진 없음 → photo_url null.
-- - prod-only 직접 적용 완료([[pool_db_prod_only]]). 이 파일은 git 기록용. ID는 적용 시점 prod max+1.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0217', '서귀포국민체육센터', '제주', '서귀포시', '제주특별자치도 서귀포시 중문관광로 346',
    33.2509474673, 126.432152026519, 'indoor', 'public',
    '064-739-0363', 'https://www.psf.kr', 10, 50, null, null,
    '{}', false, false, false,
    true, true, 3000, 3000, null, 'https://www.psf.kr/sports/bview/43')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0217', '풀스데이', $${"화":[{"start":"06:00","end":"22:00","hours":16}],"수":[{"start":"06:00","end":"22:00","hours":16}],"목":[{"start":"06:00","end":"22:00","hours":16}],"금":[{"start":"06:00","end":"22:00","hours":16}],"토":[{"start":"06:00","end":"22:00","hours":16}],"일":[{"start":"06:00","end":"22:00","hours":16}]}$$::jsonb, '{}'::jsonb, '2026-06-11'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0217' and exists (select 1 from public.schedules where pool_id = 'POOL_0217');

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0218', '서부국민체육센터', '제주', '제주시', '제주특별자치도 제주시 한림읍 한림중앙로 71-9',
    33.4096918414655, 126.268544091817, 'indoor', 'public',
    '064-796-7921', 'https://www.psf.kr', 5, 25, null, null,
    '{}', false, false, false,
    true, true, null, null, null, 'https://www.psf.kr/sports/bview/168')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0218', '풀스데이', $${"화":[{"start":"06:00","end":"11:30","hours":5.5},{"start":"14:00","end":"20:30","hours":6.5}],"수":[{"start":"06:00","end":"11:30","hours":5.5},{"start":"14:00","end":"20:30","hours":6.5}],"목":[{"start":"06:00","end":"11:30","hours":5.5},{"start":"14:00","end":"20:30","hours":6.5}],"금":[{"start":"06:00","end":"11:30","hours":5.5},{"start":"14:00","end":"20:30","hours":6.5}],"토":[{"start":"08:00","end":"17:30","hours":9.5}],"일":[{"start":"08:00","end":"17:30","hours":9.5}]}$$::jsonb, '{}'::jsonb, '2026-06-11'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0218' and exists (select 1 from public.schedules where pool_id = 'POOL_0218');

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0219', '동부국민체육센터', '제주', '제주시', '제주특별자치도 제주시 구좌읍 해녀박물관길 3',
    33.5212856016725, 126.86281804789, 'indoor', 'public',
    '064-784-7814', 'https://www.psf.kr', 5, 25, null, null,
    '{}', false, false, false,
    true, true, null, null, null, 'https://www.psf.kr/sports/bview/170')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0219', '풀스데이', $${"월":[{"start":"10:00","end":"15:00","hours":5}],"화":[{"start":"10:00","end":"15:00","hours":5}],"수":[{"start":"10:00","end":"15:00","hours":5}],"목":[{"start":"10:00","end":"15:00","hours":5}],"금":[{"start":"10:00","end":"15:00","hours":5}]}$$::jsonb, '{}'::jsonb, '2026-06-11'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0219' and exists (select 1 from public.schedules where pool_id = 'POOL_0219');

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0220', '제주혁신도시복합혁신센터', '제주', '서귀포시', '제주특별자치도 서귀포시 서호남로 25',
    33.2512049450264, 126.515397032107, 'indoor', 'public',
    null, 'https://www.seogwiposports.org', 8, 50, null, null,
    '{}', true, false, false,
    true, true, null, null, null, 'https://www.seogwiposports.org')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0220', '풀스데이', $${"월":[{"start":"06:00","end":"21:00","hours":15}],"수":[{"start":"06:00","end":"21:00","hours":15}],"목":[{"start":"06:00","end":"21:00","hours":15}],"금":[{"start":"06:00","end":"21:00","hours":15}],"토":[{"start":"06:00","end":"18:00","hours":12}],"일":[{"start":"06:00","end":"18:00","hours":12}]}$$::jsonb, '{}'::jsonb, '2026-06-11'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0220' and exists (select 1 from public.schedules where pool_id = 'POOL_0220');
