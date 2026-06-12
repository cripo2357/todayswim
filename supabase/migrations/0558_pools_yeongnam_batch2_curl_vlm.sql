-- Pool's day — 영남 2차 배치: curl(원본 HTML)+VLM(이미지 판독)으로 1차 보류분 회수 (POOL_0571~0580, 10곳).
--
-- ## 배경
-- 1차(0506)에서 WebFetch만 써서 "이미지/JS라 미확보"로 보류했던 시설들을, curl 원본 HTML과
-- VLM(이미지/PDF/base64 PNG 시간표 직접 판독)으로 재시도해 자유수영 시간표를 새로 확보.
-- 양산 2곳(0516·0517)은 시간표는 이미 등록됨 → 요금만 이미지 판독으로 확보해 UPDATE.
--
-- ## 출처 [1차 — 운영자 공식]
-- 각 시설 공식 사이트 원본 HTML/요금표 이미지/공지 첨부. 첨벙·블로그 미사용.
-- 석적(칠곡)은 공지 본문에 base64 인라인 PNG 시간표 → VLM 판독. 부산북구·창녕·의령·경산은 정적 HTML 표.
--
-- ## 메타
-- - 좌표: 카카오 Local API(시설명 키워드 POI).
-- - 함양: 자유수영 시간표는 확보(공식 표), 요금은 JS 동적탭이라 미확보 → price null.
-- - 울산북구국민체육센터/부산북구국민체육센터: 동명 회피로 지역접두('울산'/'부산') 부여([[pool_name_no_spaces]] 정렬).
-- - 부산은 이번에 화명동 북구국민체육센터(정적 HTML)만 회수. 나머지(남구·수영구·동구문예·사직)는
--   JS SPA/추첨제라 헤드리스 또는 캡처 필요로 잔류 보류.
--
-- ## prod 적용: scripts/apply-sql-prod.mjs (멱등). db push 금지.

-- ── 신규 등록 10곳 ──────────────────────────────────────────────────────────

-- 1) 울주종합체육센터 (울산 울주군)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0571', '울주종합체육센터', '울산', '울주군', '울산광역시 울주군 삼남읍 향교로 113',
    35.5541065204596, 129.107627306917, 'indoor', 'public',
    '052-229-9500', 'https://www.uljusiseol.or.kr/uljusc/index_main', 8, 50, null, null,
    '{}', true, false, false,
    true, true, 3000, 3500, null, 'https://www.uljusiseol.or.kr/uljusc/guide/guide2_1')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0571', '풀스데이', $${"화":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:30","end":"21:00","hours":7.5}],"수":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:30","end":"21:00","hours":7.5}],"목":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:30","end":"21:00","hours":7.5}],"금":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:30","end":"21:00","hours":7.5}],"토":[{"start":"09:00","end":"12:00","hours":3},{"start":"13:30","end":"17:00","hours":3.5}],"일":[{"start":"09:00","end":"12:00","hours":3},{"start":"13:30","end":"17:00","hours":3.5}]}$$::jsonb, $${"화":"월요일 휴관, 수질정화 12:30~13:30 이용불가","토":"주말 09:00~13:30 아동풀 자유수영 불가"}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0571' and exists (select 1 from public.schedules where pool_id = 'POOL_0571');

-- 2) 울산북구국민체육센터 (울산 북구)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0572', '울산북구국민체육센터', '울산', '북구', '울산광역시 북구 호계로 416-31',
    35.64275885345112, 129.3470188669325, 'indoor', 'public',
    null, 'https://www.ubimc.or.kr/pageCont.do?menuNo=4020200', 6, 25, 1.15, 1.3,
    '{}', true, false, false,
    true, true, 3500, 3500, null, 'https://www.ubimc.or.kr/pageCont.do?menuNo=4020200')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0572', '풀스데이', $${"화":[{"start":"06:00","end":"14:00","hours":8},{"start":"15:00","end":"22:00","hours":7}],"수":[{"start":"06:00","end":"14:00","hours":8},{"start":"15:00","end":"22:00","hours":7}],"목":[{"start":"06:00","end":"14:00","hours":8},{"start":"15:00","end":"22:00","hours":7}],"금":[{"start":"06:00","end":"14:00","hours":8},{"start":"15:00","end":"22:00","hours":7}],"토":[{"start":"07:00","end":"12:00","hours":5},{"start":"13:00","end":"18:00","hours":5}],"일":[{"start":"07:00","end":"12:00","hours":5},{"start":"13:00","end":"18:00","hours":5}]}$$::jsonb, $${"화":"월요일 휴관, 수질정화 평일 14:00~15:00 이용불가, 자유수영 정원 90명","토":"수질정화 12:00~13:00 이용불가"}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0572' and exists (select 1 from public.schedules where pool_id = 'POOL_0572');

