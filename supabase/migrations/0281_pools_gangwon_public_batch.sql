-- Pool's day — 강원특별자치도 공공 수영장 1차 배치 등록 (16곳). 강원권 첫 확장.
--
-- ## POOL ID 배정 [충돌 회피]
-- 빈 구간 0156~0164(대전 0153~0155 이후 미사용) + 0210~0216 사용.
-- ※ 0165~0183은 전라 배치(0282)가 선점 → 강원은 0165~0170을 비움(이전 초안에서 재배치).
--
-- ## 시간표 출처 [1차 — 운영자 공식/현장 안내판, 크리스 캡처]
-- 각 시 공단/시청 공식 페이지 및 현장 이용안내를 크리스가 직접 제공. 첨벙/swimmingis 미사용.
-- 공통 모델: 공식상 "자유수영 = 운영시간 내 상시(강습은 일부 레인 동시운영)"인 곳은 운영시간 전체를
--   자유수영창으로 등록(대전 한밭수영장과 동일 패턴). 정화/클린타임은 슬롯 분리로 제외.
-- 신뢰도: 공단 슬롯표 공식 확보(춘천·원주·태백국민)가 최상. 강릉/동해/속초/삼척은 공식 운영시간 기준
--   운영창 모델 적용(요일별 강습 분절은 미반영) → 현장 강습표로 추후 정밀화 여지.
--
-- ## 춘천 (cuc.or.kr)
--   - 자유수영 운영시간 내 상시(강습 동시운영), 마감 30분 전 종료 → 평일 ~20:30, 일 ~17:30.
--   - 국민체육센터·국민생활관: 월 휴관. 근로자종합복지관: 일 휴관(현장 안내 05:00~21:00/토 09:00~18:00).
--   - 반다비: 일 휴관, 평일 정화 13:00~14:00 분리.
-- ## 원주 (wfmc.kr / wonju.go.kr)
--   - 국민체육센터: 월 휴관, 3,500원. 남부복합: 금 휴관(일요일은 토와 동일 추정). 근로자종합복지관: 월 휴관.
-- ## 강릉 (gtdc.or.kr)  성인 일일입장 북부 3,500 / 아레나·국민 4,000.
--   - 북부: 월 휴관, 화~일 09:00~18:00(잠수풀 5m 보유). 아레나: 월 휴관, 화~토 06~22 / 일 06~18(50m 8레인).
--   - 국민체육센터: 일 휴관, 월~토 09:00~18:00(스쿠버풀 보유).
-- ## 동해 (dhsisul.org)  성인 4,000. 정화 12:00~13:00 입장불가 → 슬롯 분리. 월 휴관.
--   - 해오름: 화~금 06~20 / 토·일 07~17. 근로자종합복지회관: 화~금 06~20 / 토 06~19 / 일 07~17.
-- ## 속초 (sports.sokcho.go.kr)  성인 3,500. 월 휴관. 평일 16:00~17:00 어린이강습 → 분리 제외.
-- ## 삼척 (samcheok.go.kr)  웰빙센터, 성인 3,500. 월 휴관. 화~금 06~21 / 토·일·공휴 09~18.
-- ## 태백 (tfmc.or.kr)  성인 3,500.
--   - 국민체육센터: 일 휴관, 공단 슬롯표 공식 확보(평일 06~12/13~15/18:30~21:30, 화·목 15:40~17:50 추가, 토 06~12/13~17:30).
--   - 장성국민체육센터: 토·일 휴관, 월~금 09~18(정비 12~13). ※ 임시개장 무료기간(2024.12까지) 만료 → 정식 전환가 3,500 가정, 확인 필요.
--
-- ## 메타
-- - 좌표 [신뢰도 높음]: 카카오 Local API(도로명 주소). 규격: 공식 확인분만, 미확인 null. 사진 없음 → photo_url null.

