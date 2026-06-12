-- Pool's day — 강원 철원국민체육센터수영장 등록 (POOL_0547).
--
-- 배경: 자유수영 시간표가 cwg.go.kr에서 클라이언트 JS 렌더라 curl로 안 잡혔음.
--   scripts/render-js.mjs(시스템 Chrome + playwright-core 헤드리스)로 렌더 후 DOM 테이블 추출해 확보.
-- 출처: 철원군 국민체육센터 공식 자유수영 페이지(요금표 포함). 요금 성인 일일 3,000(공식 SSR 텍스트 확인).
-- 자유수영(운영창): 화~금 06:00~12:00 / 13:00~18:00 / 19:00~21:00(강습 중엔 2레인 자유수영),
--   토·일 09:00~12:00(1부) / 13:00~18:00(2부), 월 휴관. 6레인 25m. 좌표=카카오 POI.
-- prod 적용=supabase-js insert(pg prune). 이 파일=source-of-record.

insert into public.pools (id, name, region, district, address, lat, lng, type, ownership, phone, website, lane_count, pool_length, depth_min, depth_max, facilities, has_kids_pool, has_diving_pool, is_hotel_pool, has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url) values
  ('POOL_0547', '철원국민체육센터수영장', '강원', '철원군', '강원특별자치도 철원군 갈말읍 군탄리 1382-6', 38.15863151921766, 127.30278394423384, 'indoor', 'public', null, 'https://www.cwg.go.kr/sports', 6, 25, null, null, '{}', false, false, false, true, true, 3000, 3000, null, 'https://www.cwg.go.kr/sports/contents.do?key=1369')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0547', '풀스데이', $${"화":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"18:00","hours":5},{"start":"19:00","end":"21:00","hours":2}],"수":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"18:00","hours":5},{"start":"19:00","end":"21:00","hours":2}],"목":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"18:00","hours":5},{"start":"19:00","end":"21:00","hours":2}],"금":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"18:00","hours":5},{"start":"19:00","end":"21:00","hours":2}],"토":[{"start":"09:00","end":"12:00","hours":3},{"start":"13:00","end":"18:00","hours":5}],"일":[{"start":"09:00","end":"12:00","hours":3},{"start":"13:00","end":"18:00","hours":5}]}$$::jsonb, '{}'::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0547' and exists (select 1 from public.schedules where pool_id = 'POOL_0547');
