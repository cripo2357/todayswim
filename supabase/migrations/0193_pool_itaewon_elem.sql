-- Pool's day — 이태원초등학교수영장(POOL_0089) 신규. 용산구 이태원동 406, 구립(용산구시설관리공단 운영, 이태원초 내), 자유수영 일일입장.
-- 공식 출처(2026-06-06, yssports.yong-san.or.kr/www/190): 주말 전용 — 토 08~17(12시 제외, 9타임) / 일(2·4주) 10·11·13·14·15·16(6타임). 평일 자유수영 없음.
-- 1회 입장권 성인 3,000·청소년 2,500·어린이 2,000(각 타임 정원 90명). 카카오 POI 좌표(서울이태원초등학교 수영장).
-- ※ 일요일은 매월 2·4주만 운영 — day_note.
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0089', '이태원초등학교수영장', '서울', '용산구',
    '서울특별시 용산구 이태원동 406',
    37.5355049701719, 126.987518040536, 'indoor', 'public',
    null, 'https://yssports.yong-san.or.kr/',
    null, null, null, null,
    '{}', false, false, false,
    true, true,
    3000, null, 3000,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0089.jpg',
    'https://yssports.yong-san.or.kr/www/190')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0089', '풀스데이', $${
    "토": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"09:00","end":"09:50","hours":0.83},{"start":"10:00","end":"10:50","hours":0.83},{"start":"11:00","end":"11:50","hours":0.83},{"start":"13:00","end":"13:50","hours":0.83},{"start":"14:00","end":"14:50","hours":0.83},{"start":"15:00","end":"15:50","hours":0.83},{"start":"16:00","end":"16:50","hours":0.83},{"start":"17:00","end":"17:50","hours":0.83}],
    "일": [{"start":"10:00","end":"10:50","hours":0.83},{"start":"11:00","end":"11:50","hours":0.83},{"start":"13:00","end":"13:50","hours":0.83},{"start":"14:00","end":"14:50","hours":0.83},{"start":"15:00","end":"15:50","hours":0.83},{"start":"16:00","end":"16:50","hours":0.83}]
  }$$::jsonb, $${
    "일": "자유수영은 매월 2·4주 일요일에만 운영"
  }$$::jsonb, '2026-06-06'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0089' and exists (select 1 from public.schedules where pool_id = 'POOL_0089');
