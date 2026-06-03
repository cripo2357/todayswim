-- Pool's day — Phase 2: 수영장 1곳 추가: 슈퍼빌스포츠클럽 (POOL_0045). 서초구 서초동(사설, 남부터미널).
--
-- ## 시간표·가격 출처
--
-- 운영자(크리스) 제공 — 공식 시설안내 + 운영 정보. 자유수영 일일입장 일반개방.
--
-- - 운영시간: 평일 06:00~22:00, 토·일 06:00~18:00.
-- - 자유수영: 운영시간 내 이용, 강습 시간대 레인 제한될 수 있음 → day_note 안내.
--   · 평일(월~금): 06:00~22:00 / 토·일: 06:00~18:00.
-- - 가격: 일일입장 20,000(자유수영+사우나 포함). 서초 최고가지만 운영자 정책상 등록
--   ("자유수영 되면 등록, 가격은 사용자 선택").
-- - 특징: 인공해수풀(활성여과 시스템) → facilities 노출.
--
-- ## 메타데이터
--
-- - 시설: 23m × 5레인, 수심 1.3m (공식 시설안내). ★요약본은 "25m 4레인"으로 엇갈렸으나
--   슈퍼빌 공식 시설안내 텍스트("총 23미터의 5레인 / 수심 1.3m") 채택.
-- - 좌표 [신뢰도 높음]: 카카오 "서울 서초구 서초중앙로 15" ROAD_ADDR 정확 매치(남부터미널역).
-- - 전화: 02-3487-9933. ownership=private. photo_url=NULL.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url
) values
  ('POOL_0045', '슈퍼빌스포츠클럽', '서울', '서초구',
    '서울특별시 서초구 서초중앙로 15',
    37.4830108887405, 127.015641614311, 'indoor', 'private',
    '02-3487-9933', 'http://superville-sportsclub.co.kr/',
    5, 23, 1.3, 1.3,
    ARRAY['해수풀'], false, false, false,
    true, true,
    20000, 20000, 20000, null)
on conflict (id) do nothing;

-- 자유수영 시간표(운영시간 기준). hours: 06:00~22:00=16, 06:00~18:00=12.
-- day_notes: 강습 시간대 레인 제한 안내(전 요일).
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0045', '풀스데이', $${
    "월": [{"start":"06:00","end":"22:00","hours":16}],
    "화": [{"start":"06:00","end":"22:00","hours":16}],
    "수": [{"start":"06:00","end":"22:00","hours":16}],
    "목": [{"start":"06:00","end":"22:00","hours":16}],
    "금": [{"start":"06:00","end":"22:00","hours":16}],
    "토": [{"start":"06:00","end":"18:00","hours":12}],
    "일": [{"start":"06:00","end":"18:00","hours":12}]
  }$$::jsonb, $${
    "월": "강습 시간대는 자유수영 레인이 제한될 수 있습니다.",
    "화": "강습 시간대는 자유수영 레인이 제한될 수 있습니다.",
    "수": "강습 시간대는 자유수영 레인이 제한될 수 있습니다.",
    "목": "강습 시간대는 자유수영 레인이 제한될 수 있습니다.",
    "금": "강습 시간대는 자유수영 레인이 제한될 수 있습니다.",
    "토": "강습 시간대는 자유수영 레인이 제한될 수 있습니다.",
    "일": "강습 시간대는 자유수영 레인이 제한될 수 있습니다."
  }$$::jsonb, '2026-06-04'::timestamptz)
on conflict (pool_id) do nothing;

update public.pools
set has_schedule = true
where id = 'POOL_0045'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0045');
