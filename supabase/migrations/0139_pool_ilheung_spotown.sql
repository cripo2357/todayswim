-- Pool's day — Phase 2: 수영장 1곳 추가: 일흥스포타운 (POOL_0044). 서초구 서초동(사설).
--
-- ## 시간표·가격 출처
--
-- 운영자(크리스) 제공 — 운영시간·요금·인공해수풀 특징. 자유수영 일일입장 일반개방.
--
-- - 운영: 평일 06:00~21:50, 토·공휴일 09:00~19:00, 일요일 휴관.
-- - 자유수영: 평일 오전 11시 이후부터 이용(강습 겹치는 시간대 있을 수 있어 방문 확인 권장
--   → day_note 안내). 토·공휴일 09:00~19:00.
--   · 평일(월~금): 11:00~21:50 / 토: 09:00~19:00 / 일: 휴관.
-- - 가격: 일일입장 성인 15,000 / 어린이 8,000.
-- - 특징: 인공해수풀(독일 DIN·고압오존 정수) → facilities 노출.
--
-- ## 메타데이터
--
-- - 좌표 [신뢰도 높음]: 카카오 "서울 서초구 명달로 65" ROAD_ADDR 정확 매치(방배역 인근).
-- - 시설: 25m. 레인·수심 미상 → NULL. ownership=private. photo_url=NULL.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url
) values
  ('POOL_0044', '일흥스포타운', '서울', '서초구',
    '서울특별시 서초구 명달로 65',
    37.4830254739881, 127.003616579196, 'indoor', 'private',
    null, 'http://ihspotown.com/',
    null, 25, null, null,
    ARRAY['해수풀'], false, false, false,
    true, true,
    15000, 15000, 15000, null)
on conflict (id) do nothing;

-- 자유수영 시간표. hours: 평일 11:00~21:50=10.83, 토 09:00~19:00=10.
-- day_notes: 평일 강습 겹침 안내(운영자 제공 정보가 "방문 전 확인 권장").
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0044', '풀스데이', $${
    "월": [{"start":"11:00","end":"21:50","hours":10.83}],
    "화": [{"start":"11:00","end":"21:50","hours":10.83}],
    "수": [{"start":"11:00","end":"21:50","hours":10.83}],
    "목": [{"start":"11:00","end":"21:50","hours":10.83}],
    "금": [{"start":"11:00","end":"21:50","hours":10.83}],
    "토": [{"start":"09:00","end":"19:00","hours":10}]
  }$$::jsonb, $${
    "월": "강습 시간대는 자유수영이 제한될 수 있어 방문 전 확인을 권장합니다.",
    "화": "강습 시간대는 자유수영이 제한될 수 있어 방문 전 확인을 권장합니다.",
    "수": "강습 시간대는 자유수영이 제한될 수 있어 방문 전 확인을 권장합니다.",
    "목": "강습 시간대는 자유수영이 제한될 수 있어 방문 전 확인을 권장합니다.",
    "금": "강습 시간대는 자유수영이 제한될 수 있어 방문 전 확인을 권장합니다."
  }$$::jsonb, '2026-06-04'::timestamptz)
on conflict (pool_id) do nothing;

update public.pools
set has_schedule = true
where id = 'POOL_0044'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0044');
