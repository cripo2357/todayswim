-- Pool's day — 영남 보류분 운영자 캡처 회수 5곳 (POOL_0651~0655).
--
-- ## 출처 [1차 — 운영자 공식(현장 안내판/공식 페이지), 크리스 캡처 제공 2026-06-13]
-- 사직(busan.go.kr/stadium/freeswim01)·밀양(myfmc.or.kr 스포츠파크)·하동(군 안내판)·
-- 고성군문화체육센터(경남, 안내판)·영천시종합스포츠센터(ycsports.kr).
--
-- ## 메타
-- - 좌표: 카카오 POI. 고성=경남 고성군(기월리)으로, 강원 고성(POOL_0541)과 별개.
-- - 사직: 자유수영 추첨/온라인 신청 당첨제(회차·인원 제한, 월별 변동) — 운영시간 블록으로 등록 + day_note 안내.
--   본풀 50m·10레인+다이빙풀 보유(has_diving_pool=true).
-- - 영천: "자유수영 평일06:00~21:00, 토·공휴일06:00~19:00" 블록형(강습과 레인 공유).
--
-- ## prod 적용: scripts/apply-sql-prod.mjs (멱등). db push 금지.

-- 1) 사직실내수영장 (부산 동래구) — 부산시 체육시설관리사업소, 다이빙풀 보유
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0651', '사직실내수영장', '부산', '동래구', '부산광역시 동래구 사직동 930-2',
    35.1927709876713, 129.063411663666, 'indoor', 'public',
    '051-500-2354', 'https://www.busan.go.kr/stadium/freeswim01', 10, 50, 1.5, 2.0,
    '{}', false, true, false,
    true, true, 3000, 3000, null, 'https://www.busan.go.kr/stadium/freeswim01')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0651', '풀스데이', $${"화":[{"start":"06:00","end":"21:00","hours":15}],"수":[{"start":"06:00","end":"21:00","hours":15}],"목":[{"start":"06:00","end":"21:00","hours":15}],"금":[{"start":"06:00","end":"21:00","hours":15}],"토":[{"start":"06:00","end":"21:00","hours":15}],"일":[{"start":"06:00","end":"18:00","hours":12}]}$$::jsonb, $${"화":"자유수영 추첨·온라인 신청 당첨제(회차·인원 제한, 월별 시간 변동·공지 확인), 매주 월요일 휴무"}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0651' and exists (select 1 from public.schedules where pool_id = 'POOL_0651');

-- 2) 밀양스포츠센터 (경남 밀양시)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0652', '밀양스포츠센터', '경남', '밀양시', '경상남도 밀양시 시청로 28',
    35.50560772172588, 128.74487637376086, 'indoor', 'public',
    '055-359-4635', 'https://www.myfmc.or.kr', 7, 25, null, null,
    '{}', true, false, false,
    true, true, 3500, 3500, null, 'https://www.myfmc.or.kr')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0652', '풀스데이', $${"월":[{"start":"06:00","end":"21:00","hours":15}],"화":[{"start":"06:00","end":"21:00","hours":15}],"수":[{"start":"06:00","end":"21:00","hours":15}],"목":[{"start":"06:00","end":"21:00","hours":15}],"금":[{"start":"06:00","end":"21:00","hours":15}],"토":[{"start":"08:00","end":"16:00","hours":8}],"일":[{"start":"08:00","end":"16:00","hours":8}]}$$::jsonb, $${"일":"매월 2·4째주 일요일 정기휴관"}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0652' and exists (select 1 from public.schedules where pool_id = 'POOL_0652');

-- 3) 하동국민체육센터 (경남 하동군)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0653', '하동국민체육센터', '경남', '하동군', '경상남도 하동군 적량면 공설운동장로 207',
    35.0626758549214, 127.778811801473, 'indoor', 'public',
    '055-880-6445', 'https://www.hadong.go.kr', null, null, null, null,
    '{}', false, false, false,
    true, true, 3000, 3000, null, 'https://www.hadong.go.kr')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0653', '풀스데이', $${"월":[{"start":"06:00","end":"11:30","hours":5.5},{"start":"13:00","end":"21:30","hours":8.5}],"화":[{"start":"06:00","end":"11:30","hours":5.5},{"start":"13:00","end":"21:30","hours":8.5}],"수":[{"start":"06:00","end":"11:30","hours":5.5},{"start":"13:00","end":"21:30","hours":8.5}],"목":[{"start":"06:00","end":"11:30","hours":5.5},{"start":"13:00","end":"21:30","hours":8.5}],"금":[{"start":"06:00","end":"11:30","hours":5.5},{"start":"13:00","end":"21:30","hours":8.5}],"토":[{"start":"09:00","end":"11:30","hours":2.5},{"start":"13:00","end":"18:00","hours":5}]}$$::jsonb, $${"월":"수질관리·방역 11:30~13:00 이용불가, 1회 2시간, 일요일 휴무"}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0653' and exists (select 1 from public.schedules where pool_id = 'POOL_0653');

-- 4) 고성군문화체육센터 (경남 고성군)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0654', '고성군문화체육센터', '경남', '고성군', '경상남도 고성군 고성읍 송학고분로 193',
    34.9813321132443, 128.312069079251, 'indoor', 'public',
    '055-673-6212', 'https://www.goseong.go.kr', 6, 25, 0.7, 1.4,
    '{}', true, false, false,
    true, true, 3500, 3500, null, 'https://www.goseong.go.kr')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0654', '풀스데이', $${"화":[{"start":"06:00","end":"20:00","hours":14}],"수":[{"start":"06:00","end":"20:00","hours":14}],"목":[{"start":"06:00","end":"20:00","hours":14}],"금":[{"start":"06:00","end":"20:00","hours":14}],"토":[{"start":"06:00","end":"18:00","hours":12}],"일":[{"start":"06:00","end":"18:00","hours":12}]}$$::jsonb, $${"화":"매주 월요일 휴관, 운영종료 30분 전까지 입장"}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0654' and exists (select 1 from public.schedules where pool_id = 'POOL_0654');

-- 5) 영천시종합스포츠센터 (경북 영천시)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0655', '영천시종합스포츠센터', '경북', '영천시', '경상북도 영천시 교촌동 331',
    35.9713412276647, 128.923189916066, 'indoor', 'public',
    '054-337-7330', 'https://www.ycsports.kr', 8, 50, null, null,
    '{}', false, false, false,
    true, true, 5000, 5000, null, 'https://www.ycsports.kr')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0655', '풀스데이', $${"월":[{"start":"06:00","end":"21:00","hours":15}],"화":[{"start":"06:00","end":"21:00","hours":15}],"수":[{"start":"06:00","end":"21:00","hours":15}],"목":[{"start":"06:00","end":"21:00","hours":15}],"금":[{"start":"06:00","end":"21:00","hours":15}],"토":[{"start":"06:00","end":"19:00","hours":13}]}$$::jsonb, $${"월":"일요일 휴관(공휴일은 06:00~19:00 자유수영), 일일이용 3시간 기준, 강습시간 레인 일부 사용"}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0655' and exists (select 1 from public.schedules where pool_id = 'POOL_0655');
