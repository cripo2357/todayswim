-- Pool's day — 봉화국민체육센터 등록 (POOL_0711, 1곳).
--
-- ## 출처 [1차 — 운영자 공식 현장 안내문, 크리스 캡처 제공 2026-06-13]
-- 자유수영: 평일 07:30~10:00·11:00~12:00·13:00~16:00·18:00~19:00·20:00~21:00 /
--   토 09:00~12:00·13:00~17:00 / 일 휴관. 강습시간 외 입장, 1회 최대 2시간.
-- 1일1회 사용료 일반 3,500원. 6레인(보조풀 있음).
--
-- ## prod 적용: scripts/apply-sql-prod.mjs (멱등). db push 금지.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0711', '봉화국민체육센터', '경북', '봉화군', '경상북도 봉화군 봉화읍 해저리 산4-7',
    36.89610572425789, 128.72873177553478, 'indoor', 'public',
    '054-679-6971', 'https://www.bonghwa.go.kr', 6, null, null, null,
    '{}', true, false, false,
    true, true, 3500, 3500, null, 'https://www.bonghwasports.co.kr')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0711', '풀스데이', $${"월":[{"start":"07:30","end":"10:00","hours":2.5},{"start":"11:00","end":"12:00","hours":1},{"start":"13:00","end":"16:00","hours":3},{"start":"18:00","end":"19:00","hours":1},{"start":"20:00","end":"21:00","hours":1}],"화":[{"start":"07:30","end":"10:00","hours":2.5},{"start":"11:00","end":"12:00","hours":1},{"start":"13:00","end":"16:00","hours":3},{"start":"18:00","end":"19:00","hours":1},{"start":"20:00","end":"21:00","hours":1}],"수":[{"start":"07:30","end":"10:00","hours":2.5},{"start":"11:00","end":"12:00","hours":1},{"start":"13:00","end":"16:00","hours":3},{"start":"18:00","end":"19:00","hours":1},{"start":"20:00","end":"21:00","hours":1}],"목":[{"start":"07:30","end":"10:00","hours":2.5},{"start":"11:00","end":"12:00","hours":1},{"start":"13:00","end":"16:00","hours":3},{"start":"18:00","end":"19:00","hours":1},{"start":"20:00","end":"21:00","hours":1}],"금":[{"start":"07:30","end":"10:00","hours":2.5},{"start":"11:00","end":"12:00","hours":1},{"start":"13:00","end":"16:00","hours":3},{"start":"18:00","end":"19:00","hours":1},{"start":"20:00","end":"21:00","hours":1}],"토":[{"start":"09:00","end":"12:00","hours":3},{"start":"13:00","end":"17:00","hours":4}]}$$::jsonb, $${"월":"강습시간 외 자유수영(1회 최대 2시간), 일요일 휴관","토":"토요일 강습 없음"}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0711' and exists (select 1 from public.schedules where pool_id = 'POOL_0711');
