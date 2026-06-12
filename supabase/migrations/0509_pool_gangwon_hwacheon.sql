-- Pool's day — 강원 화천국민문화체육센터수영장 등록 (POOL_0532).
--
-- 배경: 화천군 공식 사이트(ihc.go.kr)가 JS 렌더라 체육시설 목록 curl에서 수영장이 안 잡혀
--   "화천엔 공공 풀 없음"으로 잘못 판단했음. 크리스 제보(현장 방문 후기 블로그)로 실재 확인.
-- 출처: 화천군 운영 센터(2층 실내수영장). 운영시간/요금은 센터 게시 기준(블로그 캡처 1차 확인, 블로그 URL은 미노출).
-- 모델: 자유수영 시간표 없이 운영시간 내 상시 자유수영 → 운영창 모델(대전 한밭 패턴).
--   운영 06:00~20:00(탈수 19:40), 매주 일요일·공휴일 휴관 → 월~토 슬롯.
-- 규격: 5레인, 메인 수심 1.3m, 어린이풀 0.7m(has_kids_pool). 길이 미게시 → null.
-- 요금: 일일입장 성인 3,000(평일=주말). 좌표=카카오 POI. POOL ID=prod max 기준 0532.
-- ※ prod 적용은 supabase-js insert로 수행(pg prune). 이 파일은 source-of-record.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0532', '화천국민문화체육센터수영장', '강원', '화천군', '강원특별자치도 화천군 화천읍 상승로 45-12',
    38.10531224043828, 127.7041608046142, 'indoor', 'public',
    null, 'https://www.ihc.go.kr', 5, null, 1.3, 1.3,
    '{}', true, false, false,
    true, true, 3000, 3000, null, 'https://www.ihc.go.kr')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0532', '풀스데이', $${"월":[{"start":"06:00","end":"20:00","hours":14}],"화":[{"start":"06:00","end":"20:00","hours":14}],"수":[{"start":"06:00","end":"20:00","hours":14}],"목":[{"start":"06:00","end":"20:00","hours":14}],"금":[{"start":"06:00","end":"20:00","hours":14}],"토":[{"start":"06:00","end":"20:00","hours":14}]}$$::jsonb, '{}'::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0532' and exists (select 1 from public.schedules where pool_id = 'POOL_0532');
