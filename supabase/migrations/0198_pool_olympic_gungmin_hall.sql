-- Pool's day — 올림픽기념국민생활관(POOL_0093) 신규. 종로구 혜화동, 공공(한국체육산업개발/국민체육진흥공단 계열), 자유수영 일일입장.
-- 크리스 제공 공식 캡처(2026-06-06, omc.dpfc.or.kr): 주말수영(B1) 자유수영(일일입장) — 토·일 15:00~15:50·16:00~16:50. 성인 5,500·청소년 4,180·초등생 2,750. 정원 120명.
--   ※ 토·일 오전(09~14:50)은 강습. 평일 자유수영 일일입장 여부 미확정(공식 사이트 인코딩 문제) → 확인되면 후속 추가.
-- 카카오 POI 좌표(올림픽기념국민생활관, 혜화동 1-21).
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0093', '올림픽기념국민생활관', '서울', '종로구',
    '서울특별시 종로구 혜화동 1-21',
    37.5903871234504, 126.998908499008, 'indoor', 'public',
    null, 'https://omc.dpfc.or.kr/',
    null, null, null, null,
    '{}', false, false, false,
    true, true,
    5500, null, 5500,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0093.jpg',
    'https://omc.dpfc.or.kr/01_class/swimming.php')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0093', '풀스데이', $${
    "토": [{"start":"15:00","end":"15:50","hours":0.83},{"start":"16:00","end":"16:50","hours":0.83}],
    "일": [{"start":"15:00","end":"15:50","hours":0.83},{"start":"16:00","end":"16:50","hours":0.83}]
  }$$::jsonb, $${
    "토": "자유수영 일일입장은 주말 오후 2타임(15·16시)만 — 오전은 강습"
  }$$::jsonb, '2026-06-06'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0093' and exists (select 1 from public.schedules where pool_id = 'POOL_0093');
