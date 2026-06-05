-- Pool's day — 삼정스포츠(POOL_0084) 신규. 은평구 대조동(삼성타운아파트 지하2층), 사설, 자유수영 일일입장.
-- 크리스 제공 공식 운영시간표+요금보드(2026-06-06)를 정본 채택(먼저 받은 캡처는 화목 13:00이 생존수영이었으나
--   이 보드는 자유수영 + 요금표 포함 최신본). 자유수영(노랑) 셀만 추출.
-- 월수금 06·08·18 / 화목 06·08·13·18 / 토 06 (토·공휴일 06:00~14:00 개장, 다섯째 토요일 휴장, 일요일 휴무).
-- 일일입장 성인(중학생 이상) 15,000원. 카카오 POI 좌표(대조동 231 = 서오릉로 94).
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url
) values
  ('POOL_0084', '삼정스포츠', '서울', '은평구',
    '서울특별시 은평구 서오릉로 94',
    37.6086544991748, 126.921139029811, 'indoor', 'private',
    null, null,
    null, null, null, null,
    '{}', false, false, false,
    true, true,
    15000, 15000, 15000,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0084.jpg')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0084', '풀스데이', $${
    "월": [{"start":"06:00","end":"06:50","hours":0.83},{"start":"08:00","end":"08:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}],
    "화": [{"start":"06:00","end":"06:50","hours":0.83},{"start":"08:00","end":"08:50","hours":0.83},{"start":"13:00","end":"13:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}],
    "수": [{"start":"06:00","end":"06:50","hours":0.83},{"start":"08:00","end":"08:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}],
    "목": [{"start":"06:00","end":"06:50","hours":0.83},{"start":"08:00","end":"08:50","hours":0.83},{"start":"13:00","end":"13:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}],
    "금": [{"start":"06:00","end":"06:50","hours":0.83},{"start":"08:00","end":"08:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}],
    "토": [{"start":"06:00","end":"06:50","hours":0.83}]
  }$$::jsonb, $${
    "토": "토요일·공휴일은 06:00~14:00 개장하며, 다섯째 주 토요일은 휴장합니다. 공휴일은 자유수영으로 운영됩니다."
  }$$::jsonb, '2026-06-06'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0084' and exists (select 1 from public.schedules where pool_id = 'POOL_0084');