-- ===== 춘천 =====
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0156', '춘천국민체육센터', '강원', '춘천시', '강원특별자치도 춘천시 우석로 102-3',
    37.8626198805028, 127.756677718048, 'indoor', 'public',
    '033-240-1776', 'https://www.cuc.or.kr/gukminCenter.do', 10, 50, 1.35, 1.8,
    '{}', true, false, false,
    true, true, 3000, 3000, null, 'https://www.cuc.or.kr/gukminCenter.do')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0156', '풀스데이', $${"화":[{"start":"05:00","end":"20:30","hours":15.5}],"수":[{"start":"05:00","end":"20:30","hours":15.5}],"목":[{"start":"05:00","end":"20:30","hours":15.5}],"금":[{"start":"05:00","end":"20:30","hours":15.5}],"토":[{"start":"05:00","end":"20:30","hours":15.5}],"일":[{"start":"09:00","end":"17:30","hours":8.5}]}$$::jsonb, '{}'::jsonb, '2026-06-11'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0156' and exists (select 1 from public.schedules where pool_id = 'POOL_0156');

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0157', '춘천국민생활관', '강원', '춘천시', '강원특별자치도 춘천시 효자상길5번길 11',
    37.8730956475895, 127.728420393396, 'indoor', 'public',
    '033-252-1666', 'https://www.cuc.or.kr/gukminLife.do', 7, 25, 1.3, 1.5,
    '{}', true, false, false,
    true, true, 3000, 3000, null, 'https://www.cuc.or.kr/gukminLife.do')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0157', '풀스데이', $${"화":[{"start":"05:00","end":"20:30","hours":15.5}],"수":[{"start":"05:00","end":"20:30","hours":15.5}],"목":[{"start":"05:00","end":"20:30","hours":15.5}],"금":[{"start":"05:00","end":"20:30","hours":15.5}],"토":[{"start":"05:00","end":"20:30","hours":15.5}],"일":[{"start":"09:00","end":"17:30","hours":8.5}]}$$::jsonb, '{}'::jsonb, '2026-06-11'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0157' and exists (select 1 from public.schedules where pool_id = 'POOL_0157');

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0158', '춘천근로자종합복지관', '강원', '춘천시', '강원특별자치도 춘천시 후석로440번길 9',
    37.88923710807, 127.743914035586, 'indoor', 'public',
    '033-240-1600', 'https://www.cuc.or.kr/totalWelfare.do', 6, 25, 0.8, 1.5,
    '{}', false, false, false,
    true, true, 3000, 3000, null, 'https://www.cuc.or.kr/totalWelfare.do')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0158', '풀스데이', $${"월":[{"start":"05:00","end":"21:00","hours":16}],"화":[{"start":"05:00","end":"21:00","hours":16}],"수":[{"start":"05:00","end":"21:00","hours":16}],"목":[{"start":"05:00","end":"21:00","hours":16}],"금":[{"start":"05:00","end":"21:00","hours":16}],"토":[{"start":"09:00","end":"18:00","hours":9}]}$$::jsonb, '{}'::jsonb, '2026-06-11'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0158' and exists (select 1 from public.schedules where pool_id = 'POOL_0158');

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0159', '춘천반다비국민체육센터', '강원', '춘천시', '강원특별자치도 춘천시 우두하리길 15',
    37.9030067576488, 127.740374172975, 'indoor', 'public',
    '033-240-7174', 'https://www.cuc.or.kr/bandabi.do', 7, 25, 1.2, 1.2,
    '{}', false, false, false,
    true, true, 3000, 3000, null, 'https://www.cuc.or.kr/bandabi.do')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0159', '풀스데이', $${"월":[{"start":"05:00","end":"13:00","hours":8},{"start":"14:00","end":"21:00","hours":7}],"화":[{"start":"05:00","end":"13:00","hours":8},{"start":"14:00","end":"21:00","hours":7}],"수":[{"start":"05:00","end":"13:00","hours":8},{"start":"14:00","end":"21:00","hours":7}],"목":[{"start":"05:00","end":"13:00","hours":8},{"start":"14:00","end":"21:00","hours":7}],"금":[{"start":"05:00","end":"13:00","hours":8},{"start":"14:00","end":"21:00","hours":7}],"토":[{"start":"09:00","end":"18:00","hours":9}]}$$::jsonb, '{}'::jsonb, '2026-06-11'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0159' and exists (select 1 from public.schedules where pool_id = 'POOL_0159');

