-- Pool's day — 시립구로청소년센터(POOL_0068) 신규. 구로구 공공.
-- 크리스 제공 캡처(2026-06-05): 자유수영 월 등록 전용, 1일 이용권 없음(크리스 확인).
-- 고덕사회체육(0057) 패턴 — 자유수영은 하나 일일입장 불가 → day_note 명시 등록(서울대·고덕 전례).
-- 주5회반(월~금) 12:00~12:50 / 주2회반(화·목) 08:00~08:50·21:00~21:50.
-- 일일입장료 없음 → price NULL, 월 등록요금은 day_note에. 카카오 POI 좌표(구로동 704-12).
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url
) values
  ('POOL_0068', '시립구로청소년센터', '서울', '구로구',
    '서울특별시 구로구 구로동로 141',
    37.4913708422991, 126.883268774914, 'indoor', 'public',
    '02-838-1318', 'http://www.guro1318.org/',
    null, null, null, null,
    '{}', false, false, false,
    true, true,
    null, null, null,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0068.jpg')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0068', '풀스데이', $${
    "월": [{"start":"12:00","end":"12:50","hours":0.83}],
    "화": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"12:50","hours":0.83},{"start":"21:00","end":"21:50","hours":0.83}],
    "수": [{"start":"12:00","end":"12:50","hours":0.83}],
    "목": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"12:50","hours":0.83},{"start":"21:00","end":"21:50","hours":0.83}],
    "금": [{"start":"12:00","end":"12:50","hours":0.83}]
  }$$::jsonb, $${
    "월": "자유수영은 1일 이용권이 없는 월 등록 전용입니다(성인 주5회 66,000원·주2회 38,500원). 초등학생은 보호자 동반 입장.",
    "화": "자유수영은 1일 이용권이 없는 월 등록 전용입니다(성인 주5회 66,000원·주2회 38,500원). 초등학생은 보호자 동반 입장.",
    "수": "자유수영은 1일 이용권이 없는 월 등록 전용입니다(성인 주5회 66,000원·주2회 38,500원). 초등학생은 보호자 동반 입장.",
    "목": "자유수영은 1일 이용권이 없는 월 등록 전용입니다(성인 주5회 66,000원·주2회 38,500원). 초등학생은 보호자 동반 입장.",
    "금": "자유수영은 1일 이용권이 없는 월 등록 전용입니다(성인 주5회 66,000원·주2회 38,500원). 초등학생은 보호자 동반 입장."
  }$$::jsonb, '2026-06-05'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0068' and exists (select 1 from public.schedules where pool_id = 'POOL_0068');
