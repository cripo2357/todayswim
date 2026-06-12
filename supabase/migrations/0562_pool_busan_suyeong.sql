-- Pool's day — 부산 수영구국민체육센터 등록 (POOL_0641, 1곳).
--
-- ## 출처 [1차 — 운영자 공식 현장 안내, 크리스 캡처 제공 2026-06-13]
-- 토요일만 일일입장(자유수영) 가능: 1회차 13:00~14:30, 2회차 15:00~16:30.
-- 입장료 성인 3,500 / 청소년 3,000 / 어린이(만3~12세) 2,500. 순번대로 결제 후 입장.
-- 공식 예약사이트(sysports.or.kr/emSolution)가 서버 다운/점검 리다이렉트라 웹 취득 불가했던 곳 —
-- 크리스 현장 방문 정보로 회수.
--
-- ## 메타
-- - 좌표: 카카오 POI(수영구국민체육센터, 광안동 1258-48).
-- - 평일 자유수영 없음 → price_weekday null. 규격 미확인 null.
--
-- ## prod 적용: scripts/apply-sql-prod.mjs (멱등). db push 금지.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0641', '수영구국민체육센터', '부산', '수영구', '부산광역시 수영구 광안동 1258-48',
    35.152949052689195, 129.10725249652094, 'indoor', 'public',
    null, 'https://www.sysports.or.kr', null, null, null, null,
    '{}', false, false, false,
    true, true, null, 3500, null, 'https://www.sysports.or.kr')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0641', '풀스데이', $${"토":[{"start":"13:00","end":"14:30","hours":1.5},{"start":"15:00","end":"16:30","hours":1.5}]}$$::jsonb, $${"토":"토요일만 일일입장 가능(1회차 13:00·2회차 15:00), 순번대로 결제 후 입장"}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0641' and exists (select 1 from public.schedules where pool_id = 'POOL_0641');
