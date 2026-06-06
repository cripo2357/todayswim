-- Pool's day — 시립성동청소년센터(POOL_0104) 신규. 성동구 행당동(고산자로 260), 시립(서울가톨릭청소년회 위탁), 자유수영 일일입장.
-- 공식 출처(2026-06-06, sdyc.or.kr/main/ko/sub03_01.html):
--   평일 일일입장: 화목 08:00~08:50 / 월수금+화목 14:00~14:50.
--   토 09:00~10:50(100분)·11:00~11:50(50분)·13:00~14:50(100분)·16:00~17:50(100분). 일요일 없음.
--   50분 성인 4,250·청소년 2,500 / 100분 성인 5,500·청소년 3,700. 2레인(토 30명).
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0104', '시립성동청소년센터', '서울', '성동구',
    '서울특별시 성동구 고산자로 260',
    37.562363276769396, 127.03645311215985, 'indoor', 'public',
    '02-2296-4062', 'http://sdyc.or.kr',
    null, null, null, null,
    '{}', false, false, false,
    true, true,
    4250, 4250, 4250,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0104.jpg',
    'http://sdyc.or.kr/main/ko/sub03_01.html')
on conflict (id) do nothing;

insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0104', '풀스데이', $${
    "월": [{"start":"14:00","end":"14:50","hours":0.83}],
    "화": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"14:00","end":"14:50","hours":0.83}],
    "수": [{"start":"14:00","end":"14:50","hours":0.83}],
    "목": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"14:00","end":"14:50","hours":0.83}],
    "금": [{"start":"14:00","end":"14:50","hours":0.83}],
    "토": [{"start":"09:00","end":"10:50","hours":1.83},{"start":"11:00","end":"11:50","hours":0.83},{"start":"13:00","end":"14:50","hours":1.83},{"start":"16:00","end":"17:50","hours":1.83}]
  }$$::jsonb, $${
    "토": "09·13·16시 타임은 100분(성인 5,500원), 11시 타임은 50분(성인 4,250원)"
  }$$::jsonb, '2026-06-06'::timestamptz)
on conflict (pool_id) do nothing;

update public.pools set has_schedule = true where id = 'POOL_0104'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0104');
