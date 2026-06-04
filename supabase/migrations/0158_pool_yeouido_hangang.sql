-- Pool's day — 여의도한강수영장(POOL_0064) 신규. 영등포구, 서울시 미래한강본부 야외 계절풀.
-- 카카오 POI 좌표(여의도동 82-3). 크리스 결정으로 등록(계절 야외풀이나 여름 자유수영 수요 큼).
-- 운영=여름철 한정(2025: 6/20~8/31). 입수 09:00~12:00·13:00~17:30·19:00~22:00(점심·저녁 제외, 야간개장).
-- day_note로 계절 제약 명시 → 비시즌(개장 전/후)에 헛걸음 방지. 사진 POOL_0064.jpg 업로드 후 표시.
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url
) values
  ('POOL_0064', '여의도한강수영장', '서울', '영등포구',
    '서울특별시 영등포구 여의도동 82-3',
    37.53355471966898, 126.91973943154616, 'outdoor', 'public',
    null, 'https://hangang.seoul.go.kr/',
    null, null, null, null,
    '{}', false, false, false,
    true, true,
    5000, 5000, 5000,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0064.jpg')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0064', '풀스데이', $${
    "월": [{"start":"09:00","end":"12:00","hours":3},{"start":"13:00","end":"17:30","hours":4.5},{"start":"19:00","end":"22:00","hours":3}],
    "화": [{"start":"09:00","end":"12:00","hours":3},{"start":"13:00","end":"17:30","hours":4.5},{"start":"19:00","end":"22:00","hours":3}],
    "수": [{"start":"09:00","end":"12:00","hours":3},{"start":"13:00","end":"17:30","hours":4.5},{"start":"19:00","end":"22:00","hours":3}],
    "목": [{"start":"09:00","end":"12:00","hours":3},{"start":"13:00","end":"17:30","hours":4.5},{"start":"19:00","end":"22:00","hours":3}],
    "금": [{"start":"09:00","end":"12:00","hours":3},{"start":"13:00","end":"17:30","hours":4.5},{"start":"19:00","end":"22:00","hours":3}],
    "토": [{"start":"09:00","end":"12:00","hours":3},{"start":"13:00","end":"17:30","hours":4.5},{"start":"19:00","end":"22:00","hours":3}],
    "일": [{"start":"09:00","end":"12:00","hours":3},{"start":"13:00","end":"17:30","hours":4.5},{"start":"19:00","end":"22:00","hours":3}]
  }$$::jsonb, $${
    "월": "여름철에만 운영하는 야외 수영장입니다(통상 6월 말~8월 말 개장).",
    "화": "여름철에만 운영하는 야외 수영장입니다(통상 6월 말~8월 말 개장).",
    "수": "여름철에만 운영하는 야외 수영장입니다(통상 6월 말~8월 말 개장).",
    "목": "여름철에만 운영하는 야외 수영장입니다(통상 6월 말~8월 말 개장).",
    "금": "여름철에만 운영하는 야외 수영장입니다(통상 6월 말~8월 말 개장).",
    "토": "여름철에만 운영하는 야외 수영장입니다(통상 6월 말~8월 말 개장).",
    "일": "여름철에만 운영하는 야외 수영장입니다(통상 6월 말~8월 말 개장)."
  }$$::jsonb, '2026-06-05'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0064' and exists (select 1 from public.schedules where pool_id = 'POOL_0064');
