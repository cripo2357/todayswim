-- Pool's day — Phase 2: 수영장 1곳 추가: 한전아트센터스포츠클럽 (POOL_0040). 서초구 서초동(사설).
--
-- ## 시간표·가격 출처
--
-- 공식(kepcosc.or.kr) 자유수영 안내 — 1차. 자유수영 일일입장 일반개방.
-- 적합성: 한전아트센터 부속(준사설)이나 자유수영 일일입장 개방 → 등록. 공공보다 저렴한 편.
--
-- - 자유수영 시간표 (공식):
--   · 월~금: 12:00~13:50, 21:00~21:50
--   · 토: 14:00~15:50, 17:00~18:50
--   · 일: 09:00~10:50, 12:00~13:50, 15:00~16:50
-- - 가격: 비회원 일일 성인 평일 8,500 / 토·일 9,000.
--
-- ## 메타데이터
--
-- - 좌표 [신뢰도 높음]: 카카오 "서울 서초구 효령로72길 60" ROAD_ADDR 정확 매치(한전아트센터 2·3층).
-- - 전화: 02-2055-1331. ownership=private. 레인·수심은 공식 미기재 → NULL. photo_url=NULL.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0040', '한전아트센터스포츠클럽', '서울', '서초구',
    '서울특별시 서초구 효령로72길 60',
    37.4856046634033, 127.028078834421, 'indoor', 'private',
    '02-2055-1331', 'https://www.kepcosc.or.kr/',
    null, null, null, null,
    '{}', false, false, false,
    true, true,
    8500, 8500, 9000, null,
    'http://www.kepcosc.or.kr/theme/site/sports/swimming.php')
on conflict (id) do nothing;

-- 자유수영 시간표 (공식). hours: 50분=0.83, 1h50m=1.83.
insert into public.schedules (pool_id, author_nickname, by_day, updated_at) values
  ('POOL_0040', '풀스데이', $${
    "월": [
      {"start":"12:00","end":"13:50","hours":1.83},
      {"start":"21:00","end":"21:50","hours":0.83}
    ],
    "화": [
      {"start":"12:00","end":"13:50","hours":1.83},
      {"start":"21:00","end":"21:50","hours":0.83}
    ],
    "수": [
      {"start":"12:00","end":"13:50","hours":1.83},
      {"start":"21:00","end":"21:50","hours":0.83}
    ],
    "목": [
      {"start":"12:00","end":"13:50","hours":1.83},
      {"start":"21:00","end":"21:50","hours":0.83}
    ],
    "금": [
      {"start":"12:00","end":"13:50","hours":1.83},
      {"start":"21:00","end":"21:50","hours":0.83}
    ],
    "토": [
      {"start":"14:00","end":"15:50","hours":1.83},
      {"start":"17:00","end":"18:50","hours":1.83}
    ],
    "일": [
      {"start":"09:00","end":"10:50","hours":1.83},
      {"start":"12:00","end":"13:50","hours":1.83},
      {"start":"15:00","end":"16:50","hours":1.83}
    ]
  }$$::jsonb, '2026-06-04'::timestamptz)
on conflict (pool_id) do nothing;

update public.pools
set has_schedule = true
where id = 'POOL_0040'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0040');