-- ===== 원주 =====
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0160', '원주국민체육센터', '강원', '원주시', '강원특별자치도 원주시 남원로 551',
    37.3338307104893, 127.946303709594, 'indoor', 'public',
    '033-749-4700', 'https://cms.wfmc.kr/web/lay1/S1T155C156/sublink.do', 8, 25, 1.15, 1.35,
    '{}', true, false, false,
    true, true, 3500, 3500, null, 'https://cms.wfmc.kr/web/lay1/S1T155C156/sublink.do')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0160', '풀스데이', $${"화":[{"start":"06:00","end":"21:00","hours":15}],"수":[{"start":"06:00","end":"21:00","hours":15}],"목":[{"start":"06:00","end":"21:00","hours":15}],"금":[{"start":"06:00","end":"21:00","hours":15}],"토":[{"start":"06:00","end":"18:00","hours":12}],"일":[{"start":"06:00","end":"18:00","hours":12}]}$$::jsonb, '{}'::jsonb, '2026-06-11'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0160' and exists (select 1 from public.schedules where pool_id = 'POOL_0160');

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0161', '원주남부복합체육센터', '강원', '원주시', '강원특별자치도 원주시 이화5길 70',
    37.3397631095537, 127.930120242122, 'indoor', 'public',
    '033-737-4955', 'https://www.wonju.go.kr/www/contents.do?key=6029', 5, 25, 1.3, 1.3,
    '{}', true, false, false,
    true, true, 3500, 3500, null, 'https://www.wonju.go.kr/www/contents.do?key=6029')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0161', '풀스데이', $${"월":[{"start":"06:00","end":"20:30","hours":14.5}],"화":[{"start":"06:00","end":"20:30","hours":14.5}],"수":[{"start":"06:00","end":"20:30","hours":14.5}],"목":[{"start":"06:00","end":"20:30","hours":14.5}],"토":[{"start":"06:00","end":"17:30","hours":11.5}],"일":[{"start":"06:00","end":"17:30","hours":11.5}]}$$::jsonb, '{}'::jsonb, '2026-06-11'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0161' and exists (select 1 from public.schedules where pool_id = 'POOL_0161');

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0212', '원주근로자종합복지관', '강원', '원주시', '강원특별자치도 원주시 우산공단길 24',
    37.3752891591223, 127.940969561883, 'indoor', 'public',
    '033-749-4775', 'https://cms.wfmc.kr/web/lay1/S1T156C169/contents.do', 6, 25, 1.1, 1.6,
    '{}', false, false, false,
    true, true, 3500, 3500, null, 'https://cms.wfmc.kr/web/lay1/S1T156C169/contents.do')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0212', '풀스데이', $${"화":[{"start":"06:00","end":"20:30","hours":14.5}],"수":[{"start":"06:00","end":"20:30","hours":14.5}],"목":[{"start":"06:00","end":"20:30","hours":14.5}],"금":[{"start":"06:00","end":"20:30","hours":14.5}],"토":[{"start":"06:00","end":"17:30","hours":11.5}],"일":[{"start":"09:00","end":"17:00","hours":8}]}$$::jsonb, '{}'::jsonb, '2026-06-11'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0212' and exists (select 1 from public.schedules where pool_id = 'POOL_0212');

