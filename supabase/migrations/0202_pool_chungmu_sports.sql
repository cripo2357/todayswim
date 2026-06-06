-- Pool's day — 충무스포츠센터(충무아트홀, POOL_0097) 신규. 중구 흥인동(퇴계로 387, 신당역), 구립(중구시설관리공단), 자유수영 일일입장.
-- 크리스 제공 공식 캡처(2026-06-06, e-junggu fmcs/56): 일일입장(성인 6,000·어린이 5,000) = 주말 전용.
--   토 1~4부 06:00~07:50·09:00~10:50·14:00~14:50·18:00~19:20 / 일 1~3부 09:30~11:50·13:00~14:50·16:00~17:20.
--   ※ 평일 오전/오후(A·C·G·H) + 토 08시·화목 09시 = 전부 월 자유수영(월권)/월등록 회원 전용 → 일일 슬롯 제외.
--   ※ '일요일 2·4주 정기휴관' 여부는 2차 검색엔 있으나 공식 캡처 미표기 — 크리스 확인 후 day_note 추가 예정.
-- 카카오 POI 좌표(충무스포츠센터 수영장). 전화 02-2280-8400.
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0097', '충무스포츠센터', '서울', '중구',
    '서울특별시 중구 퇴계로 387',
    37.5660701766126, 127.014750846218, 'indoor', 'public',
    '02-2280-8400', 'https://www.e-junggu.or.kr/fmcs/52',
    null, null, null, null,
    '{}', false, false, false,
    true, true,
    6000, null, 6000,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0097.jpg',
    'https://www.e-junggu.or.kr/fmcs/56')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0097', '풀스데이', $${
    "토": [{"start":"06:00","end":"07:50","hours":1.83},{"start":"09:00","end":"10:50","hours":1.83},{"start":"14:00","end":"14:50","hours":0.83},{"start":"18:00","end":"19:20","hours":1.33}],
    "일": [{"start":"09:30","end":"11:50","hours":2.33},{"start":"13:00","end":"14:50","hours":1.83},{"start":"16:00","end":"17:20","hours":1.33}]
  }$$::jsonb, '{}'::jsonb, '2026-06-06'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0097' and exists (select 1 from public.schedules where pool_id = 'POOL_0097');
