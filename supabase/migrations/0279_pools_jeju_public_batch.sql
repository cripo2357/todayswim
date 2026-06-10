-- Pool's day — 제주 공공 수영장 1차 배치 등록 (POOL_0151~0152, 2곳). 서울·부산에 이은 첫 제주 확장.
--
-- ## 시간표 출처 [1차 — 운영자 공식]
-- 제주특별자치도 공공체육시설 예약통합관리시스템(psf.kr) 각 시설 안내 페이지의
-- 자유수영(현장매표 일일입장) 운영시간·요금에서 추출. 청소시간(12:00~14:00)으로 오전/오후 슬롯이
-- 명확히 구분되고 강습 표기가 없는 자유수영 개방시간 표 그대로 반영. 25m/blog 등 2차는 미사용.
-- 각 풀 schedule_source_url에 공식 페이지 명시.
--
-- ## 보류된 제주 공공 풀(이번 배치 제외 — 1차 출처 데이터 불완전)
-- - 서귀포국민체육센터: 운영시간이 06:00~22:00 통으로만 표기돼 강습/자유수영 구분 불가.
-- - 서부·동부 국민체육센터: psf.kr에 요금 정보 없음(동부는 자유/강습 구분도 없음).
-- - 외도실내수영장: 제주대·제주시청 수영부 선수 전용 훈련장으로 일반 자유수영 개방 불확실.
-- - 제주종합경기장 실내수영장: 현재 내부공사 중.
--
-- ## 메타
-- - 좌표 [신뢰도 높음]: 카카오 Local API. 주소 검색과 POI 검색이 약 15m 내 일치, POI 좌표 채택.
-- - 규격: psf.kr 공식 표기분만, 미확인 null. 사진 없음 → photo_url null.
-- - 두 곳 모두 매주 화요일 휴관 → 화 슬롯 없음. 12:00~14:00 청소시간으로 입장 불가.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0151', '제주시국민체육센터', '제주', '제주시', '제주특별자치도 제주시 사라봉동길 25',
    33.5145777246342, 126.546298530644, 'indoor', 'public',
    '064-728-3461', 'https://www.psf.kr', 6, 25, 1.4, 1.5,
    '{}', true, false, false,
    true, true, 2000, 2000, null, 'https://www.psf.kr/sports/bview/85')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0151', '풀스데이', $${"월":[{"start":"06:00","end":"12:00","hours":6},{"start":"14:00","end":"21:00","hours":7}],"수":[{"start":"06:00","end":"12:00","hours":6},{"start":"14:00","end":"21:00","hours":7}],"목":[{"start":"06:00","end":"12:00","hours":6},{"start":"14:00","end":"21:00","hours":7}],"금":[{"start":"06:00","end":"12:00","hours":6},{"start":"14:00","end":"21:00","hours":7}],"토":[{"start":"06:00","end":"12:00","hours":6},{"start":"14:00","end":"18:00","hours":4}],"일":[{"start":"06:00","end":"12:00","hours":6},{"start":"14:00","end":"18:00","hours":4}]}$$::jsonb, '{}'::jsonb, '2026-06-10'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0151' and exists (select 1 from public.schedules where pool_id = 'POOL_0151');

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0152', '애월국민체육센터', '제주', '제주시', '제주특별자치도 제주시 애월읍 하귀동남1길 22',
    33.4847568446627, 126.413764657416, 'indoor', 'public',
    '064-728-3915', 'https://www.psf.kr', null, 25, null, null,
    '{}', true, false, false,
    true, true, 2000, 2000, null, 'https://www.psf.kr/sports/bview/84')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0152', '풀스데이', $${"월":[{"start":"06:00","end":"12:00","hours":6},{"start":"14:00","end":"21:00","hours":7}],"수":[{"start":"06:00","end":"12:00","hours":6},{"start":"14:00","end":"21:00","hours":7}],"목":[{"start":"06:00","end":"12:00","hours":6},{"start":"14:00","end":"21:00","hours":7}],"금":[{"start":"06:00","end":"12:00","hours":6},{"start":"14:00","end":"21:00","hours":7}],"토":[{"start":"06:00","end":"12:00","hours":6},{"start":"14:00","end":"18:00","hours":4}],"일":[{"start":"06:00","end":"12:00","hours":6},{"start":"14:00","end":"18:00","hours":4}]}$$::jsonb, '{}'::jsonb, '2026-06-10'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0152' and exists (select 1 from public.schedules where pool_id = 'POOL_0152');