-- 3) 동천국민체육센터 (울산 중구)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0573', '동천국민체육센터', '울산', '중구', '울산광역시 중구 염포로 55',
    35.56365172601506, 129.3499589430853, 'indoor', 'public',
    '052-290-7284', 'https://www.uic.or.kr/dcsc/main/mainPage.do', null, null, null, null,
    '{}', false, false, false,
    true, true, 4000, 4000, null, 'https://www.uic.or.kr/dcsc/program/pg01.do')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0573', '풀스데이', $${"월":[{"start":"06:00","end":"08:00","hours":2},{"start":"12:00","end":"21:00","hours":9}],"화":[{"start":"06:00","end":"08:00","hours":2},{"start":"12:00","end":"21:00","hours":9}],"수":[{"start":"06:00","end":"08:00","hours":2},{"start":"12:00","end":"21:00","hours":9}],"목":[{"start":"06:00","end":"08:00","hours":2},{"start":"12:00","end":"21:00","hours":9}],"금":[{"start":"06:00","end":"08:00","hours":2},{"start":"12:00","end":"21:00","hours":9}],"토":[{"start":"06:00","end":"17:00","hours":11}]}$$::jsonb, $${"토":"공휴일은 07:00~17:00 운영"}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0573' and exists (select 1 from public.schedules where pool_id = 'POOL_0573');

-- 4) 부산북구국민체육센터 (부산 북구)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0574', '부산북구국민체육센터', '부산', '북구', '부산광역시 북구 화명대로94번길 83',
    35.230896713016, 129.01736567524, 'indoor', 'public',
    '051-365-7070', 'http://www.bukgusports.com/', 5, 25, null, null,
    '{}', true, false, false,
    true, true, 3300, 3300, null, 'https://www.bukgusports.com/bbs/content.php?co_id=02_03')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0574', '풀스데이', $${"월":[{"start":"08:00","end":"08:50","hours":0.83},{"start":"13:00","end":"13:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}],"화":[{"start":"08:00","end":"08:50","hours":0.83},{"start":"13:00","end":"13:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}],"수":[{"start":"08:00","end":"08:50","hours":0.83},{"start":"13:00","end":"13:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}],"목":[{"start":"08:00","end":"08:50","hours":0.83},{"start":"13:00","end":"13:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}],"금":[{"start":"08:00","end":"08:50","hours":0.83},{"start":"13:00","end":"13:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}],"토":[{"start":"09:00","end":"11:50","hours":2.83},{"start":"13:00","end":"14:50","hours":1.83},{"start":"15:40","end":"17:30","hours":1.83}],"일":[{"start":"09:00","end":"11:50","hours":2.83},{"start":"13:00","end":"14:50","hours":1.83},{"start":"15:40","end":"17:30","hours":1.83}]}$$::jsonb, $${"월":"평일 정원 08시 7명·13시 30명·18시 15명","토":"수질정화 12:00~13:00·15:00~15:40, 주말 정원 60/80/80명"}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0574' and exists (select 1 from public.schedules where pool_id = 'POOL_0574');

