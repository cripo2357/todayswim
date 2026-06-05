-- Pool's day — 증산스포츠센터(POOL_0081) 신규. 은평구 증산동(증산초등학교), 사설 위탁, 자유수영 일일입장.
-- 크리스 제공 공식 캡처(2026-06-06): 평일 08·12~13:50(수는 06~08:50·12~13:50·20~21:50) / 토 1부 07~10:50·2부 14~16:50.
-- ★일요일·공휴일 휴무 → 일 슬롯 없음. 평일·토 1부는 어린이 이용 불가, 개인장비 금지 → day_note.
-- 일일입장 성인11000·어린이8000(주중/주말 동일 표기). 카카오 POI 좌표(증산동 212 = 증산서길 61).
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url
) values
  ('POOL_0081', '증산스포츠센터', '서울', '은평구',
    '서울특별시 은평구 증산서길 61',
    37.58279440165, 126.904288267101, 'indoor', 'private',
    '02-376-0070', null,
    null, null, null, null,
    '{}', false, false, false,
    true, true,
    11000, 11000, 11000,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0081.jpg')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0081', '풀스데이', $${
    "월": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"13:50","hours":1.83}],
    "화": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"13:50","hours":1.83}],
    "수": [{"start":"06:00","end":"08:50","hours":2.83},{"start":"12:00","end":"13:50","hours":1.83},{"start":"20:00","end":"21:50","hours":1.83}],
    "목": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"13:50","hours":1.83}],
    "금": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"13:50","hours":1.83}],
    "토": [{"start":"07:00","end":"10:50","hours":3.83},{"start":"14:00","end":"16:50","hours":2.83}]
  }$$::jsonb, $${
    "월": "평일·토요일 1부 자유수영은 어린이 이용 불가, 개인장비(오리발·튜브 등) 사용 금지입니다.",
    "화": "평일·토요일 1부 자유수영은 어린이 이용 불가, 개인장비(오리발·튜브 등) 사용 금지입니다.",
    "수": "수요일 자유이용은 오전·오후 시간 무관. 1부 자유수영은 어린이 이용 불가, 개인장비 사용 금지입니다.",
    "목": "평일·토요일 1부 자유수영은 어린이 이용 불가, 개인장비(오리발·튜브 등) 사용 금지입니다.",
    "금": "평일·토요일 1부 자유수영은 어린이 이용 불가, 개인장비(오리발·튜브 등) 사용 금지입니다.",
    "토": "토요일 1부(07:00~10:50)는 어린이 이용 불가, 개인장비 사용 금지입니다."
  }$$::jsonb, '2026-06-06'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0081' and exists (select 1 from public.schedules where pool_id = 'POOL_0081');
