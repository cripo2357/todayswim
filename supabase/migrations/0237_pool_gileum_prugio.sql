-- Pool's day — 성북구 배치: 길음푸르지오스포츠센터 추가 (POOL_0118). 사설(아파트 부속).
--
-- ## 시간표 출처 [크리스 제공 — 공식 자유수영 시간표 캡처]
--
-- 크리스가 길음푸르지오스포츠센터 자유수영 시간표 캡처 제공(수위미 경유). 사설 시설이라
-- 공식 홈페이지 없음 → schedule_source_url null. 첨벙 미사용.
--
-- - 자유수영(이용시간 블록):
--   · 평일(월~금): 06:00–08:50, 13:00–15:50
--   · 토         : 08:00–09:50, 13:00–18:00
--   · 일(1·3주만): 09:00–17:50 → weeks:[1,3]
--   · 휴무: 매월 2·4·5주 일요일, 법정공휴일.
--   ※ 본문에 수요일 20~22시 언급 있었으나 공식 시간표 표에 없어 보류.
-- - 가격: 일일권(1회권) 성인 10,000 / 어린이 8,000 (평일·토·일 동일). 월 95,000(입주민 20% 할인).
--   일요일·회원 50% 할인은 별도.
--
-- ## 메타데이터 출처
-- - 좌표 [신뢰도 높음]: 카카오 POI "길음푸르지오 스포츠센터"(길음동 1280, 201동 지하1층).
-- - 전화: 02-941-7600. 길음로 119. 사설(아파트 부속) → ownership=private.
-- - 레인/길이/수심·유아풀 정보 없음 → null / has_kids_pool=false.
--
-- 사진: pool-photos/POOL_0118.jpg 미확보 → photo_url null.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_weekday, price_weekend, price_monthly, photo_url,
  schedule_source_url
) values
  ('POOL_0118', '길음푸르지오스포츠센터', '서울', '성북구',
    '서울특별시 성북구 길음로 119',
    37.612793791321835, 127.01515421566663, 'indoor', 'private',
    '02-941-7600', null,
    null, null, null, null,
    '{}', false, false, false,
    true, true,
    10000, 10000, 95000, null,
    null)
on conflict (id) do nothing;

-- 자유수영 시간표. 06:00~08:50=2.83, 13:00~15:50=2.83, 토 13:00~18:00=5.0,
-- 일 09:00~17:50=8.83(1·3주만). 일요일 weeks:[1,3].
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0118', '풀스데이', $${
    "월": [{"start":"06:00","end":"08:50","hours":2.83},{"start":"13:00","end":"15:50","hours":2.83}],
    "화": [{"start":"06:00","end":"08:50","hours":2.83},{"start":"13:00","end":"15:50","hours":2.83}],
    "수": [{"start":"06:00","end":"08:50","hours":2.83},{"start":"13:00","end":"15:50","hours":2.83}],
    "목": [{"start":"06:00","end":"08:50","hours":2.83},{"start":"13:00","end":"15:50","hours":2.83}],
    "금": [{"start":"06:00","end":"08:50","hours":2.83},{"start":"13:00","end":"15:50","hours":2.83}],
    "토": [{"start":"08:00","end":"09:50","hours":1.83},{"start":"13:00","end":"18:00","hours":5}],
    "일": [{"start":"09:00","end":"17:50","hours":8.83,"weeks":[1,3]}]
  }$$::jsonb, $${
    "일":"매월 첫째·셋째 주 일요일에만 운영합니다."
  }$$::jsonb, '2026-06-07'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_0118'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0118');
