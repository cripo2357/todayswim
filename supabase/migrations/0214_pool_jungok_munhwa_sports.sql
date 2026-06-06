-- Pool's day — 중곡문화체육센터(POOL_0106) 신규. 광진구 중곡동(능동로 433), 구립(광진구시설관리공단), 자유수영 일일입장(주말).
-- 공식 출처(2026-06-06, booking.gwangjin.or.kr 중곡 자유수영 시간표): 토·일 일일권 6타임 09:00·10:30·12:00·14:00·15:30·17:00(각 50분).
--   일일입장 성인 3,500·청소년 2,500·어린이 2,000. 평일(월수금 08·13시 / 화목 08·12·13·14·18시)은 월정기(주3회 42,000·주2회 28,000) 전용 → 일일 슬롯서 제외.
-- 성인풀 25m×12m 6레인 + 어린이풀(5.6m×4.15m). 카카오 POI 좌표(중곡동 168-8). 전화 02-3408-4900.
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0106', '중곡문화체육센터', '서울', '광진구',
    '서울특별시 광진구 능동로 433',
    37.56777956326203, 127.08480231738665, 'indoor', 'public',
    '02-3408-4900', 'https://www.gwangjin.or.kr/',
    6, 25, null, null,
    '{}', true, false, false,
    true, true,
    3500, null, 3500,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0106.jpg',
    'https://booking.gwangjin.or.kr/fmcs/102?action=read&action-value=9f18c5b5e44f2f0e8e84c5d084227df9')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0106', '풀스데이', $${
    "토": [{"start":"09:00","end":"09:50","hours":0.83},{"start":"10:30","end":"11:20","hours":0.83},{"start":"12:00","end":"12:50","hours":0.83},{"start":"14:00","end":"14:50","hours":0.83},{"start":"15:30","end":"16:20","hours":0.83},{"start":"17:00","end":"17:50","hours":0.83}],
    "일": [{"start":"09:00","end":"09:50","hours":0.83},{"start":"10:30","end":"11:20","hours":0.83},{"start":"12:00","end":"12:50","hours":0.83},{"start":"14:00","end":"14:50","hours":0.83},{"start":"15:30","end":"16:20","hours":0.83},{"start":"17:00","end":"17:50","hours":0.83}]
  }$$::jsonb, '{}'::jsonb, '2026-06-06'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0106' and exists (select 1 from public.schedules where pool_id = 'POOL_0106');
