-- Pool's day — 강북구 배치 시작: 강북문화예술회관 수영장 추가 (POOL_0119).
--
-- ## 시간표 출처 [1차 — 운영자 공식]
--
-- 크리스가 강북문화예술회관 공식 홈페이지(gbcmc.or.kr/fmcs/66) '일일자유' 표 캡처 제공.
--
-- - 일일자유수영(평일 50분, 주말 회차):
--   · 평일(월~금): 18:00–18:50 (성인 4,000)
--     ※ 화·목 18시는 아쿠아로빅 강습으로 성인풀 2레인·청소년풀 4레인만 이용.
--     ※ 조기자유(06:00~07:50)·저녁자유(19:00~21:50)는 월 회원 전용 → 일일자유 아님(제외).
--   · 토: 06:00–07:50, 10:00–11:50, 16:00–17:50 (성인 4,800, 20%할증)
--   · 일: 09:00–11:50, 13:00–14:50, 16:00–17:50 (성인 4,800, 20%할증)
-- - 가격: 평일 성인 4,000 / 주말(토·일) 성인 4,800.
-- - 유의: 개인물품(킥판·오리발·튜브 등) 사용금지. 36개월 이하 무료(서류). 정원 초과 시 입장 제한.
--
-- ## 메타데이터 출처
-- - 성인풀 25m 6레인 + 청소년풀 20m 4레인(공식). 유아/어린이전용풀 없음 → has_kids_pool=false.
-- - 좌표 [신뢰도 높음]: 카카오 POI "강북문화예술회관 수영장"(수유동 360-10).
-- - 전화: 02-944-3060. 삼각산로 85.
--
-- 사진: pool-photos/POOL_0119.jpg 미확보 → photo_url null.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0119', '강북문화예술회관', '서울', '강북구',
    '서울특별시 강북구 삼각산로 85',
    37.64082371108912, 127.01330514154077, 'indoor', 'public',
    '02-944-3060', 'https://www.gbcmc.or.kr/',
    6, 25, null, null,
    '{}', false, false, false,
    true, true,
    4000, 4800, null,
    'https://www.gbcmc.or.kr/fmcs/66')
on conflict (id) do nothing;

-- 자유수영 시간표. 평일 50분=0.83. 토 1시간50분=1.83. 일 1부 2시간50분=2.83.
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0119', '풀스데이', $${
    "월": [{"start":"18:00","end":"18:50","hours":0.83}],
    "화": [{"start":"18:00","end":"18:50","hours":0.83}],
    "수": [{"start":"18:00","end":"18:50","hours":0.83}],
    "목": [{"start":"18:00","end":"18:50","hours":0.83}],
    "금": [{"start":"18:00","end":"18:50","hours":0.83}],
    "토": [
      {"start":"06:00","end":"07:50","hours":1.83},
      {"start":"10:00","end":"11:50","hours":1.83},
      {"start":"16:00","end":"17:50","hours":1.83}
    ],
    "일": [
      {"start":"09:00","end":"11:50","hours":2.83},
      {"start":"13:00","end":"14:50","hours":1.83},
      {"start":"16:00","end":"17:50","hours":1.83}
    ]
  }$$::jsonb, $${
    "월":"자유수영 시 킥판·오리발·튜브 등 개인물품은 사용할 수 없습니다.",
    "화":"화·목 18시는 아쿠아로빅 강습으로 일부 레인만 운영합니다. 개인물품(킥판·오리발 등) 사용 금지.",
    "수":"자유수영 시 킥판·오리발·튜브 등 개인물품은 사용할 수 없습니다.",
    "목":"화·목 18시는 아쿠아로빅 강습으로 일부 레인만 운영합니다. 개인물품(킥판·오리발 등) 사용 금지.",
    "금":"자유수영 시 킥판·오리발·튜브 등 개인물품은 사용할 수 없습니다.",
    "토":"자유수영 시 킥판·오리발·튜브 등 개인물품은 사용할 수 없습니다.",
    "일":"자유수영 시 킥판·오리발·튜브 등 개인물품은 사용할 수 없습니다."
  }$$::jsonb, '2026-06-07'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_0119'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0119');
