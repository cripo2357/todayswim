-- Pool's day — 갈월종합사회복지관(POOL_0085) 신규. 용산구 갈월동, 구립 위탁(공공), 자유수영 일일입장.
-- 크리스 제공 공식 캡처+현장 후기(2026-06-06): 자유수영 월~금 08·12·14·18(주말 없음).
-- 일일입장 비회원 성인5,000·청소년4,500·어린이4,000 / 회원 성인4,500. 월정기(자유) 성인61,000.
-- 후기: 25m 4~5레인 + 무릎높이 유아풀, 수심 1.2~1.5m, 락스풀, 사우나·온수풀 없음, 공립 기본관리.
-- 2025년 새 단장 후 재개관. 카카오 POI 좌표(갈월동 51-19 = 두텁바위로 25).
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url
) values
  ('POOL_0085', '갈월종합사회복지관', '서울', '용산구',
    '서울특별시 용산구 두텁바위로 25',
    37.54589688815525, 126.97485835152985, 'indoor', 'public',
    '02-752-7887', 'https://galwol.or.kr/',
    null, 25, 1.2, 1.5,
    '{}', true, false, false,
    true, true,
    5000, 5000, null,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0085.jpg')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0085', '풀스데이', $${
    "월": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"12:50","hours":0.83},{"start":"14:00","end":"14:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}],
    "화": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"12:50","hours":0.83},{"start":"14:00","end":"14:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}],
    "수": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"12:50","hours":0.83},{"start":"14:00","end":"14:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}],
    "목": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"12:50","hours":0.83},{"start":"14:00","end":"14:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}],
    "금": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"12:50","hours":0.83},{"start":"14:00","end":"14:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}]
  }$$::jsonb, '{}'::jsonb, '2026-06-06'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0085' and exists (select 1 from public.schedules where pool_id = 'POOL_0085');
