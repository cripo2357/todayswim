-- Pool's day — 고척체육센터(POOL_0066) 신규. 구로구 공공, 자유수영 일일입장 개방.
-- 카카오 POI 좌표(고척동 63-6 = 경인로 430). 시간표·요금=swimmingis/cbswim + 공식 프로그램 안내.
-- 자유수영: 평일 13·14시(월수금 18시 추가) / 토 10·11·13·14·15·16시. 평일 3500·주말 4550.
-- ※평일 자유수영은 신규 강습 개설 시 축소·종료 가능 → 평일 day_note 명시. 사진 POOL_0066.jpg 업로드 후 표시.
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url
) values
  ('POOL_0066', '고척체육센터', '서울', '구로구',
    '서울특별시 구로구 경인로 430',
    37.49893372792476, 126.86772663591528, 'indoor', 'public',
    '02-2128-2310', 'https://www.gocheok-sc.or.kr/',
    null, null, null, null,
    '{}', false, false, false,
    true, true,
    3500, 3500, 4550,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0066.jpg')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0066', '풀스데이', $${
    "월": [{"start":"13:00","end":"13:50","hours":0.83},{"start":"14:00","end":"14:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}],
    "화": [{"start":"13:00","end":"13:50","hours":0.83},{"start":"14:00","end":"14:50","hours":0.83}],
    "수": [{"start":"13:00","end":"13:50","hours":0.83},{"start":"14:00","end":"14:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}],
    "목": [{"start":"13:00","end":"13:50","hours":0.83},{"start":"14:00","end":"14:50","hours":0.83}],
    "금": [{"start":"13:00","end":"13:50","hours":0.83},{"start":"14:00","end":"14:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}],
    "토": [{"start":"10:00","end":"10:50","hours":0.83},{"start":"11:00","end":"11:50","hours":0.83},{"start":"13:00","end":"13:50","hours":0.83},{"start":"14:00","end":"14:50","hours":0.83},{"start":"15:00","end":"15:50","hours":0.83},{"start":"16:00","end":"16:50","hours":0.83}]
  }$$::jsonb, $${
    "월": "평일 자유수영은 신규 강습 개설 시 운영이 축소·종료될 수 있습니다.",
    "화": "평일 자유수영은 신규 강습 개설 시 운영이 축소·종료될 수 있습니다.",
    "수": "평일 자유수영은 신규 강습 개설 시 운영이 축소·종료될 수 있습니다.",
    "목": "평일 자유수영은 신규 강습 개설 시 운영이 축소·종료될 수 있습니다.",
    "금": "평일 자유수영은 신규 강습 개설 시 운영이 축소·종료될 수 있습니다."
  }$$::jsonb, '2026-06-05'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0066' and exists (select 1 from public.schedules where pool_id = 'POOL_0066');
