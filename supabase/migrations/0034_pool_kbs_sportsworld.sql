-- Pool's Day v1 — 수영장 1곳 추가: KBS스포츠월드 (POOL_SEOUL_0008).
-- 출처: cbswim webflow. ※ 공식(kbssw.co.kr)은 SSL 인증서 오류로 fetch 검증 실패 —
--   시간표는 cbswim 단독(공식 교차검증 못 함). 추후 공식 확인되면 UPDATE 보정 가능.
-- 좌표 [신뢰도 높음]: 카카오 Local API 도로명주소 정확 매치 "서울 강서구 공항대로 376"
--   (ROAD_ADDR). 좌표 선확보 → INSERT에 직접 박음(단일 마이그레이션, 보정 없음).
-- 수심 1.2~1.8 (사용자 확인 — cbswim 미기재라 질문해서 받음, min≠max → 화면 "1.2~1.8m").
-- ownership=private: KBS비즈(주) 운영 민간 시설(요금 8천/9천대). 가격 성인 평일/주말(쉼표 없는 정수).
-- 작성자 '풀스데이'. photo_url 신규 풀이라 INSERT에 직접 박음(pool-photos/POOL_SEOUL_0008.jpg 업로드 필요).

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url
) values
  ('POOL_SEOUL_0008', 'KBS스포츠월드', '서울', '강서구',
    '서울특별시 강서구 공항대로 376',
    37.5568483, 126.8471933, 'indoor', 'private',
    '02-2600-8852', 'https://kbssw.co.kr',
    8, 50, 1.2, 1.8,
    '{}', false, false, false,
    true, true,
    8000, 8000, 9000,
    'https://jdvpesumvkspoxrdqbqw.supabase.co/storage/v1/object/public/pool-photos/POOL_SEOUL_0008.jpg')
on conflict (id) do nothing;

-- 자유수영 시간표 (cbswim 기준, 공식 미검증)
--   평일(월~금) 13:30~15:30 / 토·일 09:00~17:00
--   일요일은 매월 2·4주 휴장 → 1·3·5주만 운영(day_note, 표준 톤).
--   hours = 시간(2h, 8h).
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_SEOUL_0008', '풀스데이', $${
    "월": [{"start":"13:30","end":"15:30","hours":2}],
    "화": [{"start":"13:30","end":"15:30","hours":2}],
    "수": [{"start":"13:30","end":"15:30","hours":2}],
    "목": [{"start":"13:30","end":"15:30","hours":2}],
    "금": [{"start":"13:30","end":"15:30","hours":2}],
    "토": [{"start":"09:00","end":"17:00","hours":8}],
    "일": [{"start":"09:00","end":"17:00","hours":8}]
  }$$::jsonb, $${"일":"매월 1, 3, 5주차 일요일에만 운영합니다."}$$::jsonb, '2026-05-16'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_SEOUL_0008'
  and exists (select 1 from public.schedules where pool_id = 'POOL_SEOUL_0008');