-- 5) 거제오션사이드수영장 (경남 거제시)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0575', '거제오션사이드수영장', '경남', '거제시', '경상남도 거제시 장승로 145',
    34.8671791566627, 128.72335921313461, 'indoor', 'public',
    null, 'https://geojeoceanside.or.kr', null, null, null, null,
    '{}', false, false, false,
    true, true, 5000, 5000, null, 'https://geojeoceanside.or.kr/guide')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0575', '풀스데이', $${"월":[{"start":"05:00","end":"12:00","hours":7},{"start":"13:00","end":"19:30","hours":6.5}],"화":[{"start":"05:00","end":"12:00","hours":7},{"start":"13:00","end":"19:30","hours":6.5}],"수":[{"start":"05:00","end":"12:00","hours":7},{"start":"13:00","end":"19:30","hours":6.5}],"목":[{"start":"05:00","end":"12:00","hours":7},{"start":"13:00","end":"19:30","hours":6.5}],"금":[{"start":"05:00","end":"12:00","hours":7},{"start":"13:00","end":"19:30","hours":6.5}],"토":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"16:30","hours":3.5}]}$$::jsonb, $${"월":"일요일·공휴일 휴관, 수질정화 12:00~13:00, 자유수영 월별 정원제(160명)"}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0575' and exists (select 1 from public.schedules where pool_id = 'POOL_0575');

-- 6) 창녕군립수영장 (경남 창녕군)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0576', '창녕군립수영장', '경남', '창녕군', '경상남도 창녕군 창녕읍 창녕대로 305',
    35.5214620283462, 128.503746101689, 'indoor', 'public',
    '055-533-4466', 'https://cfmc.kr/swimming', 6, 25, null, null,
    '{}', true, false, false,
    true, true, 3000, 3000, null, 'https://cfmc.kr/swimming/sub.html?code=02_01')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0576', '풀스데이', $${"월":[{"start":"07:10","end":"10:00","hours":2.83},{"start":"12:10","end":"12:50","hours":0.67},{"start":"16:00","end":"19:50","hours":3.83}],"화":[{"start":"07:10","end":"10:00","hours":2.83},{"start":"12:10","end":"12:50","hours":0.67},{"start":"16:00","end":"19:50","hours":3.83}],"수":[{"start":"07:10","end":"10:00","hours":2.83},{"start":"12:10","end":"12:50","hours":0.67},{"start":"16:00","end":"19:50","hours":3.83}],"목":[{"start":"07:10","end":"10:00","hours":2.83},{"start":"12:10","end":"12:50","hours":0.67},{"start":"16:00","end":"19:50","hours":3.83}],"금":[{"start":"07:10","end":"10:00","hours":2.83},{"start":"12:10","end":"12:50","hours":0.67},{"start":"16:00","end":"19:50","hours":3.83}],"토":[{"start":"09:00","end":"09:50","hours":0.83},{"start":"13:00","end":"13:50","hours":0.83}],"일":[{"start":"09:00","end":"09:50","hours":0.83},{"start":"13:00","end":"13:50","hours":0.83}]}$$::jsonb, $${"월":"평일 10:10~11:00 아쿠아로빅으로 자유수영 불가","일":"매월 2·4째주 일요일 휴관"}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0576' and exists (select 1 from public.schedules where pool_id = 'POOL_0576');

-- 7) 함양국민체육센터 (경남 함양군)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0577', '함양국민체육센터', '경남', '함양군', '경상남도 함양군 함양읍 백연리 636',
    35.51767403375336, 127.71422993933565, 'indoor', 'public',
    '055-960-4620', 'https://www.hygn.go.kr', null, null, null, null,
    '{}', false, false, false,
    true, true, null, null, null, 'https://www.hygn.go.kr/04488/04489.web')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0577', '풀스데이', $${"화":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"21:40","hours":8.67}],"수":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"21:40","hours":8.67}],"목":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"21:40","hours":8.67}],"금":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"21:40","hours":8.67}],"토":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"18:00","hours":5}],"일":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"18:00","hours":5}]}$$::jsonb, $${"화":"월요일 휴관, 청소시간 12:00~13:00 이용불가, 강습시간대 일부 레인 사용"}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0577' and exists (select 1 from public.schedules where pool_id = 'POOL_0577');

