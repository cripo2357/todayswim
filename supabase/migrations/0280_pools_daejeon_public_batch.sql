-- Pool's day — 대전 공공 수영장 1차 배치 등록 (POOL_0153~0155, 3곳). 충청권 첫 확장.
--
-- ## 시간표 출처 [1차 — 운영자 공식]
-- 대전광역시시설관리공단(djsiseol.or.kr) 및 서구국민체육센터(sgsport.co.kr) 공식 페이지의
-- 자유수영 안내 표(원본 HTML 직접 파싱)에서 요일별 시간·요금 추출. 첨벙/swimmingis/blog 등 2차는 미사용.
-- 주의: WebFetch 요약 모델이 강습 시간표를 자유수영으로 오인하는 사례가 있어, 원본 표를 직접 검증함.
--   - 올림픽기념국민생활관: 공식 '자유수영 회차표'(회차×요일) 그대로 반영.
--   - 한밭수영장: 공식 이용안내의 '자유수영 이용시간'(운영시간 전체, 강습은 일부 레인 동시운영). 수요일 클린타임 15:00~17:00 제외.
--   - 서구국민체육센터: '어울림 자유수영' 표(평일 15:00~18:50, 주말·공휴일 06:00~17:30).
--
-- ## 메타
-- - 좌표 [신뢰도 높음]: 카카오 Local API(도로명 주소).
-- - 규격: 공식 확인분만(올림픽 메인풀 최고수심 1.4m/보조풀 0.8m), 미확인 null. 사진 없음 → photo_url null.
-- - 요금: 평일/주말 동일(성인 4,300 / 청소년 2,700).
-- - 보류(다음 배치): 용운국제수영장(재개관 직후+여름철 성인 제한 가능성), 동구·중구 국민체육센터·유성 월드컵스포츠센터(시간표 이미지/JS, 추가 확인 필요).

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0153', '올림픽기념국민생활관', '대전', '서구', '대전광역시 서구 신갈마로230번길 77',
    36.3547890167237, 127.373244411079, 'indoor', 'public',
    '042-610-2700', 'https://www.djsiseol.or.kr/portal/sub020601.asp', null, null, 0.8, 1.4,
    '{}', true, false, false,
    true, true, 4300, 4300, null, 'https://www.djsiseol.or.kr/portal/sub020604.asp')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0153', '풀스데이', $${"월":[{"start":"06:00","end":"11:00","hours":5},{"start":"14:10","end":"17:50","hours":3.67},{"start":"19:00","end":"20:50","hours":1.83}],"화":[{"start":"06:00","end":"11:00","hours":5},{"start":"14:10","end":"15:40","hours":1.5},{"start":"17:00","end":"20:50","hours":3.83}],"수":[{"start":"06:00","end":"11:00","hours":5},{"start":"14:10","end":"17:50","hours":3.67},{"start":"19:00","end":"20:50","hours":1.83}],"목":[{"start":"06:00","end":"11:00","hours":5},{"start":"14:10","end":"15:40","hours":1.5},{"start":"17:00","end":"20:50","hours":3.83}],"금":[{"start":"06:00","end":"11:00","hours":5},{"start":"14:10","end":"17:50","hours":3.67},{"start":"19:00","end":"20:50","hours":1.83}],"토":[{"start":"06:00","end":"11:00","hours":5},{"start":"14:10","end":"17:30","hours":3.33}],"일":[{"start":"06:00","end":"17:30","hours":11.5}]}$$::jsonb, '{}'::jsonb, '2026-06-10'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0153' and exists (select 1 from public.schedules where pool_id = 'POOL_0153');

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0154', '서구국민체육센터', '대전', '서구', '대전광역시 서구 정림서로 181',
    36.3037791474272, 127.36288842982, 'indoor', 'public',
    '042-583-8486', 'https://www.sgsport.co.kr', null, null, null, null,
    '{}', false, false, false,
    true, true, 4300, 4300, null, 'https://www.sgsport.co.kr/page/swim001')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0154', '풀스데이', $${"월":[{"start":"15:00","end":"18:50","hours":3.83}],"화":[{"start":"15:00","end":"18:50","hours":3.83}],"수":[{"start":"15:00","end":"18:50","hours":3.83}],"목":[{"start":"15:00","end":"18:50","hours":3.83}],"금":[{"start":"15:00","end":"18:50","hours":3.83}],"토":[{"start":"06:00","end":"17:30","hours":11.5}],"일":[{"start":"06:00","end":"17:30","hours":11.5}]}$$::jsonb, '{}'::jsonb, '2026-06-10'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0154' and exists (select 1 from public.schedules where pool_id = 'POOL_0154');

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0155', '한밭수영장', '대전', '중구', '대전광역시 중구 대종로 373',
    36.3173370007388, 127.428013823451, 'indoor', 'public',
    '042-724-3300', 'https://www.djsiseol.or.kr/portal/sub020301.asp', null, null, null, null,
    '{}', false, false, false,
    true, true, 4300, 4300, null, 'https://www.djsiseol.or.kr/portal/sub020303.asp')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0155', '풀스데이', $${"월":[{"start":"06:00","end":"21:00","hours":15}],"화":[{"start":"06:00","end":"21:00","hours":15}],"수":[{"start":"06:00","end":"14:30","hours":8.5},{"start":"17:00","end":"21:00","hours":4}],"목":[{"start":"06:00","end":"21:00","hours":15}],"금":[{"start":"06:00","end":"21:00","hours":15}],"토":[{"start":"06:00","end":"18:00","hours":12}],"일":[{"start":"06:00","end":"18:00","hours":12}]}$$::jsonb, '{}'::jsonb, '2026-06-10'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0155' and exists (select 1 from public.schedules where pool_id = 'POOL_0155');
