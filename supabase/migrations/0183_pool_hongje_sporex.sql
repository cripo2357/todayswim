-- Pool's day — 홍제스포렉스(POOL_0082) 신규. 서대문구 홍은동, 사설, 자유수영 일일입장.
-- 크리스 제공 공식 캡처(2026-06-06): 요일별 상이(불광과 동일 운영사 계열이나 시간 다름).
-- 월~목 08·11~12:50·22 / 금 06~13:50·19~21:50 / 토 08~09:50·14~16:50 / 일·공휴일 10~11:50·13~15:40.
-- ★일요일 자유수영은 쿠폰만 입장(일일입장 불가). 초등학생까지는 주말 보호자 동반만 입장 → day_note.
-- 일일입장 요금 미표시 → null(추후 확인). 카카오 POI 좌표(홍은동 48).
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url
) values
  ('POOL_0082', '홍제스포렉스', '서울', '서대문구',
    '서울특별시 서대문구 홍은동 48-112',
    37.59258410207258, 126.94426274525092, 'indoor', 'private',
    null, null,
    null, null, null, null,
    '{}', false, false, false,
    true, true,
    null, null, null,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0082.jpg')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0082', '풀스데이', $${
    "월": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"11:00","end":"12:50","hours":1.83},{"start":"22:00","end":"22:50","hours":0.83}],
    "화": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"11:00","end":"12:50","hours":1.83},{"start":"22:00","end":"22:50","hours":0.83}],
    "수": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"11:00","end":"12:50","hours":1.83},{"start":"22:00","end":"22:50","hours":0.83}],
    "목": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"11:00","end":"12:50","hours":1.83},{"start":"22:00","end":"22:50","hours":0.83}],
    "금": [{"start":"06:00","end":"13:50","hours":7.83},{"start":"19:00","end":"21:50","hours":2.83}],
    "토": [{"start":"08:00","end":"09:50","hours":1.83},{"start":"14:00","end":"16:50","hours":2.83}],
    "일": [{"start":"10:00","end":"11:50","hours":1.83},{"start":"13:00","end":"15:40","hours":2.67}]
  }$$::jsonb, $${
    "토": "초등학생 이하는 주말에 보호자 동반 시에만 입장 가능합니다.",
    "일": "일요일·공휴일 자유수영은 쿠폰만 입장 가능합니다(일일입장 불가). 초등학생 이하는 보호자 동반 시에만 입장 가능합니다."
  }$$::jsonb, '2026-06-06'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0082' and exists (select 1 from public.schedules where pool_id = 'POOL_0082');
