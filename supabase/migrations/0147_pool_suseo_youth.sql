-- Pool's day — Phase 2: 수영장 1곳 추가: 시립 수서청소년센터 (POOL_0050). 강남구 수서동(공공/서울시립).
-- (더논현이 빠진 POOL_0049는 결번으로 비움.)
--
-- ★★ 미완성: 좌표(lat/lng)가 임시값입니다. 2026-06-04 카카오 API 일일 쿼터 초과(401)로
--    geocode 실패 → 자정 후 쿼터 리셋되면 "서울 강남구 광평로 144" 카카오 좌표로 교체 후 적용.
--    **좌표 교체 전 적용 금지.** (현재 임시 좌표는 인근 강남스포츠문화센터 근사값.)
--
-- ## 시간표·가격 출처
--
-- 운영자 제공 현장 안내판 — 1차. 일·공휴일 휴장.
-- - 자유수영: 토요일 2회 13:00~14:50만(비회원 일일입장 가능). 1회 10:00~11:50은
--   당월회원 전용이라 제외. 평일·일요일 자유수영 없음.
-- - 가격: 비회원 일일 성인 6,000 / 초중고 4,000.
--
-- ## 메타데이터
--
-- - 주소: 서울특별시 강남구 광평로 144. 전화: 02-2226-3611. ownership=public(서울시립).
-- - 시설: 25m, 5~6레인(불확실 → NULL). 수심 미상. photo_url=NULL.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url
) values
  ('POOL_0050', '시립 수서청소년센터', '서울', '강남구',
    '서울특별시 강남구 광평로 144',
    37.4891939721457, 127.105262207682, 'indoor', 'public',  -- ★임시 좌표(자정 후 광평로 144로 교체)
    '02-2226-3611', 'http://www.youtra.or.kr/',
    null, 25, null, null,
    '{}', false, false, false,
    true, true,
    6000, 6000, 6000, null)
on conflict (id) do nothing;

-- 자유수영 시간표(토요일 2회만, 비회원 일일입장). hours: 13:00~14:50=1h50m=1.83.
insert into public.schedules (pool_id, author_nickname, by_day, updated_at) values
  ('POOL_0050', '풀스데이', $${
    "토": [
      {"start":"13:00","end":"14:50","hours":1.83}
    ]
  }$$::jsonb, '2026-06-04'::timestamptz)
on conflict (pool_id) do nothing;

update public.pools
set has_schedule = true
where id = 'POOL_0050'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0050');
