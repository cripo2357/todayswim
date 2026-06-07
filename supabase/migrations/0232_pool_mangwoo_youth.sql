-- Pool's day — 중랑구 배치: 서울시립망우청소년센터 수영장 추가 (POOL_0113).
--
-- ## 시간표 출처 [1차 — 운영자 공식]
--
-- 크리스가 공식 홈페이지(mangwoo.kr/bbs/content.php?co_id=sport01) 자유수영 표 캡처 제공.
-- 공식 SPA/JS라 정적 fetch 불가 → 캡처가 1차. 2차(첨벙)는 일요일/평일 디테일이 불명확했음.
--
-- - 자유수영(대상 누구나, 회차당 50분) — 운영: 월~토 (일요일 미운영):
--   · 평일(월~금): 1부 08:00–08:50, 2부 18:00–18:50 (※일일권은 08시·18시 중 1회 선택)
--   · 토         : 1부 08:00–08:50만 (2부 없음, 토요일은 3개 레인만 개방)
--   · 일         : 자유수영 미운영.
-- - 가격: 일일 성인 4,700 (평일·토 동일). 월 자유수영(월~금) 성인 72,500 → price_monthly.
-- - 유의: 튜브·스노클·킥판·구명조끼 등 보조기구 사용금지. 미취학 아동 보호자 동반 시 입장.
--   화·목 08·18시는 레인 3개만 개방.
--
-- ## 메타데이터 출처
-- - 25m × 5레인, 수심 1.3m: 첨벙(cbswim). 유아풀 명시 없음 → has_kids_pool=false.
-- - 좌표 [신뢰도 높음]: 카카오 POI "서울시립망우청소년센터"(망우동 241-2).
-- - 전화: 02-492-7942. 지하 2층. (양원역 인근)
--
-- 사진: pool-photos/POOL_0113.jpg 미확보 → photo_url null.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_weekday, price_per_sat, price_monthly, photo_url,
  schedule_source_url
) values
  ('POOL_0113', '서울시립망우청소년센터', '서울', '중랑구',
    '서울특별시 중랑구 송림길 156',
    37.6062915082388, 127.109037417436, 'indoor', 'public',
    '02-492-7942', 'https://mangwoo.kr/',
    5, 25, 1.3, 1.3,
    '{}', false, false, false,
    true, true,
    4700, 4700, 72500, null,
    'https://mangwoo.kr/bbs/content.php?co_id=sport01')
on conflict (id) do nothing;

-- 자유수영 시간표. 50분=0.83. 운영 월~토(일요일 미운영), 토요일은 1부만.
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0113', '풀스데이', $${
    "월": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}],
    "화": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}],
    "수": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}],
    "목": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}],
    "금": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"18:00","end":"18:50","hours":0.83}],
    "토": [{"start":"08:00","end":"08:50","hours":0.83}]
  }$$::jsonb, $${
    "월":"자유수영 시 튜브·킥판 등 보조기구는 사용할 수 없습니다.",
    "화":"자유수영 시 튜브·킥판 등 보조기구는 사용할 수 없습니다.",
    "수":"자유수영 시 튜브·킥판 등 보조기구는 사용할 수 없습니다.",
    "목":"자유수영 시 튜브·킥판 등 보조기구는 사용할 수 없습니다.",
    "금":"자유수영 시 튜브·킥판 등 보조기구는 사용할 수 없습니다.",
    "토":"토요일은 오전 1부(08:00)만 운영하며 3개 레인을 개방합니다."
  }$$::jsonb, '2026-06-07'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_0113'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0113');
