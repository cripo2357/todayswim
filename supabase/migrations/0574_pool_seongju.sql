-- Pool's day — 성주국민체육센터 등록 (POOL_0701, 1곳).
--
-- ## 출처 [1차 — 운영자 공식(sj.go.kr), 크리스 캡처 제공 2026-06-13]
-- 자유수영: 월~금 07:30~09:20·10:20~11:10·14:30~18:50 / 토 06:00~17:30(수질관리 11:50~12:50) / 일·공휴일 휴관.
-- 수질관리 화~금 13:10~14:30·토 11:50~12:50. 1일권 성인 4,000원. 수영풀 25m·6레인+유아풀.
--
-- ## prod 적용: scripts/apply-sql-prod.mjs (멱등). db push 금지.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0701', '성주국민체육센터', '경북', '성주군', '경상북도 성주군 성주읍 성주순환로 271-15',
    35.919716476364, 128.294067858763, 'indoor', 'public',
    '054-933-5605', 'https://sj.go.kr', 6, 25, null, null,
    '{}', true, false, false,
    true, true, 4000, 4000, null, 'https://sj.go.kr/page.do?mnu_uid=3817')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0701', '풀스데이', $${"월":[{"start":"07:30","end":"09:20","hours":1.83},{"start":"10:20","end":"11:10","hours":0.83},{"start":"14:30","end":"18:50","hours":4.33}],"화":[{"start":"07:30","end":"09:20","hours":1.83},{"start":"10:20","end":"11:10","hours":0.83},{"start":"14:30","end":"18:50","hours":4.33}],"수":[{"start":"07:30","end":"09:20","hours":1.83},{"start":"10:20","end":"11:10","hours":0.83},{"start":"14:30","end":"18:50","hours":4.33}],"목":[{"start":"07:30","end":"09:20","hours":1.83},{"start":"10:20","end":"11:10","hours":0.83},{"start":"14:30","end":"18:50","hours":4.33}],"금":[{"start":"07:30","end":"09:20","hours":1.83},{"start":"10:20","end":"11:10","hours":0.83},{"start":"14:30","end":"18:50","hours":4.33}],"토":[{"start":"06:00","end":"11:50","hours":5.83},{"start":"12:50","end":"17:30","hours":4.67}]}$$::jsonb, $${"월":"입장 시간에 맞춰서만 입장 가능, 일요일·공휴일 휴관","토":"수질관리 11:50~12:50 이용 제한"}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0701' and exists (select 1 from public.schedules where pool_id = 'POOL_0701');
