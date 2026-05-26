-- Pool's day — Phase 2: 수영장 1곳 추가: 금천구민문화체육센터 (POOL_0017).
--
-- ## 시간표 출처
--
-- 공식 사이트 gfmc.kr (운영자 측 1차 자료) — pool_schedule_source_priority 1차만.
-- 운영자가 안내한 블로그(jeongej321) 등 2차 자료는 정책상 일체 미사용.
-- 출처 페이지:
--   · sub05_030101.php — 자유수영 운영 안내
--   · sub05_030102.php?tab_num=2 — 시설(레인 수, 유아풀)
--
-- - 자유수영 운영(공식 그대로): "일요일 자유수영 (5월~10월 1, 3주 개방)"
--   · 1부: 10:00 ~ 11:50
--   · 2부: 13:00 ~ 14:50
--   · 3부: 16:00 ~ 17:50 (7,8월 한정 운영)
-- - 11월 ~ 4월: 공식 안내상 자유수영 운영 없음.
-- - 평일/토요일: 공식 안내상 자유수영 미운영(강습/회원 중심).
--
-- 운영자(크리스) 컨펌: 공식 그대로 등록. 추후 운영자 추가 정보 입수 시 보강.
--
-- ## 데이터 모델링 — KBS(POOL_0004) 시즌 slot_groups 패턴 확장 (0036/0038 참고)
--
-- KBS는 2시즌(기본·하절기). 금천은 3시즌으로 명시적 분기:
--
-- - slot_groups.일 = 3개 그룹 (months 합집합이 1~12월 전체 커버):
--   · 그룹A "기본 운영"  months:[5,6,9,10] — 1·2부
--   · 그룹B "여름 운영"  months:[7,8]      — 1·2·3부 (3부 추가)
--   · 그룹C "겨울 휴장"  months:[1,2,3,4,11,12] — slots:[] (자유수영 미운영)
-- - by_day = 기본 시즌 기준 1·2부, 일요일에만. 요일 칩/게이팅 기준.
--   다른 요일은 자유수영 자체가 없어 비움.
-- - "1·3주 일요일" 주차 제한은 슬롯 모델로 표현 불가 → 라벨 텍스트에 명시
--   (KBS의 "매월 2,4주차 일요일은 쉽니다." 라벨링 패턴과 동일).
-- - day_notes는 슬롯 1개+ 요일일 때만 사용(day_note_constraint) → 미사용.
--
-- ## 메타데이터 출처
--
-- - 시설(성인풀 6레인, 유아풀, 958㎡, 지하 2층): 공식 sub05_030102.
-- - 수심 1.2m: 운영자(크리스) 확인.
-- - 풀 길이: 공식 미명시·운영자 미확인 → null (추후 보강).
-- - 가격(자유수영 1회 4,200원): 운영자(크리스) 확인. 평일/주말 구분 없음 가정.
-- - 좌표 [신뢰도 높음]: 카카오 POI "금천구민문화체육센터 수영장" 정확 매치
--   (금천구 독산동 371-2, 도로명 독산로54길 188).
-- - 전화: 02-861-1313 (공식 sub05_030101).
--
-- 사진: pool-photos/POOL_0017.jpg 업로드 대기.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0017', '금천구민문화체육센터', '서울', '금천구',
    '서울특별시 금천구 독산로54길 188',
    37.470186148348, 126.90748875715, 'indoor', 'public',
    '02-861-1313', 'https://www.gfmc.kr/page/business/sub05_030101.php',
    6, null, 1.2, 1.2,
    '{}', true, false, false,
    true, true,
    4200, 4200, 4200,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0017.jpg',
    'https://www.gfmc.kr/page/business/sub05_030101.php')
on conflict (id) do nothing;

-- 자유수영 시간표 (공식 사이트 그대로). 일요일만 운영, 시즌별 그룹.
-- hours = (종료 - 시작) 분/60. 1h50m = 1.83.
insert into public.schedules (pool_id, author_nickname, by_day, slot_groups, updated_at) values
  ('POOL_0017', '풀스데이', $${
    "일": [
      {"start":"10:00","end":"11:50","hours":1.83},
      {"start":"13:00","end":"14:50","hours":1.83}
    ]
  }$$::jsonb, $${
    "일": [
      {"label":"기본 운영 (5,6,9,10월 매월 1·3주 일요일)", "months":[5,6,9,10], "slots":[
        {"start":"10:00","end":"11:50","hours":1.83},
        {"start":"13:00","end":"14:50","hours":1.83}
      ]},
      {"label":"여름 운영 (7,8월 매월 1·3주 일요일, 3부 추가)", "months":[7,8], "slots":[
        {"start":"10:00","end":"11:50","hours":1.83},
        {"start":"13:00","end":"14:50","hours":1.83},
        {"start":"16:00","end":"17:50","hours":1.83}
      ]},
      {"label":"겨울 휴장 (11~4월 자유수영 미운영)", "months":[1,2,3,4,11,12], "slots":[]}
    ]
  }$$::jsonb, '2026-05-26'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_0017'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0017');
