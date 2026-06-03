-- Pool's day — Phase 2: 수영장 1곳 추가: 코오롱스포렉스 서초점 (POOL_0042). 서초구(사설).
--
-- ## 시간표·가격 출처
--
-- 공식(seocho.sporex.com) 일일 자유수영 안내 — 1차. 자유수영 일일입장 일반개방.
--
-- - 자유수영 시간표 (공식):
--   · 평일: 12:00~14:00, 21:00~22:00
--   · 토요일: 07:00~15:00, 18:00~20:00
--   · 일요일·공휴일: 09:00~18:00
-- - 가격: 일일 성인 16,000 / 어린이 12,000 (평일·주말 동일).
--
-- ## 메타데이터
--
-- - 좌표 [신뢰도 높음]: 카카오 "서울 서초구 서초대로70길 32" ROAD_ADDR 정확 매치.
-- - 전화: 02-580-8200. ownership=private. 레인·수심은 미확보 → NULL. photo_url=NULL.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0042', '코오롱스포렉스 서초점', '서울', '서초구',
    '서울특별시 서초구 서초대로70길 32',
    37.4939058491626, 127.023431961533, 'indoor', 'private',
    '02-580-8200', 'http://seocho.sporex.com/',
    null, null, null, null,
    '{}', false, false, false,
    true, true,
    16000, 16000, 16000, null,
    'https://seocho.sporex.com/sub_intro2/program.php#8')
on conflict (id) do nothing;

-- 자유수영 시간표 (공식). hours = (종료 - 시작) 시간.
insert into public.schedules (pool_id, author_nickname, by_day, updated_at) values
  ('POOL_0042', '풀스데이', $${
    "월": [
      {"start":"12:00","end":"14:00","hours":2},
      {"start":"21:00","end":"22:00","hours":1}
    ],
    "화": [
      {"start":"12:00","end":"14:00","hours":2},
      {"start":"21:00","end":"22:00","hours":1}
    ],
    "수": [
      {"start":"12:00","end":"14:00","hours":2},
      {"start":"21:00","end":"22:00","hours":1}
    ],
    "목": [
      {"start":"12:00","end":"14:00","hours":2},
      {"start":"21:00","end":"22:00","hours":1}
    ],
    "금": [
      {"start":"12:00","end":"14:00","hours":2},
      {"start":"21:00","end":"22:00","hours":1}
    ],
    "토": [
      {"start":"07:00","end":"15:00","hours":8},
      {"start":"18:00","end":"20:00","hours":2}
    ],
    "일": [
      {"start":"09:00","end":"18:00","hours":9}
    ]
  }$$::jsonb, '2026-06-04'::timestamptz)
on conflict (pool_id) do nothing;

update public.pools
set has_schedule = true
where id = 'POOL_0042'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0042');
