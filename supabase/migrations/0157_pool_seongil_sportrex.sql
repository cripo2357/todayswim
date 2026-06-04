-- Pool's day — 성일스포렉스(POOL_0063) 신규. 강동구 사설, 자유수영 일일입장 개방.
-- 카카오 좌표(2026-06-05, keyword POI). 시간표·요금=swimmingis(자유수영 DB, 2차) 기준.
-- ★사설 일일개방 → [[pool_eligibility_exceptions]] 등록 대상. 비회원 성인 15000(대표가).
-- ※시간표 2차 출처 — 현장 확인 시 정정 가능. 사진 POOL_0063.jpg 업로드 후 적용.
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url
) values
  ('POOL_0063', '성일스포렉스', '서울', '강동구',
    '서울특별시 강동구 성내로15길 33',
    37.5287136763014, 127.128202238486, 'indoor', 'private',
    '02-475-8008', 'https://www.davinsport.com/',
    6, 25, 1.2, 1.2,
    '{}', false, false, false,
    true, true,
    15000, 15000, 15000,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0063.jpg')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, updated_at) values
  ('POOL_0063', '풀스데이', $${
    "월": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"13:00","end":"13:50","hours":0.83},{"start":"20:00","end":"21:50","hours":1.83}],
    "화": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"13:00","end":"13:50","hours":0.83},{"start":"20:00","end":"21:50","hours":1.83}],
    "수": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"13:00","end":"13:50","hours":0.83},{"start":"20:00","end":"21:50","hours":1.83}],
    "목": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"13:00","end":"13:50","hours":0.83},{"start":"20:00","end":"21:50","hours":1.83}],
    "금": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"13:00","end":"13:50","hours":0.83},{"start":"20:00","end":"21:50","hours":1.83}],
    "토": [{"start":"08:00","end":"12:00","hours":4},{"start":"13:00","end":"18:00","hours":5}]
  }$$::jsonb, '2026-06-05'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0063' and exists (select 1 from public.schedules where pool_id = 'POOL_0063');
