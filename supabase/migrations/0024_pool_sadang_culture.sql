-- Pool's Day v1 — 수영장 1곳 추가: 사당문화회관 (POOL_SEOUL_0006).
-- 출처: https://cbswim.webflow.io/suyeongjang/sadangmunhwahoegwan
--        (동작구도시관리공단 http://sports.idongjak.or.kr/home/59, 시간표 기준 2023-12-01)
-- 풀 등록 워크플로: 운영자가 검토 후 마이그레이션으로 1곳씩 + 시간표 동시 등록.
--
-- 좌표 신뢰도 [낮음]: OSM Nominatim 결과가 도로 중심값(사당로8길, class=highway)뿐 —
--   건물/번지 매치 없음. 37.4836888, 126.9683910 은 사당동 도로 인근 *근사값*.
--   → 카카오맵 우클릭 정밀 좌표로 추후 별도 UPDATE 보정 필요(0021→0022 사례 동일).
-- depth: 출처 "전화문의 필요" → 미상이라 컬럼 생략(NULL, 임의 생성 X).
-- facilities: 출처 명시 없음 → 비움. price_per_session: 평일 4,400원(주말 5,700 — 단일 컬럼).
-- photo_url: 신규 풀이라 INSERT에 직접 박음(ON CONFLICT 함정 무관). 운영자는
--   pool-photos/POOL_SEOUL_0006.jpg 업로드만 하면 됨(업로드 전엔 썸네일만 미표시).

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_per_session, photo_url
) values
  ('POOL_SEOUL_0006', '사당문화회관', '서울', '동작구',
    '서울특별시 동작구 사당로8길 9',
    37.4836888, 126.9683910, 'indoor', 'public',
    '02-588-4111', 'http://sports.idongjak.or.kr/home/59',
    4, 25,
    '{}', false, false, false,
    true, true, 4400,
    'https://jdvpesumvkspoxrdqbqw.supabase.co/storage/v1/object/public/pool-photos/POOL_SEOUL_0006.jpg')
on conflict (id) do nothing;

-- 자유수영 시간표 (출처 표)
--   월~목 13:00~13:50·19:00~19:50 / 금 13:00~13:50·19:00~21:50(저녁 연장)
--   토 13:00~14:50·15:00~16:50 / 일 4슬롯(09·11·13·15시대) — 일은 매월 1주차만 운영(day_note)
--   hours = 분/60 (50분=0.83, 1h50m=1.83, 2h50m=2.83).
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_SEOUL_0006', '운영자', $${
    "월": [{"start":"13:00","end":"13:50","hours":0.83}, {"start":"19:00","end":"19:50","hours":0.83}],
    "화": [{"start":"13:00","end":"13:50","hours":0.83}, {"start":"19:00","end":"19:50","hours":0.83}],
    "수": [{"start":"13:00","end":"13:50","hours":0.83}, {"start":"19:00","end":"19:50","hours":0.83}],
    "목": [{"start":"13:00","end":"13:50","hours":0.83}, {"start":"19:00","end":"19:50","hours":0.83}],
    "금": [{"start":"13:00","end":"13:50","hours":0.83}, {"start":"19:00","end":"21:50","hours":2.83}],
    "토": [{"start":"13:00","end":"14:50","hours":1.83}, {"start":"15:00","end":"16:50","hours":1.83}],
    "일": [
      {"start":"09:00","end":"10:50","hours":1.83},
      {"start":"11:00","end":"12:50","hours":1.83},
      {"start":"13:00","end":"14:50","hours":1.83},
      {"start":"15:00","end":"16:50","hours":1.83}
    ]
  }$$::jsonb, $${"일":"매월 1주차에만 운영합니다."}$$::jsonb, '2026-05-16'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_SEOUL_0006'
  and exists (select 1 from public.schedules where pool_id = 'POOL_SEOUL_0006');
