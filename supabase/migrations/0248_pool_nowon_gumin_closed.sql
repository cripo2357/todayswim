-- Pool's day — 노원구: 노원구민체육센터 등록 (POOL_0128). 재건축으로 현재 운영중단.
--
-- 크리스 결정(2026-06-07): 현재 재건축 추진 중 운영중단이나, 재개관 대비해 좌표·기본정보를
-- 미리 확보해 등록. 시간표 없이 pools 행만 INSERT.
--   · free_swim_available=false → 카드에 "자유수영 불가능" 표시(현재 상태 정확).
--   · has_schedule=false, schedules 행 없음([[pool_must_have_schedule]] 예외 — 운영중단 placeholder).
--   · 레인/길이/수심: 재건축으로 변경 가능 → null.
-- 재개관 시: free_swim_available=true + schedules INSERT + 시설규격 UPDATE.
--
-- 좌표 [신뢰도 높음]: 카카오 도로명 "노원구 노원로22길 1"(ft_idx=683). 전화 02-2289-6804.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  photo_url, schedule_source_url
) values
  ('POOL_0128', '노원구민체육센터', '서울', '노원구',
    '서울특별시 노원구 노원로22길 1',
    37.6481575587444, 127.070699475633, 'indoor', 'public',
    '02-2289-6804', 'https://www.nowonsc.kr/',
    null, null, null, null,
    '{}', false, false, false,
    false, false,
    null, null)
on conflict (id) do nothing;
