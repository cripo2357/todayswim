-- Pool's day — 동대문구 배치: 시립동대문청소년센터 수영장 추가 (POOL_0109).
--
-- ## 시간표 출처 [1차 — 운영자 공식]
--
-- 공식 홈페이지 수영 프로그램 페이지(ddmy.or.kr/bbs/content.php?co_id=class_01)에서
-- 자유수영(일일입장권) 표를 직접 파싱. 이것이 1차 출처. 첨벙/swimmingis는 시간표
-- "수집중" 상태라 규격(레인/길이)만 보조 참조.
--
-- - 자유수영(일일입장권) 시간표 — 시간당 50분, 정원 선착순:
--   · 월/수/금: 오전 11:00–11:50, 12:00–12:50 (정원 45명)
--              + 오후 18:00–18:50, 19:00–19:50, 20:00–20:50, 21:00–21:50 (정원 30명)
--   · 화/목   : 오후 18:00–18:50, 19:00–19:50, 21:00–21:50 (정원 30명)
--              ※ 화/목 오전반은 초등 생존수영으로 운영중단(추후 재개 공지) → 제외.
--              ※ 화/목 20:00은 아쿠아로빅 운영이라 자유수영 제외.
--   · 토/일   : 자유수영 미운영.
-- - 가격: 성인 4,500원 / 중·고생 2,500원 (평일 일일입장권). 주말 미운영 → 주말가 없음.
--   자유수영 전용 월권/회차권은 공식에 없음(아침·오전 자유정액은 강습 묶음이라 제외).
--
-- ## 메타데이터 출처
--
-- - 25m × 5레인: 첨벙(cbswim) 상세. 수심 미확인(null), 유아풀 미명시(false).
-- - 좌표 [신뢰도 높음]: 카카오 Local 도로명 매치 "서울 동대문구 제기로33길 25"
--   (POI '시립동대문청소년센터'와 동일 지점).
-- - 전화: 02-3295-1478.
--
-- 사진: pool-photos/POOL_0109.jpg 미확보 → photo_url null(추후 워크플로로 추가).

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_weekday, photo_url,
  schedule_source_url
) values
  ('POOL_0109', '시립동대문청소년센터', '서울', '동대문구',
    '서울특별시 동대문구 제기로33길 25',
    37.5872413382227, 127.049826506747, 'indoor', 'public',
    '02-3295-1478', 'http://www.ddmy.or.kr/',
    5, 25, null, null,
    '{}', false, false, false,
    true, true,
    4500, null,
    'https://www.ddmy.or.kr/bbs/content.php?co_id=class_01')
on conflict (id) do nothing;

-- 자유수영 시간표. hours = (종료 - 시작) 분/60. 50분=0.83.
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0109', '풀스데이', $${
    "월": [
      {"start":"11:00","end":"11:50","hours":0.83},
      {"start":"12:00","end":"12:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83},
      {"start":"19:00","end":"19:50","hours":0.83},
      {"start":"20:00","end":"20:50","hours":0.83},
      {"start":"21:00","end":"21:50","hours":0.83}
    ],
    "화": [
      {"start":"18:00","end":"18:50","hours":0.83},
      {"start":"19:00","end":"19:50","hours":0.83},
      {"start":"21:00","end":"21:50","hours":0.83}
    ],
    "수": [
      {"start":"11:00","end":"11:50","hours":0.83},
      {"start":"12:00","end":"12:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83},
      {"start":"19:00","end":"19:50","hours":0.83},
      {"start":"20:00","end":"20:50","hours":0.83},
      {"start":"21:00","end":"21:50","hours":0.83}
    ],
    "목": [
      {"start":"18:00","end":"18:50","hours":0.83},
      {"start":"19:00","end":"19:50","hours":0.83},
      {"start":"21:00","end":"21:50","hours":0.83}
    ],
    "금": [
      {"start":"11:00","end":"11:50","hours":0.83},
      {"start":"12:00","end":"12:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83},
      {"start":"19:00","end":"19:50","hours":0.83},
      {"start":"20:00","end":"20:50","hours":0.83},
      {"start":"21:00","end":"21:50","hours":0.83}
    ]
  }$$::jsonb, $${
    "월":"일일입장권은 시간당 정원 선착순 입장입니다.",
    "화":"일일입장권은 시간당 정원 선착순 입장입니다.",
    "수":"일일입장권은 시간당 정원 선착순 입장입니다.",
    "목":"일일입장권은 시간당 정원 선착순 입장입니다.",
    "금":"일일입장권은 시간당 정원 선착순 입장입니다."
  }$$::jsonb, '2026-06-07'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_0109'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0109');