-- ===== 강릉 (gtdc.or.kr) =====
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0162', '강릉북부수영장', '강원', '강릉시', '강원특별자치도 강릉시 주문진읍 연주로 272',
    37.8765775464131, 128.832038400719, 'indoor', 'public',
    '033-662-0972', 'https://north.gtdc.or.kr/pub/guidepaytime.do', 6, 25, 1.2, 1.2,
    '{}', true, true, false,
    true, true, 3500, 3500, null, 'https://north.gtdc.or.kr/pub/guidepaytime.do')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0162', '풀스데이', $${"화":[{"start":"09:00","end":"18:00","hours":9}],"수":[{"start":"09:00","end":"18:00","hours":9}],"목":[{"start":"09:00","end":"18:00","hours":9}],"금":[{"start":"09:00","end":"18:00","hours":9}],"토":[{"start":"09:00","end":"18:00","hours":9}],"일":[{"start":"09:00","end":"18:00","hours":9}]}$$::jsonb, '{}'::jsonb, '2026-06-11'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0162' and exists (select 1 from public.schedules where pool_id = 'POOL_0162');

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0163', '강릉아레나수영장', '강원', '강릉시', '강원특별자치도 강릉시 수리골길 102',
    37.7793177793521, 128.897078651921, 'indoor', 'public',
    '033-651-4551', 'https://arena.gtdc.or.kr/pub/guidepaytime.do', 8, 50, 1.4, 1.5,
    '{}', true, false, false,
    true, true, 4000, 4000, null, 'https://arena.gtdc.or.kr/pub/guidepaytime.do')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0163', '풀스데이', $${"화":[{"start":"06:00","end":"22:00","hours":16}],"수":[{"start":"06:00","end":"22:00","hours":16}],"목":[{"start":"06:00","end":"22:00","hours":16}],"금":[{"start":"06:00","end":"22:00","hours":16}],"토":[{"start":"06:00","end":"22:00","hours":16}],"일":[{"start":"06:00","end":"18:00","hours":12}]}$$::jsonb, '{}'::jsonb, '2026-06-11'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0163' and exists (select 1 from public.schedules where pool_id = 'POOL_0163');

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0164', '강릉국민체육센터수영장', '강원', '강릉시', '강원특별자치도 강릉시 수리골길 76',
    37.777021472595, 128.896998952207, 'indoor', 'public',
    '033-640-4550', 'https://swim.gtdc.or.kr/pub/guidepaytime.do', 8, 25, 1.4, 1.4,
    '{}', true, true, false,
    true, true, 4000, 4000, null, 'https://swim.gtdc.or.kr/pub/guidepaytime.do')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0164', '풀스데이', $${"월":[{"start":"09:00","end":"18:00","hours":9}],"화":[{"start":"09:00","end":"18:00","hours":9}],"수":[{"start":"09:00","end":"18:00","hours":9}],"목":[{"start":"09:00","end":"18:00","hours":9}],"금":[{"start":"09:00","end":"18:00","hours":9}],"토":[{"start":"09:00","end":"18:00","hours":9}]}$$::jsonb, '{}'::jsonb, '2026-06-11'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0164' and exists (select 1 from public.schedules where pool_id = 'POOL_0164');

-- ===== 동해 (dhsisul.org) =====
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0210', '해오름스포츠센터수영장', '강원', '동해시', '강원특별자치도 동해시 갯목길 114-5',
    37.4884712262385, 129.139687218649, 'indoor', 'public',
    '033-539-3750', 'https://www.dhsisul.org', 5, 25, null, null,
    '{}', true, false, false,
    true, true, 4000, 4000, null, 'https://www.dhsisul.org')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0210', '풀스데이', $${"화":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"20:00","hours":7}],"수":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"20:00","hours":7}],"목":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"20:00","hours":7}],"금":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"20:00","hours":7}],"토":[{"start":"07:00","end":"12:00","hours":5},{"start":"13:00","end":"17:00","hours":4}],"일":[{"start":"07:00","end":"12:00","hours":5},{"start":"13:00","end":"17:00","hours":4}]}$$::jsonb, '{}'::jsonb, '2026-06-11'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0210' and exists (select 1 from public.schedules where pool_id = 'POOL_0210');

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0211', '동해근로자종합복지회관수영장', '강원', '동해시', '강원특별자치도 동해시 동굴로 2',
    37.5149691549372, 129.105028317298, 'indoor', 'public',
    '033-539-3720', 'https://www.dhsisul.org', 6, 25, null, null,
    '{}', false, false, false,
    true, true, 4000, 4000, null, 'https://www.dhsisul.org')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0211', '풀스데이', $${"화":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"20:00","hours":7}],"수":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"20:00","hours":7}],"목":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"20:00","hours":7}],"금":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"20:00","hours":7}],"토":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"19:00","hours":6}],"일":[{"start":"07:00","end":"12:00","hours":5},{"start":"13:00","end":"17:00","hours":4}]}$$::jsonb, '{}'::jsonb, '2026-06-11'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0211' and exists (select 1 from public.schedules where pool_id = 'POOL_0211');

