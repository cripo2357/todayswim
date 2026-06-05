-- Pool's day — 고양어울림누리꽃우물수영장(POOL_0083) 신규. 경기 고양시 덕양구 성사동, 공공(고양도시관리공사), 자유수영 일일입장.
-- ★서울 외 첫 등록(크리스 제공, 고양 확장 시작). 크리스 제공 공식 캡처(2026-06-06).
-- 평일(월~금) 1부 08·2부 12·3부 18 / 토·일·공휴일 1부 09~11:50·2부 13~14:50·3부 16~17:50(각 3시간 운영).
-- 일일 비회원 일반4000·청소년/군인3500·어린이3000(평일/주말 동일). 카카오 POI 좌표(성사동 826 = 어울림로 33).
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url
) values
  ('POOL_0083', '고양어울림누리꽃우물수영장', '경기', '고양시 덕양구',
    '경기도 고양시 덕양구 어울림로 33',
    37.6490933295185, 126.833503610747, 'indoor', 'public',
    '031-960-0481', 'https://spart.gys.or.kr/',
    null, null, null, null,
    '{}', false, false, false,
    true, true,
    4000, 4000, 4000,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0083.jpg')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0083', '풀스데이', $${
    "월": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"12:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}],
    "화": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"12:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}],
    "수": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"12:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}],
    "목": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"12:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}],
    "금": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"12:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}],
    "토": [{"start":"09:00","end":"11:50","hours":2.83},{"start":"13:00","end":"14:50","hours":1.83},{"start":"16:00","end":"17:50","hours":1.83}],
    "일": [{"start":"09:00","end":"11:50","hours":2.83},{"start":"13:00","end":"14:50","hours":1.83},{"start":"16:00","end":"17:50","hours":1.83}]
  }$$::jsonb, $${
    "월": "만 4세 미만 입장 불가(4~7세 보호자 동반). 종료 35분 전 입장 마감.",
    "화": "만 4세 미만 입장 불가(4~7세 보호자 동반). 종료 35분 전 입장 마감.",
    "수": "만 4세 미만 입장 불가(4~7세 보호자 동반). 종료 35분 전 입장 마감.",
    "목": "만 4세 미만 입장 불가(4~7세 보호자 동반). 종료 35분 전 입장 마감.",
    "금": "만 4세 미만 입장 불가(4~7세 보호자 동반). 종료 35분 전 입장 마감.",
    "토": "만 4세 미만 입장 불가(4~7세 보호자 동반). 종료 35분 전 입장 마감.",
    "일": "만 4세 미만 입장 불가(4~7세 보호자 동반). 종료 35분 전 입장 마감."
  }$$::jsonb, '2026-06-06'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0083' and exists (select 1 from public.schedules where pool_id = 'POOL_0083');
