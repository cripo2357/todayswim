-- Pool's day — Phase 2: 수영장 1곳 추가: 신도림생활체육관 (POOL_0023).
--
-- ## 시간표 출처
--
-- 공식 사이트 gurosisul.or.kr (구로시설관리공단) — pool_schedule_source_priority 1차 출처.
-- - b04-3&c=1 시설소개 / c=2 프로그램. SSL 체인 오류 → curl -k (KBS 패턴).
-- 운영자가 안내한 블로그(gyp03417n)는 정책상 일체 미사용.
--
-- - 수영장 일반공개 (공식 c=2 그대로):
--   · 평일 일일입장 화·목 11:00~11:50, 성인 4,000원, **11월~3월 운영(시즌 한정)**
--   · 토요일 일일입장 (연중운영):
--     - 09:00~10:20
--     - 10:30~11:50
--     - 15:00~16:20
--     - 16:30~17:50
--   · 일요일 / 월·수·금: 자유수영 일일입장 없음 (강습/등록형만).
-- - 요금: 평일 성인 4,000원 / 토 성인 4,500원·청소년 3,500원·어린이 2,500원.
--
-- ## 데이터 모델링 — 평일 시즌 분기, 토 연중
--
-- - by_day = 화·목(11:00) + 토(4슬롯). 다른 요일 키 미포함.
--   화·목 11시는 11~3월에만 운영이라 by_day는 그 시즌 기준으로 표기
--   (운영하는 시즌에만 채워두는 게 자연스러움).
-- - slot_groups.화·목 = 2개 그룹:
--   · "겨울 시즌 운영 (11~3월)" months:[1,2,3,11,12] — [11:00]
--   · "여름 시즌 휴장 (4~10월)"  months:[4,5,6,7,8,9,10] — slots:[]
-- - 토요일은 연중 동일 → slot_groups 미정의 (by_day 폴백).
-- - day_notes는 슬롯 1개+ 요일일 때만 사용 → 사용 가능하지만 시즌 정보는
--   slot_groups 라벨로 표현이 더 정확 → day_notes 미사용.
--
-- ## 메타데이터 출처
--
-- - 시설(성인풀 25m × 5레인, 어린이풀, 지하2층): 공식 c=1.
-- - 수심·어린이풀 사이즈: 공식 미명시 → null.
-- - 좌표 [신뢰도 높음]: 카카오 POI "신도림생활체육관 수영장" 정확 매치
--   (구로구 신도림동 324-4, 도로명 경인로67길 149).
-- - 전화: 02-839-4875 (시설관리공단 대표).

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0023', '신도림생활체육관', '서울', '구로구',
    '서울특별시 구로구 경인로67길 149',
    37.5138093886018, 126.883179543153, 'indoor', 'public',
    '02-839-4875', 'https://www.gurosisul.or.kr/mod.asp?m=business&s=b04-3&t=1&c=1',
    5, 25, null, null,
    '{}', true, false, false,
    true, true,
    4000, 4000, 4500,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0023.jpg',
    'https://www.gurosisul.or.kr/mod.asp?m=business&s=b04-3&t=1&c=2')
on conflict (id) do nothing;

-- 자유수영 시간표. 평일 화·목 11시는 11~3월만 운영 → slot_groups 분기.
-- 토요일은 연중 동일.
-- hours: 50분=0.83, 1h20m=1.33.
insert into public.schedules (pool_id, author_nickname, by_day, slot_groups, updated_at) values
  ('POOL_0023', '풀스데이', $${
    "화": [{"start":"11:00","end":"11:50","hours":0.83}],
    "목": [{"start":"11:00","end":"11:50","hours":0.83}],
    "토": [
      {"start":"09:00","end":"10:20","hours":1.33},
      {"start":"10:30","end":"11:50","hours":1.33},
      {"start":"15:00","end":"16:20","hours":1.33},
      {"start":"16:30","end":"17:50","hours":1.33}
    ]
  }$$::jsonb, $${
    "화": [
      {"label":"겨울 시즌 운영 (11~3월 화·목 11시)", "months":[1,2,3,11,12], "slots":[
        {"start":"11:00","end":"11:50","hours":0.83}
      ]},
      {"label":"여름 시즌 휴장 (4~10월 평일 자유수영 미운영)", "months":[4,5,6,7,8,9,10], "slots":[]}
    ],
    "목": [
      {"label":"겨울 시즌 운영 (11~3월 화·목 11시)", "months":[1,2,3,11,12], "slots":[
        {"start":"11:00","end":"11:50","hours":0.83}
      ]},
      {"label":"여름 시즌 휴장 (4~10월 평일 자유수영 미운영)", "months":[4,5,6,7,8,9,10], "slots":[]}
    ]
  }$$::jsonb, '2026-05-26'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_0023'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0023');
