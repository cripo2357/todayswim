-- Pool's day — 울산 문수실내수영장 등록 (POOL_0631, 1곳).
--
-- ## 출처 [1차 — 운영자 공식 현장 안내판, 크리스 캡처 제공 2026-06-13]
-- 화~금 06:00~21:30 / 토 07:00~17:30 (각 12:00~13:00 휴게) / 일 정기휴무.
-- 일일 자유 입장권 4,000원. 안내판 화~금·토만 표기 → 월요일 자유수영은 안내판 미표기로 슬롯 미포함.
--
-- ## 메타
-- - 좌표: 카카오 POI(문수실내수영장, 옥동 산 5 = 문수경기장 단지 내). 안내판 주소=문수로 44(경기장 정문).
-- - 규격: 본풀 50m·10레인, 연습풀 25m·4레인, **다이빙풀 보유**(has_diving_pool=true) — 크리스 확인.
-- - 1차 보류(공식 웹에 자유수영 시간표 미게시)였으나 운영자 안내판 캡처로 회수.
--
-- ## prod 적용: scripts/apply-sql-prod.mjs (멱등). db push 금지.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0631', '문수실내수영장', '울산', '남구', '울산광역시 남구 문수로 44',
    35.53259336436829, 129.26211146817386, 'indoor', 'public',
    '052-220-2215', 'https://www.uic.or.kr/munsu', 10, 50, null, null,
    '{}', false, true, false,
    true, true, 4000, 4000, null, 'https://www.uic.or.kr/munsu')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0631', '풀스데이', $${"화":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"21:30","hours":8.5}],"수":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"21:30","hours":8.5}],"목":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"21:30","hours":8.5}],"금":[{"start":"06:00","end":"12:00","hours":6},{"start":"13:00","end":"21:30","hours":8.5}],"토":[{"start":"07:00","end":"12:00","hours":5},{"start":"13:00","end":"17:30","hours":4.5}]}$$::jsonb, $${"화":"12:00~13:00 휴게시간, 일요일 정기휴무"}$$::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0631' and exists (select 1 from public.schedules where pool_id = 'POOL_0631');
