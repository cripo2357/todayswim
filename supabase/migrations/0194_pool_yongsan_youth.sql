-- Pool's day — 용산청소년센터 수영장(POOL_0090) 신규. 용산구 이촌동(이촌로71길 24), 구립(용산구시설관리공단 운영), 자유수영 일일입장.
-- 공식 출처(2026-06-06, 용산구시설관리공단 FAQ): 평일 08·13·18 / 토 4부(08~09:50·10~11:50·13~14:50·15~16:50) / 일(1·3·5주) 09~11:50·13~14:50·15:30~17:20.
-- 요금 평일 성인 4,000 / 주말 성인 4,400. 카카오 POI 좌표(용산청소년센터 수영장, 이촌동 301-82). 전화 02-731-2120.
-- ※ 일요일은 매월 1·3·5주만 운영 — day_note. (꿈나무종합타운과는 별개 시설)
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0090', '용산청소년센터수영장', '서울', '용산구',
    '서울특별시 용산구 이촌로71길 24',
    37.5212956267476, 126.973348514728, 'indoor', 'public',
    '02-731-2120', null,
    null, null, null, null,
    '{}', false, false, false,
    true, true,
    4000, 4000, 4400,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0090.jpg',
    'https://yongsanyouthtown.or.kr/site/main/archive/post/%EC%9E%90%EC%9C%A0%EC%88%98%EC%98%81%EC%8B%9C%EA%B0%84%EA%B3%BC-%EC%9A%94%EA%B8%88%EC%9D%80-%EC%96%B4%EB%96%BB%EA%B2%8C-%EB%90%98%EB%82%98%EC%9A%94?arcId=3227')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0090', '풀스데이', $${
    "월": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"13:00","end":"13:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}],
    "화": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"13:00","end":"13:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}],
    "수": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"13:00","end":"13:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}],
    "목": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"13:00","end":"13:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}],
    "금": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"13:00","end":"13:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}],
    "토": [{"start":"08:00","end":"09:50","hours":1.83},{"start":"10:00","end":"11:50","hours":1.83},{"start":"13:00","end":"14:50","hours":1.83},{"start":"15:00","end":"16:50","hours":1.83}],
    "일": [{"start":"09:00","end":"11:50","hours":2.83},{"start":"13:00","end":"14:50","hours":1.83},{"start":"15:30","end":"17:20","hours":1.83}]
  }$$::jsonb, $${
    "일": "자유수영은 매월 1·3·5주 일요일에만 운영"
  }$$::jsonb, '2026-06-06'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0090' and exists (select 1 from public.schedules where pool_id = 'POOL_0090');
