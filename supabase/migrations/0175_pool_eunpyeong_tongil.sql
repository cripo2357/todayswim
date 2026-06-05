-- Pool's day — 은평통일로스포츠센터(POOL_0077) 신규. 은평구, 공공, 자유수영 일일입장.
-- 공식(eptsports.or.kr)+swimmingis 확인(2026-06-05). 카카오 POI 좌표(진관동 83-7=통일로 1045).
-- 평일 08·12·13·14·18(화목 +11·21 / 금 +15) / 주말 09·10·11·12·14·15·16·17.
-- 평일 성인4000·주말5000. ★매월 넷째 주 일요일 자유수영 미운영 → day_note.
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url
) values
  ('POOL_0077', '은평통일로스포츠센터', '서울', '은평구',
    '서울특별시 은평구 통일로 1045',
    37.636389066515264, 126.91645552782772, 'indoor', 'public',
    '0507-1374-7330', 'https://www.eptsports.or.kr/',
    null, null, null, null,
    '{}', false, false, false,
    true, true,
    4000, 4000, 5000,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0077.jpg')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0077', '풀스데이', $${
    "월": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"12:50","hours":0.83},{"start":"13:00","end":"13:50","hours":0.83},{"start":"14:00","end":"14:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}],
    "화": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"11:00","end":"11:50","hours":0.83},{"start":"12:00","end":"12:50","hours":0.83},{"start":"13:00","end":"13:50","hours":0.83},{"start":"14:00","end":"14:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83},{"start":"21:00","end":"21:50","hours":0.83}],
    "수": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"12:50","hours":0.83},{"start":"13:00","end":"13:50","hours":0.83},{"start":"14:00","end":"14:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}],
    "목": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"11:00","end":"11:50","hours":0.83},{"start":"12:00","end":"12:50","hours":0.83},{"start":"13:00","end":"13:50","hours":0.83},{"start":"14:00","end":"14:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83},{"start":"21:00","end":"21:50","hours":0.83}],
    "금": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"12:50","hours":0.83},{"start":"13:00","end":"13:50","hours":0.83},{"start":"14:00","end":"14:50","hours":0.83},{"start":"15:00","end":"15:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}],
    "토": [{"start":"09:00","end":"09:50","hours":0.83},{"start":"10:00","end":"10:50","hours":0.83},{"start":"11:00","end":"11:50","hours":0.83},{"start":"12:00","end":"12:50","hours":0.83},{"start":"14:00","end":"14:50","hours":0.83},{"start":"15:00","end":"15:50","hours":0.83},{"start":"16:00","end":"16:50","hours":0.83},{"start":"17:00","end":"17:50","hours":0.83}],
    "일": [{"start":"09:00","end":"09:50","hours":0.83},{"start":"10:00","end":"10:50","hours":0.83},{"start":"11:00","end":"11:50","hours":0.83},{"start":"12:00","end":"12:50","hours":0.83},{"start":"14:00","end":"14:50","hours":0.83},{"start":"15:00","end":"15:50","hours":0.83},{"start":"16:00","end":"16:50","hours":0.83},{"start":"17:00","end":"17:50","hours":0.83}]
  }$$::jsonb, $${
    "일": "매월 넷째 주 일요일은 자유수영을 운영하지 않습니다."
  }$$::jsonb, '2026-06-05'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0077' and exists (select 1 from public.schedules where pool_id = 'POOL_0077');
