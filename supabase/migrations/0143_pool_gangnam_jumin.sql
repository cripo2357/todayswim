-- Pool's day — Phase 2: 수영장 1곳 추가: 서울시립 강남주민편익시설 (POOL_0047). 강남구 일원동(공공).
--
-- ## 시간표·가격 출처
--
-- 공식(ykasports.com/guide/4) 일일입장 안내 — 1차.
--
-- - 자유수영 시간표: **토요일만** 운영(평일 강습·일요일은 골프장만).
--   · 토: A반 10:20~12:00, B반 13:00~14:40, C반 15:20~17:00.
--   · 운영시간은 하절기 09:00~17:00 / 동절기 10:00~18:00로 다르나 A/B/C 슬롯 고정.
-- - 가격: 일일입장 성인 6,000 / 초·중·고 5,000 / 36개월~7세 4,000(보호자 동반).
--   주말만 운영이라 단일 6,000(성인 기준).
--
-- ## 메타데이터
--
-- - 좌표 [신뢰도 높음]: 카카오 "서울 강남구 남부순환로 3318" ROAD_ADDR 정확 매치(일원동).
-- - 전화: 02-3412-2171. ownership=public(서울시립). 레인·수심 미상 → NULL. photo_url=NULL.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0047', '서울시립 강남주민편익시설', '서울', '강남구',
    '서울특별시 강남구 남부순환로 3318',
    37.4941574897199, 127.093643339766, 'indoor', 'public',
    '02-3412-2171', 'https://ykasports.com/',
    null, null, null, null,
    '{}', false, false, false,
    true, true,
    6000, 6000, 6000, null,
    'https://ykasports.com/guide/4')
on conflict (id) do nothing;

-- 자유수영 시간표(토요일만). hours: 1h40m=1.67.
insert into public.schedules (pool_id, author_nickname, by_day, updated_at) values
  ('POOL_0047', '풀스데이', $${
    "토": [
      {"start":"10:20","end":"12:00","hours":1.67},
      {"start":"13:00","end":"14:40","hours":1.67},
      {"start":"15:20","end":"17:00","hours":1.67}
    ]
  }$$::jsonb, '2026-06-04'::timestamptz)
on conflict (pool_id) do nothing;

update public.pools
set has_schedule = true
where id = 'POOL_0047'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0047');