-- 8) 의령군동부국민체육센터 (경남 의령군)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0578', '의령군동부국민체육센터', '경남', '의령군', '경상남도 의령군 부림면 대한로 1668-3',
    35.4633529646696, 128.315156748699, 'indoor', 'public',
    '055-570-2863', 'https://www.uiryeong.go.kr', 4, 25, null, null,
    '{}', false, false, false,
    true, true, 3000, 3000, null, 'https://www.uiryeong.go.kr/index.uiryeong?menuCd=DOM_000000204006003015')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0578', '풀스데이', $${"월":[{"start":"08:00","end":"10:00","hours":2},{"start":"13:00","end":"16:00","hours":3},{"start":"17:00","end":"19:00","hours":2},{"start":"20:00","end":"21:10","hours":1.17}],"화":[{"start":"08:00","end":"10:00","hours":2},{"start":"13:00","end":"16:00","hours":3},{"start":"17:00","end":"19:00","hours":2},{"start":"20:00","end":"21:10","hours":1.17}],"수":[{"start":"06:00","end":"21:10","hours":15.17}],"목":[{"start":"08:00","end":"10:00","hours":2},{"start":"13:00","end":"16:00","hours":3},{"start":"17:00","end":"19:00","hours":2},{"start":"20:00","end":"21:10","hours":1.17}],"금":[{"start":"08:00","end":"10:00","hours":2},{"start":"13:00","end":"16:00","hours":3},{"start":"17:00","end":"19:00","hours":2},{"start":"20:00","end":"21:10","hours":1.17}],"토":[{"start":"09:00","end":"17:10","hours":8.17}]}$$::jsonb, $${"월":"12:00~13:00 청소 휴장, 강습시간 자유수영 불가, 1회 2시간","수":"강습 없이 종일 자유수영"}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0578' and exists (select 1 from public.schedules where pool_id = 'POOL_0578');

-- 9) 경산국민체육센터 (경북 경산시)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0579', '경산국민체육센터', '경북', '경산시', '경상북도 경산시 진량읍 해든길 46-4',
    35.8716082086707, 128.81747767156, 'indoor', 'public',
    '053-851-4270', 'https://www.gbgs.go.kr/open_content/sportslife/index.do', 6, 25, null, null,
    '{}', true, false, false,
    true, true, 3000, 3000, null, 'https://www.gbgs.go.kr/open_content/sportslife/page.do?mnu_uid=5623')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0579', '풀스데이', $${"월":[{"start":"06:00","end":"20:50","hours":14.83}],"화":[{"start":"06:00","end":"20:50","hours":14.83}],"수":[{"start":"06:00","end":"20:50","hours":14.83}],"목":[{"start":"06:00","end":"20:50","hours":14.83}],"금":[{"start":"06:00","end":"20:50","hours":14.83}],"토":[{"start":"06:00","end":"18:30","hours":12.5}]}$$::jsonb, $${"월":"일요일 휴관, 1일 1회 2시간, 관외 4,000원, 자유수영은 운영시간 내 강습과 레인 공유"}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0579' and exists (select 1 from public.schedules where pool_id = 'POOL_0579');

-- 10) 석적국민체육센터 (경북 칠곡군)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0580', '석적국민체육센터', '경북', '칠곡군', '경상북도 칠곡군 석적읍 남율로7길 5',
    36.0661069885977, 128.401047596382, 'indoor', 'public',
    '054-974-1400', 'http://www.chilgoksports.co.kr/', null, null, null, null,
    '{}', false, false, false,
    true, true, 3300, 3300, null, 'http://www.chilgoksports.co.kr/Notice/Detail/184')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0580', '풀스데이', $${"월":[{"start":"08:00","end":"08:50","hours":0.83},{"start":"14:00","end":"16:50","hours":2.83}],"화":[{"start":"08:00","end":"08:50","hours":0.83},{"start":"14:00","end":"16:50","hours":2.83}],"수":[{"start":"08:00","end":"08:50","hours":0.83},{"start":"14:00","end":"16:50","hours":2.83}],"목":[{"start":"08:00","end":"08:50","hours":0.83},{"start":"14:00","end":"16:50","hours":2.83}],"금":[{"start":"08:00","end":"08:50","hours":0.83},{"start":"14:00","end":"16:50","hours":2.83}]}$$::jsonb, $${"월":"오후 자유수영은 초등 생존수영 수업일 15:00~16:50로 단축, 1회 2시간"}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0580' and exists (select 1 from public.schedules where pool_id = 'POOL_0580');

-- ── 양산 2곳 요금 보강 (시간표는 0506에서 등록됨, 요금만 이미지 판독으로 확보) ──
update public.pools set price_weekday = 4000, price_weekend = 4000 where id = 'POOL_0516';
update public.pools set price_weekday = 4000, price_weekend = 4000 where id = 'POOL_0517';
