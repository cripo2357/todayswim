-- Pool's day v1 — 수영장 1곳 추가: 관악구민종합체육센터.
-- 출처: https://cbswim.webflow.io/suyeongjang/gwanagguminjonghabceyugsenteo
--        (관악도시관리공단 공식 https://www.gwanakgongdan.or.kr/fmcs/13, 시간표 기준일 2023-12-01)
-- 풀 등록 워크플로: bulk import 폐기 — 운영자가 검토 후 마이그레이션으로 1곳씩 추가.
-- 모든 풀은 자유수영 시간표를 함께 등록(시간표 없으면 풀 등록 X).
--
-- lat/lng: 낙성대동 시설 인근 근사값 (0012 컨벤션 동일, 좌표는 운영자 검수 단계 책임 —
--          정밀 좌표는 추후 운영자가 UPDATE). facilities: 출처에 명시 없어 비움(임의 생성 X).
-- price_per_session: 평일 1회 3,400원 기준 (주말 4,400원 — 단일 컬럼이라 평일가 사용).
-- photo_url: Storage 결정적 경로를 INSERT에 직접 박음 → 운영자는 pool-photos/POOL_SEOUL_0005.jpg
--            를 Supabase Storage(pool-photos 버킷)에 업로드만 하면 됨(별도 UPDATE 불필요).
--            업로드 전까지는 썸네일만 미표시(에러 아님).

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_per_session, photo_url
) values
  ('POOL_SEOUL_0005', '관악구민종합체육센터', '서울', '관악구',
    '서울특별시 관악구 낙성대로3길 37',
    37.4772, 126.9588, 'indoor', 'public',
    '02-870-7600', 'https://www.gwanakgongdan.or.kr/fmcs/13',
    6, 25, 1.2, 1.4,
    '{}', false, false, false,
    true, true, 3400,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_SEOUL_0005.jpg')
on conflict (id) do nothing;

-- 자유수영 시간표 (출처 표 그대로)
--   월·수·금 12:00~12:50 / 토 06-07:50·09-10:50·16-17:50·19-20:50 / 일 09-10:50·12-13:50·15-16:50
--   화·목 자유수영 없음 → 키 미포함. hours = 분/60 (50분=0.83, 1h50m=1.83).
insert into public.schedules (pool_id, author_nickname, by_day, updated_at) values
  ('POOL_SEOUL_0005', '운영자', $${
    "월": [{"start":"12:00","end":"12:50","hours":0.83}],
    "수": [{"start":"12:00","end":"12:50","hours":0.83}],
    "금": [{"start":"12:00","end":"12:50","hours":0.83}],
    "토": [
      {"start":"06:00","end":"07:50","hours":1.83},
      {"start":"09:00","end":"10:50","hours":1.83},
      {"start":"16:00","end":"17:50","hours":1.83},
      {"start":"19:00","end":"20:50","hours":1.83}
    ],
    "일": [
      {"start":"09:00","end":"10:50","hours":1.83},
      {"start":"12:00","end":"13:50","hours":1.83},
      {"start":"15:00","end":"16:50","hours":1.83}
    ]
  }$$::jsonb, '2026-05-16'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_SEOUL_0005'
  and exists (select 1 from public.schedules where pool_id = 'POOL_SEOUL_0005');