-- ===== 속초 =====
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0213', '속초국민체육센터수영장', '강원', '속초시', '강원특별자치도 속초시 조양로 89',
    38.1867167136753, 128.590646446255, 'indoor', 'public',
    '033-631-8365', 'https://sports.sokcho.go.kr', 6, 25, 1.2, 1.3,
    '{}', true, false, false,
    true, true, 3500, 3500, null, 'https://sports.sokcho.go.kr')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0213', '풀스데이', $${"화":[{"start":"06:00","end":"16:00","hours":10},{"start":"17:00","end":"21:00","hours":4}],"수":[{"start":"06:00","end":"16:00","hours":10},{"start":"17:00","end":"21:00","hours":4}],"목":[{"start":"06:00","end":"16:00","hours":10},{"start":"17:00","end":"21:00","hours":4}],"금":[{"start":"06:00","end":"16:00","hours":10},{"start":"17:00","end":"21:00","hours":4}],"토":[{"start":"06:00","end":"17:00","hours":11}],"일":[{"start":"06:00","end":"17:00","hours":11}]}$$::jsonb, '{}'::jsonb, '2026-06-11'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0213' and exists (select 1 from public.schedules where pool_id = 'POOL_0213');

-- ===== 삼척 =====
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0214', '삼척시종합사회복지관웰빙센터수영장', '강원', '삼척시', '강원특별자치도 삼척시 원당로2길 72-6',
    37.4374107179928, 129.152846273768, 'indoor', 'public',
    '033-575-1512', 'https://www.samcheok.go.kr', 7, 25, null, null,
    '{}', true, false, false,
    true, true, 3500, 3500, null, 'https://www.samcheok.go.kr')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0214', '풀스데이', $${"화":[{"start":"06:00","end":"21:00","hours":15}],"수":[{"start":"06:00","end":"21:00","hours":15}],"목":[{"start":"06:00","end":"21:00","hours":15}],"금":[{"start":"06:00","end":"21:00","hours":15}],"토":[{"start":"09:00","end":"18:00","hours":9}],"일":[{"start":"09:00","end":"18:00","hours":9}]}$$::jsonb, '{}'::jsonb, '2026-06-11'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0214' and exists (select 1 from public.schedules where pool_id = 'POOL_0214');

-- ===== 태백 (tfmc.or.kr) =====
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0215', '태백국민체육센터수영장', '강원', '태백시', '강원특별자치도 태백시 번영로 220',
    37.1629367657819, 128.98529064571, 'indoor', 'public',
    '033-806-5041', 'https://www.tfmc.or.kr/www/contents/WWW030504.do', 6, 25, 1.2, 1.3,
    '{}', true, false, false,
    true, true, 3500, 3500, null, 'https://www.tfmc.or.kr/www/contents/WWW030504.do')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0215', '풀스데이', $${"월":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"15:00","hours":2},{"start":"18:30","end":"21:30","hours":3}],"화":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"15:00","hours":2},{"start":"15:40","end":"17:50","hours":2.17},{"start":"18:30","end":"21:30","hours":3}],"수":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"15:00","hours":2},{"start":"18:30","end":"21:30","hours":3}],"목":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"15:00","hours":2},{"start":"15:40","end":"17:50","hours":2.17},{"start":"18:30","end":"21:30","hours":3}],"금":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"15:00","hours":2},{"start":"18:30","end":"21:30","hours":3}],"토":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"17:30","hours":4.5}]}$$::jsonb, '{}'::jsonb, '2026-06-11'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0215' and exists (select 1 from public.schedules where pool_id = 'POOL_0215');

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0216', '장성국민체육센터수영장', '강원', '태백시', '강원특별자치도 태백시 장성로 105',
    37.1055986398357, 129.014083813811, 'indoor', 'public',
    '033-806-5056', 'https://www.tfmc.or.kr/www/contents/WWW03000010.do', 4, 25, 1.25, 1.25,
    '{}', true, false, false,
    true, true, 3500, 3500, null, 'https://www.tfmc.or.kr/www/contents/WWW03000010.do')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0216', '풀스데이', $${"월":[{"start":"09:00","end":"12:00","hours":3},{"start":"13:00","end":"18:00","hours":5}],"화":[{"start":"09:00","end":"12:00","hours":3},{"start":"13:00","end":"18:00","hours":5}],"수":[{"start":"09:00","end":"12:00","hours":3},{"start":"13:00","end":"18:00","hours":5}],"목":[{"start":"09:00","end":"12:00","hours":3},{"start":"13:00","end":"18:00","hours":5}],"금":[{"start":"09:00","end":"12:00","hours":3},{"start":"13:00","end":"18:00","hours":5}]}$$::jsonb, '{}'::jsonb, '2026-06-11'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0216' and exists (select 1 from public.schedules where pool_id = 'POOL_0216');
