-- Pool's day — 강북구 배치: 강북웰빙스포츠센터 수영장 추가 (POOL_0120).
--
-- ## 시간표 출처 [1차 — 운영자 공식]
--
-- 크리스가 강북웰빙스포츠센터 공식 '일일 자유수영 프로그램' 표 캡처 제공(강북구도시관리공단).
--
-- - 일일 자유수영:
--   · 평일(월~금): 12:00–12:50, 18:00–18:50 (성인 4,000)
--   · 토         : 06:00–07:50, 09:00–10:50, 12:00–12:50 (성인 4,800, 20%할증)
--   · 일         : 08:00–10:50, 12:00–13:50, 15:00–16:50 (성인 4,800, 20%할증)
--   · 월 정기 자유회원 시간대(12시/18시 월수금·화목)는 회원 전용 → 일일자유와 별개(제외).
-- - 가격: 평일 성인 4,000 / 주말(토·일) 성인 4,800.
-- - 유의: 개인물품(에어볼·튜브·물총·오리발 등) 사용금지. 정원 초과 시 입장 제한.
--
-- ## 메타데이터 출처
-- - 성인풀 25m 6레인 + 유아전용풀 6m → has_kids_pool=true. (크리스 제공 공식 규모)
-- - 좌표 [신뢰도 높음]: 카카오 POI "강북웰빙스포츠센터"(번동 318).
-- - 전화: 02-944-2900. 오현로31길 51.
--
-- 사진: pool-photos/POOL_0120.jpg 미확보 → photo_url null.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0120', '강북웰빙스포츠센터', '서울', '강북구',
    '서울특별시 강북구 오현로31길 51',
    37.6304426671375, 127.037774411629, 'indoor', 'public',
    '02-944-2900', 'https://www.gbcmc.or.kr/',
    6, 25, null, null,
    '{}', true, false, false,
    true, true,
    4000, 4800, null,
    'https://www.gbcmc.or.kr/fmcs/70')
on conflict (id) do nothing;

-- 자유수영 시간표. 평일 50분=0.83. 토 1시간50분=1.83. 일 1부 2시간50분=2.83.
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0120', '풀스데이', $${
    "월": [{"start":"12:00","end":"12:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}],
    "화": [{"start":"12:00","end":"12:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}],
    "수": [{"start":"12:00","end":"12:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}],
    "목": [{"start":"12:00","end":"12:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}],
    "금": [{"start":"12:00","end":"12:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}],
    "토": [
      {"start":"06:00","end":"07:50","hours":1.83},
      {"start":"09:00","end":"10:50","hours":1.83},
      {"start":"12:00","end":"12:50","hours":0.83}
    ],
    "일": [
      {"start":"08:00","end":"10:50","hours":2.83},
      {"start":"12:00","end":"13:50","hours":1.83},
      {"start":"15:00","end":"16:50","hours":1.83}
    ]
  }$$::jsonb, $${
    "월":"자유수영 시 튜브·오리발·물놀이 용품 등 개인물품은 사용할 수 없습니다.",
    "화":"자유수영 시 튜브·오리발·물놀이 용품 등 개인물품은 사용할 수 없습니다.",
    "수":"자유수영 시 튜브·오리발·물놀이 용품 등 개인물품은 사용할 수 없습니다.",
    "목":"자유수영 시 튜브·오리발·물놀이 용품 등 개인물품은 사용할 수 없습니다.",
    "금":"자유수영 시 튜브·오리발·물놀이 용품 등 개인물품은 사용할 수 없습니다.",
    "토":"자유수영 시 튜브·오리발·물놀이 용품 등 개인물품은 사용할 수 없습니다.",
    "일":"자유수영 시 튜브·오리발·물놀이 용품 등 개인물품은 사용할 수 없습니다."
  }$$::jsonb, '2026-06-07'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_0120'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0120');
