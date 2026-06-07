-- Pool's day — 동대문구 배치: 숭인스포츠센터 수영장 추가 (POOL_0138). 사설(숭인중 내).
--
-- ## 시간표 출처 [1차 — 운영자 공식 안내판 캡처]
-- 크리스가 숭인수영장 공식 '프로그램 및 이용요금' 안내판 캡처 제공. (블로그 요약보다 안내판이 정확 → 안내판 채택)
-- 운영자 공식 온라인 URL 없음 → schedule_source_url null(현장 안내판 기준).
--
-- - 일일입장 자유수영 이용가능 시간:
--   · 평일(월~토) 기본: 08:00–08:50, 12:00–12:50
--   · 수 추가: 19:00–21:50
--   · 토 추가: 12:00–13:50, 16:00–17:50
--   · 일요일: 미표기(휴무).
--   · 유아는 보호자 동반시 입장가능 / 36개월 미만 입장제한.
-- - 가격(일일입장): 성인 10,000(회원 5,000) / 소인 8,000(회원 4,000). 월 자유수영 96,000.
--
-- ## 메타데이터 출처
-- - 좌표 [신뢰도 높음]: 카카오 POI "숭인스포츠센터"(답십리동 463-1, 숭인중 내).
-- - 레인/길이/수심 5/25/1.2~1.4 [2차 — 권세민 블로그]. 유아풀 정보 없음 → false.
-- - 전화 02-2217-3300. 사설 → ownership=private. 용두역 인근(블로그 제목의 '서대문구'는 오기, 실제 동대문구).
-- 사진: 미확보 → photo_url null.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_weekday, price_weekend, price_monthly, photo_url,
  schedule_source_url
) values
  ('POOL_0138', '숭인스포츠센터', '서울', '동대문구',
    '서울특별시 동대문구 천호대로47길 34',
    37.5735458289037, 127.04355964423, 'indoor', 'private',
    '02-2217-3300', null,
    5, 25, 1.2, 1.4,
    '{}', false, false, false,
    true, true,
    10000, 10000, 96000, null,
    null)
on conflict (id) do nothing;

-- 일일입장 자유수영. 08:00-08:50=0.83, 12:00-12:50=0.83, 수 19:00-21:50=2.83,
-- 토 12:00-13:50=1.83(정오블록 확장)/16:00-17:50=1.83. 일 휴무.
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0138', '풀스데이', $${
    "월": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"12:50","hours":0.83}],
    "화": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"12:50","hours":0.83}],
    "수": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"12:50","hours":0.83},{"start":"19:00","end":"21:50","hours":2.83}],
    "목": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"12:50","hours":0.83}],
    "금": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"12:50","hours":0.83}],
    "토": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"12:00","end":"13:50","hours":1.83},{"start":"16:00","end":"17:50","hours":1.83}]
  }$$::jsonb, $${
    "토":"유아는 보호자 동반 시 입장 가능하며, 36개월 미만은 입장이 제한됩니다."
  }$$::jsonb, '2026-06-08'::timestamptz)
on conflict (pool_id) do nothing;

update public.pools set has_schedule = true
where id = 'POOL_0138' and exists (select 1 from public.schedules where pool_id = 'POOL_0138');
