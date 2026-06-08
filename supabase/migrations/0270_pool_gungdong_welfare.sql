-- Pool's day — 구로구: 궁동종합사회복지관 수영장 추가 (POOL_0139). 구립(구로구 위탁)=public.
--
-- ## 시간표 출처 [1차 — 운영자 공식]
-- 궁동종합사회복지관 공식 홈 '건강복지사업' 페이지(happykd.or.kr/sub/sub03_03.php)에
-- 자유수영 요일별 이용시간 + 일일이용료 명시.
--   · 평일: 오전 08:00–08:50 + 점심(월·수·금 13:00–13:50 / 화·목 12:00–12:50)
--   · 토: 08:00–10:50, 14:00–17:50
--   · 일요일 미운영.
-- - 가격: 1일 이용 성인 4,000원(아동 3,000). 토요일도 동일 → 주말 4,000.
--
-- ## 메타데이터 출처
-- - 좌표 [신뢰도 높음]: 카카오 POI "궁동종합사회복지관"(궁동 108-9).
-- - 전화 02-2613-9367. 오리로22길 5. 구립 위탁 → ownership=public.
-- - 규격 [2차 OK]: 25m 4레인(leonlsy 블로그). 수심 미상 → null. 유아풀 정보 없음.
-- - 사진 없음 → photo_url null (v1 로컬 폴백).

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0139', '궁동종합사회복지관', '서울', '구로구',
    '서울특별시 구로구 오리로22길 5',
    37.49907419081401, 126.829665449974, 'indoor', 'public',
    '02-2613-9367', 'http://www.happykd.or.kr/',
    4, 25, null, null,
    '{}', false, false, false,
    true, true,
    4000, 4000,
    null,
    'http://www.happykd.or.kr/sub/sub03_03.php')
on conflict (id) do nothing;

-- 자유수영 시간표. 50분=0.83, 2h50m=2.83, 3h50m=3.83.
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0139', '풀스데이', $${
    "월": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"13:00","end":"13:50","hours":0.83}],
    "화": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"12:50","hours":0.83}],
    "수": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"13:00","end":"13:50","hours":0.83}],
    "목": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"12:50","hours":0.83}],
    "금": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"13:00","end":"13:50","hours":0.83}],
    "토": [{"start":"08:00","end":"10:50","hours":2.83},{"start":"14:00","end":"17:50","hours":3.83}]
  }$$::jsonb, '{}'::jsonb, '2026-06-09'::timestamptz)
on conflict (pool_id) do nothing;

update public.pools
set has_schedule = true
where id = 'POOL_0139'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0139');
