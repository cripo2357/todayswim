-- Pool's day — Phase 2: 수영장 1곳 추가: 서울대학교 포스코스포츠센터 (POOL_0034).
--
-- ## 시간표·가격 출처
--
-- 운영자(크리스) 제공 공식 자유수영 시간표(spolex.snu.ac.kr/program/program02.php) — 1차.
--
-- - ★접근 제약: 요금이 학생/교직원/동창으로만 구분 = **서울대 구성원 전용**(일반인 불가),
--   만 18세 이상. 일반 유저 헛걸음 방지 위해 day_notes에 "구성원 전용" 안내를 전 요일에 명시.
--   (등록 사유: 서울대 구성원도 풀스데이 유저 + 해당 풀 기반 수영 클럽 형성 가능 — 운영자 판단)
-- - 자유수영 일일입장 시간표 (표 그대로):
--   · 월~금: 06:00~22:00 (16h)
--   · 토   : 10:00~17:00 (7h, 입장 9:50부터)
--   · 일·공휴일: 전관 휴관 → 키 미포함
-- - 가격: 일일입장 학생 7,000 / 교직원 10,000 / 동창 12,000.
--   스키마 단일가라 **학생가 7,000을 대표가로 저장**(서울대생 주 타깃). 교직원·동창 차등은
--   schedule_source_url 페이지로 우회 — 필요 시 안내 보강.
--
-- ## 메타데이터 출처 / 미상
--
-- - 좌표 [신뢰도 높음]: 카카오 POI "서울대학교 관악캠퍼스 포스코스포츠센터" 정확 매치.
-- - 주소·전화: 공식 사이트(관악로 1 71-2동, 02-880-6980).
-- - ownership=private(대학 구성원 전용 시설). has_kids_pool=false(만18세+ 시설).
-- - 레인수·수심·25/50m: 출처에 없음 → NULL(임의생성 금지). 추후 보강.
-- - photo_url=NULL: 사진 미수령 → 정규화 경로로 추후 UPDATE.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0034', '서울대학교 포스코스포츠센터', '서울', '관악구',
    '서울특별시 관악구 관악로 1 71-2동',
    37.4682554939568, 126.95169724727137, 'indoor', 'private',
    '02-880-6980', 'https://spolex.snu.ac.kr/',
    null, null, null, null,
    '{}', false, false, false,
    true, true,
    7000, 7000, 7000, null,
    'https://spolex.snu.ac.kr/program/program02.php')
on conflict (id) do nothing;

-- 자유수영 시간표 (공식 표 그대로). hours = (종료 - 시작) 시간.
-- day_notes: 서울대 구성원 전용 제약을 운영 요일 전체에 안내(슬롯 1개+ 요일이라 표기 가능).
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0034', '풀스데이', $${
    "월": [{"start":"06:00","end":"22:00","hours":16}],
    "화": [{"start":"06:00","end":"22:00","hours":16}],
    "수": [{"start":"06:00","end":"22:00","hours":16}],
    "목": [{"start":"06:00","end":"22:00","hours":16}],
    "금": [{"start":"06:00","end":"22:00","hours":16}],
    "토": [{"start":"10:00","end":"17:00","hours":7}]
  }$$::jsonb, $${
    "월": "서울대 구성원(학생·교직원·동창)만 이용 가능",
    "화": "서울대 구성원(학생·교직원·동창)만 이용 가능",
    "수": "서울대 구성원(학생·교직원·동창)만 이용 가능",
    "목": "서울대 구성원(학생·교직원·동창)만 이용 가능",
    "금": "서울대 구성원(학생·교직원·동창)만 이용 가능",
    "토": "서울대 구성원(학생·교직원·동창)만 이용 가능"
  }$$::jsonb, '2026-06-04'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_0034'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0034');
