-- Pool's day — 광진구민체육센터(POOL_0105) 신규. 광진구 광장동(구천면로 14), 구립(광진구시설관리공단), 자유수영 일일입장(주말).
-- 공식 출처(2026-06-06, booking.gwangjin.or.kr 자유수영 시간표 안내): 토·일 일일권 6타임 09:00·10:30·12:00·14:00·15:30·17:00(각 50분), 정원 72명.
--   일일입장 성인 3,500·청소년 2,500·어린이 2,000. 평일 자유수영은 월 등록(정기) 전용이라 일일 슬롯서 제외(주말만 일일권).
-- 카카오 POI 좌표(광진구민체육센터, 광장동 313-3). 전화 02-2049-4800.
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0105', '광진구민체육센터', '서울', '광진구',
    '서울특별시 광진구 구천면로 14',
    37.546003423617194, 127.10692399883534, 'indoor', 'public',
    '02-2049-4800', 'https://www.gwangjin.or.kr/',
    null, null, null, null,
    '{}', false, false, false,
    true, true,
    3500, null, 3500,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0105.jpg',
    'https://booking.gwangjin.or.kr/fmcs/102?action=read&action-value=fdfe74eb03a5d2b1e7bacae96c3c8e90')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0105', '풀스데이', $${
    "토": [{"start":"09:00","end":"09:50","hours":0.83},{"start":"10:30","end":"11:20","hours":0.83},{"start":"12:00","end":"12:50","hours":0.83},{"start":"14:00","end":"14:50","hours":0.83},{"start":"15:30","end":"16:20","hours":0.83},{"start":"17:00","end":"17:50","hours":0.83}],
    "일": [{"start":"09:00","end":"09:50","hours":0.83},{"start":"10:30","end":"11:20","hours":0.83},{"start":"12:00","end":"12:50","hours":0.83},{"start":"14:00","end":"14:50","hours":0.83},{"start":"15:30","end":"16:20","hours":0.83},{"start":"17:00","end":"17:50","hours":0.83}]
  }$$::jsonb, '{}'::jsonb, '2026-06-06'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0105' and exists (select 1 from public.schedules where pool_id = 'POOL_0105');
