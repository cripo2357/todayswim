-- Pool's day — 영남 3차 배치: 헤드리스 렌더(render-js.mjs)로 JS SPA 회수 (POOL_0621~0623, 3곳).
--
-- ## 배경
-- 2차(0558)에서도 curl로 안 읽힌 JS SPA(상주 sangju.go.kr/sportspark, 칠곡 chilgoksports)를
-- 시스템 Chrome 헤드리스(playwright-core)로 렌더해 자유수영 시간표를 확보.
-- 부산 남구/동구문예는 동시 세션이 이미 등록(0606·0607)해 중복 제외. 수영구·영천은 서버다운/미게시로 잔류 보류.
--
-- ## 출처 [1차 — 운영자 공식]
-- 상주1·2 = sangju.go.kr/sportspark 세션 SPA를 헤드리스 렌더(Main/HomeF·HomeS 진입 후 program01 드릴다운).
-- 북삼 = chilgoksports 공지(Notice/Detail/184) 6월 수영 프로그램 표 이미지 VLM 판독.
--
-- ## 메타
-- - 좌표: 카카오 Local API(시설명 키워드 POI).
-- - 상주 두 센터: 시간표·요금 통합 조례(자유수영 11:20~12:00·13:00~15:10, 클린타임 12:00~13:00).
--   운영요일만 다름 — 1센터=화~금(월휴무), 2센터=월~금(월=자유수영만, 일휴무). 규격 상이(1=25m6레인, 2=50m5레인).
-- - 북삼 규격 미게시 → null.
--
-- ## prod 적용: scripts/apply-sql-prod.mjs (멱등). db push 금지.

-- 1) 상주국민체육센터 (경북 상주시) — 1센터
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0621', '상주국민체육센터', '경북', '상주시', '경상북도 상주시 영남제일로 1432',
    36.4224915312226, 128.183997350904, 'indoor', 'public',
    '054-537-7673', 'https://www.sangju.go.kr/sportspark/Main/HomeF', 6, 25, null, null,
    '{}', true, false, false,
    true, true, 3000, 3000, null, 'https://www.sangju.go.kr/sportspark/program/program01')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0621', '풀스데이', $${"화":[{"start":"11:20","end":"12:00","hours":0.67},{"start":"13:00","end":"15:10","hours":2.17}],"수":[{"start":"11:20","end":"12:00","hours":0.67},{"start":"13:00","end":"15:10","hours":2.17}],"목":[{"start":"11:20","end":"12:00","hours":0.67},{"start":"13:00","end":"15:10","hours":2.17}],"금":[{"start":"11:20","end":"12:00","hours":0.67},{"start":"13:00","end":"15:10","hours":2.17}]}$$::jsonb, $${"화":"매주 월요일 휴무, 클린타임 12:00~13:00, 1일 1회 2시간"}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0621' and exists (select 1 from public.schedules where pool_id = 'POOL_0621');

-- 2) 상주제2국민체육센터 (경북 상주시) — 2센터
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0622', '상주제2국민체육센터', '경북', '상주시', '경상북도 상주시 계산3길 59-72',
    36.4308534035082, 128.165730407539, 'indoor', 'public',
    '054-537-6136', 'https://www.sangju.go.kr/sportspark/Main/HomeS', 5, 50, null, null,
    '{}', true, false, false,
    true, true, 3000, 3000, null, 'https://www.sangju.go.kr/sportspark/program/program01')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0622', '풀스데이', $${"월":[{"start":"11:20","end":"12:00","hours":0.67},{"start":"13:00","end":"15:10","hours":2.17}],"화":[{"start":"11:20","end":"12:00","hours":0.67},{"start":"13:00","end":"15:10","hours":2.17}],"수":[{"start":"11:20","end":"12:00","hours":0.67},{"start":"13:00","end":"15:10","hours":2.17}],"목":[{"start":"11:20","end":"12:00","hours":0.67},{"start":"13:00","end":"15:10","hours":2.17}],"금":[{"start":"11:20","end":"12:00","hours":0.67},{"start":"13:00","end":"15:10","hours":2.17}]}$$::jsonb, $${"월":"월요일은 강습 없이 자유수영만 운영, 일요일 휴무, 클린타임 12:00~13:00, 1일 1회 2시간"}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0622' and exists (select 1 from public.schedules where pool_id = 'POOL_0622');

-- 3) 북삼국민체육센터 (경북 칠곡군)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0623', '북삼국민체육센터', '경북', '칠곡군', '경상북도 칠곡군 북삼읍 북삼로 65',
    36.0725581143093, 128.340314416661, 'indoor', 'public',
    '054-972-1400', 'http://www.chilgoksports.co.kr/Sports/Index?code=JB', null, null, null, null,
    '{}', false, false, false,
    true, true, 3300, 3300, null, 'http://www.chilgoksports.co.kr/Notice/Detail/184')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0623', '풀스데이', $${"월":[{"start":"08:00","end":"08:50","hours":0.83},{"start":"14:00","end":"16:50","hours":2.83}],"화":[{"start":"08:00","end":"08:50","hours":0.83},{"start":"14:00","end":"16:50","hours":2.83}],"수":[{"start":"08:00","end":"08:50","hours":0.83},{"start":"14:00","end":"16:50","hours":2.83}],"목":[{"start":"08:00","end":"08:50","hours":0.83},{"start":"14:00","end":"16:50","hours":2.83}],"금":[{"start":"08:00","end":"08:50","hours":0.83},{"start":"14:00","end":"16:50","hours":2.83}]}$$::jsonb, $${"월":"오후 자유수영은 초등 생존수영 수업일 15:00~16:50로 단축, 매월 1·3째주 일요일 휴장, 1회 2시간"}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0623' and exists (select 1 from public.schedules where pool_id = 'POOL_0623');
