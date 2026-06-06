-- Pool's day — 용산구문화체육센터(POOL_0088) 신규. 용산구 문배동(백범로 350), 구립(용산구시설관리공단 운영), 자유수영 일일입장.
-- 공식 출처(2026-06-06, yssports.yong-san.or.kr/www/127): 화목 12:00 / 월수금 15:00 / 토 8타임 / 일(2·4주) 6타임.
--   ※ 평일 08:00은 "월정기권에 한함"(회원 전용)이라 일일입장 슬롯에서 제외 — day_note로 명시. ※ 일요일은 매월 2·4주만 운영 — day_note.
-- 일일 입장권 성인 3,000·청소년 2,500·어린이 2,000. 카카오 POI 좌표(용산문화체육센터 수영장).
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0088', '용산구문화체육센터', '서울', '용산구',
    '서울특별시 용산구 백범로 350',
    37.5372419255714, 126.967626712878, 'indoor', 'public',
    null, 'https://yssports.yong-san.or.kr/',
    null, null, null, null,
    '{}', false, false, false,
    true, true,
    3000, 3000, 3000,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0088.jpg',
    'https://yssports.yong-san.or.kr/www/127')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0088', '풀스데이', $${
    "월": [{"start":"15:00","end":"15:50","hours":0.83}],
    "화": [{"start":"12:00","end":"12:50","hours":0.83}],
    "수": [{"start":"15:00","end":"15:50","hours":0.83}],
    "목": [{"start":"12:00","end":"12:50","hours":0.83}],
    "금": [{"start":"15:00","end":"15:50","hours":0.83}],
    "토": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"09:00","end":"09:50","hours":0.83},{"start":"10:00","end":"10:50","hours":0.83},{"start":"11:00","end":"11:50","hours":0.83},{"start":"13:00","end":"13:50","hours":0.83},{"start":"14:00","end":"14:50","hours":0.83},{"start":"16:00","end":"16:50","hours":0.83},{"start":"17:00","end":"17:50","hours":0.83}],
    "일": [{"start":"10:00","end":"10:50","hours":0.83},{"start":"11:00","end":"11:50","hours":0.83},{"start":"13:00","end":"13:50","hours":0.83},{"start":"14:00","end":"14:50","hours":0.83},{"start":"15:00","end":"15:50","hours":0.83},{"start":"16:00","end":"16:50","hours":0.83}]
  }$$::jsonb, $${
    "월": "평일 오전 8시 타임은 월정기권 회원만 이용 가능(일일입장 제외)",
    "화": "평일 오전 8시 타임은 월정기권 회원만 이용 가능(일일입장 제외)",
    "수": "평일 오전 8시 타임은 월정기권 회원만 이용 가능(일일입장 제외)",
    "목": "평일 오전 8시 타임은 월정기권 회원만 이용 가능(일일입장 제외)",
    "금": "평일 오전 8시 타임은 월정기권 회원만 이용 가능(일일입장 제외)",
    "일": "자유수영은 매월 2·4주 일요일에만 운영"
  }$$::jsonb, '2026-06-06'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0088' and exists (select 1 from public.schedules where pool_id = 'POOL_0088');
