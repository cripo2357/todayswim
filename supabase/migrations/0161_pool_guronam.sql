-- Pool's day — 구로남체육센터(POOL_0067) 신규. 구로구 민간(구로남초 부지 학교복합), 자유수영 일일입장.
-- 카카오 좌표(디지털로27길 76 도로명). 시간표=swimmingis(2차) — '임시' 표시 야간/14시 제외, 정규만.
-- 일일입장 비회원 1회 9000(5회권 45000). 해수풀. 사설 일일개방 → eligibility 등록(성일·와우 패턴).
-- ※시간표 2차 출처+강습 변동 → day_note 명시. 사진 POOL_0067.jpg 업로드 후 표시.
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url
) values
  ('POOL_0067', '구로남체육센터', '서울', '구로구',
    '서울특별시 구로구 디지털로27길 76',
    37.4847045985983, 126.890267788001, 'indoor', 'private',
    '02-853-7044', 'https://guronam.modoo.at/',
    null, null, null, null,
    '{}', false, false, false,
    true, true,
    9000, 9000, 9000,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0067.jpg')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0067', '풀스데이', $${
    "월": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"13:00","end":"13:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}],
    "화": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"12:50","hours":0.83},{"start":"13:00","end":"13:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}],
    "수": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"13:00","end":"13:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}],
    "목": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"12:50","hours":0.83},{"start":"13:00","end":"13:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}],
    "금": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"13:00","end":"13:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}],
    "토": [{"start":"10:00","end":"11:50","hours":1.83},{"start":"13:00","end":"14:50","hours":1.83},{"start":"16:00","end":"17:50","hours":1.83}],
    "일": [{"start":"10:00","end":"11:50","hours":1.83},{"start":"13:00","end":"14:50","hours":1.83},{"start":"16:00","end":"17:50","hours":1.83}]
  }$$::jsonb, $${
    "월": "시간표는 강습·행사로 변동될 수 있어 방문 전 확인을 권장합니다.",
    "화": "시간표는 강습·행사로 변동될 수 있어 방문 전 확인을 권장합니다.",
    "수": "시간표는 강습·행사로 변동될 수 있어 방문 전 확인을 권장합니다.",
    "목": "시간표는 강습·행사로 변동될 수 있어 방문 전 확인을 권장합니다.",
    "금": "시간표는 강습·행사로 변동될 수 있어 방문 전 확인을 권장합니다.",
    "토": "시간표는 강습·행사로 변동될 수 있어 방문 전 확인을 권장합니다.",
    "일": "시간표는 강습·행사로 변동될 수 있어 방문 전 확인을 권장합니다."
  }$$::jsonb, '2026-06-05'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0067' and exists (select 1 from public.schedules where pool_id = 'POOL_0067');
