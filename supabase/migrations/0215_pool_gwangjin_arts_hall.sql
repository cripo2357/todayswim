-- Pool's day — 광진문화예술회관(POOL_0107) 신규. 광진구 자양동(능동로 76, 건대입구), 구립(광진구시설관리공단), 자유수영=월 등록 전용.
-- 공식 출처(2025-11-20, booking.gwangjin.or.kr 자유수영 월단위 등록 전환 안내): 자유수영은 1일 이용권 없이 매월 신규 접수(재등록 불가).
--   월수금 14:00~14:50(주3회반) / 화목 08:00~08:50·14:00~14:50(주2회반). 정원 12명.
-- 일일입장 없음 → price NULL, 월 등록요금은 day_note에([[pool_eligibility_exceptions]], 0068 시립구로 패턴 — 크리스 결정 2026-06-06).
-- 카카오 POI 좌표(광진문화예술회관 수영장, 자양동 227-344). 전화 02-2049-4570.
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0107', '광진문화예술회관', '서울', '광진구',
    '서울특별시 광진구 능동로 76',
    37.53761269071059, 127.07059769138877, 'indoor', 'public',
    '02-2049-4570', 'https://www.gwangjin.or.kr/',
    null, 25, null, null,
    '{}', false, false, false,
    true, true,
    null, null, null,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0107.jpg',
    'https://booking.gwangjin.or.kr/fmcs/102?action=read&action-value=be22fd18e8742baad7c364bc53802c3b')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0107', '풀스데이', $${
    "월": [{"start":"14:00","end":"14:50","hours":0.83}],
    "화": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"14:00","end":"14:50","hours":0.83}],
    "수": [{"start":"14:00","end":"14:50","hours":0.83}],
    "목": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"14:00","end":"14:50","hours":0.83}],
    "금": [{"start":"14:00","end":"14:50","hours":0.83}]
  }$$::jsonb, $${
    "월": "자유수영은 1일 이용권이 없는 월 등록 전용입니다(주3회 월수금 성인 42,000원·청소년 30,000원). 매월 신규 접수(재등록 불가).",
    "화": "자유수영은 1일 이용권이 없는 월 등록 전용입니다(주2회 화목 성인 28,000원·청소년 20,000원). 매월 신규 접수(재등록 불가).",
    "수": "자유수영은 1일 이용권이 없는 월 등록 전용입니다(주3회 월수금 성인 42,000원·청소년 30,000원). 매월 신규 접수(재등록 불가).",
    "목": "자유수영은 1일 이용권이 없는 월 등록 전용입니다(주2회 화목 성인 28,000원·청소년 20,000원). 매월 신규 접수(재등록 불가).",
    "금": "자유수영은 1일 이용권이 없는 월 등록 전용입니다(주3회 월수금 성인 42,000원·청소년 30,000원). 매월 신규 접수(재등록 불가)."
  }$$::jsonb, '2026-06-06'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0107' and exists (select 1 from public.schedules where pool_id = 'POOL_0107');
