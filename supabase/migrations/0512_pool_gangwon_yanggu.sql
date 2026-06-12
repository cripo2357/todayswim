-- Pool's day — 강원 양구청소년수련관수영장 등록 (POOL_0549). 강원 군 배치 마지막(10/10).
--
-- 배경: 양구 실내수영장은 국민체육센터(헬스/다목적)가 아니라 '양구 교육캠퍼스 내 청소년수련관'에 있음.
--   공식 이용시간은 yanggu.go.kr/happyedu 시설 페이지에서 scripts/render-js.mjs(헤드리스)로 확보.
-- 이용시간: 화~금 09:00~22:00 / 토·일·공휴 09:00~18:00 / 월 휴관(시설 공식 이용시간).
--   (수영장 정기 물교체 재개장 공지엔 06:00 언급 → 새벽 자유수영이 더 이를 수 있어 현장 확인 여지.)
-- 요금: 일일 일반 3,000(청소년·군인 2,000 / 경로·어린이 1,500). 규격 미게시 → null. 좌표=카카오 POI.
-- prod 적용=supabase-js insert(pg prune). 이 파일=source-of-record.

insert into public.pools (id, name, region, district, address, lat, lng, type, ownership, phone, website, lane_count, pool_length, depth_min, depth_max, facilities, has_kids_pool, has_diving_pool, is_hotel_pool, has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url) values
  ('POOL_0549', '양구청소년수련관수영장', '강원', '양구군', '강원특별자치도 양구군 양구읍 박수근로 366-27', 38.10579409316898, 127.98158457726151, 'indoor', 'public', '033-480-2586', 'https://yanggu.go.kr/happyedu', 4, 25, null, null, '{}', false, false, false, true, true, 3000, 3000, null, 'https://yanggu.go.kr/happyedu/Home/H30000/H30100/html')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0549', '풀스데이', $${"화":[{"start":"09:00","end":"22:00","hours":13}],"수":[{"start":"09:00","end":"22:00","hours":13}],"목":[{"start":"09:00","end":"22:00","hours":13}],"금":[{"start":"09:00","end":"22:00","hours":13}],"토":[{"start":"09:00","end":"18:00","hours":9}],"일":[{"start":"09:00","end":"18:00","hours":9}]}$$::jsonb, '{}'::jsonb, '2026-06-13'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0549' and exists (select 1 from public.schedules where pool_id = 'POOL_0549');
