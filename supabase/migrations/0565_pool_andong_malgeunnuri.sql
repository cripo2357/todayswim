-- Pool's day — 맑은누리스포츠센터(경북도청신도시) 등록 (POOL_0661, 1곳).
--
-- ## 출처 [1차 — 운영자 공식 안내(andongsisul.or.kr) + 현장 안내판, 크리스 캡처 제공 2026-06-13]
-- 경북도청신도시 맑은누리파크 주민편익시설 → '맑은누리스포츠센터'. 안동시시설관리공단 운영.
-- 행정구역=안동시 풍천면(도청신도시가 안동·예천 걸침, 수영장 건물은 안동쪽). 수영장 25m·6레인.
--
-- ## 자유수영 (월회원/1일권 동일 타임, 1일권 5,000원)
-- 평일 3타임: 1타임 08:30~10:30 / 2타임 11:30~16:30 / 3타임 17:30~20:20 (위 시간에만 자유수영 가능).
-- 토·국가공휴일 09:30~17:00 (동시간 120명 제한). 매주 일요일 정기휴관. 50분 수영·10분 휴식.
--
-- ## prod 적용: scripts/apply-sql-prod.mjs (멱등). db push 금지.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0661', '맑은누리스포츠센터', '경북', '안동시', '경상북도 안동시 풍천면 도양리 1424',
    36.56150961541541, 128.47832572771898, 'indoor', 'public',
    null, 'https://www.andongsisul.or.kr', 6, 25, null, null,
    '{}', false, false, false,
    true, true, 5000, 5000, null, 'https://www.andongsisul.or.kr')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0661', '풀스데이', $${"월":[{"start":"08:30","end":"10:30","hours":2},{"start":"11:30","end":"16:30","hours":5},{"start":"17:30","end":"20:20","hours":2.83}],"화":[{"start":"08:30","end":"10:30","hours":2},{"start":"11:30","end":"16:30","hours":5},{"start":"17:30","end":"20:20","hours":2.83}],"수":[{"start":"08:30","end":"10:30","hours":2},{"start":"11:30","end":"16:30","hours":5},{"start":"17:30","end":"20:20","hours":2.83}],"목":[{"start":"08:30","end":"10:30","hours":2},{"start":"11:30","end":"16:30","hours":5},{"start":"17:30","end":"20:20","hours":2.83}],"금":[{"start":"08:30","end":"10:30","hours":2},{"start":"11:30","end":"16:30","hours":5},{"start":"17:30","end":"20:20","hours":2.83}],"토":[{"start":"09:30","end":"17:00","hours":7.5}]}$$::jsonb, $${"월":"자유수영 1·2·3타임만 가능, 타임별 현장 발권, 50분 수영·10분 휴식, 매주 일요일 휴관","토":"토·공휴일 09:30~17:00, 동시간 120명 제한"}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0661' and exists (select 1 from public.schedules where pool_id = 'POOL_0661');
