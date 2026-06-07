-- Pool's day — 중구 배치: 성동교육문화관 수영장 추가 (POOL_0130). 공공(교육문화관, korspo 위탁).
--
-- ## 시간표 출처 [1차 — 운영자 공식 안내문]
-- 크리스가 성동교육문화관 자유수영 공식 안내 캡처 제공(시간표+요금). "한양대생" 표기로 성동고(한양대 인근) 확인.
--
-- - 자유수영:
--   · 평일: 06:00–06:50, 08:00–08:50, 13:00–15:50, 18:00–22:40
--   · 토   : 06:30–18:00 (종일)
--   · 공휴일: 09:00–12:00, 13:00–17:00 (by_day 미표기 — 주간 모델 한계)
--   · 일요일: 휴무.
-- - 가격(일일): 성인(중·고생 포함) 비회원 10,000 / 회원·한양대생 8,000 → 비회원 10,000 채택.
--   (초등·영유아 비회원 8,000 / 회원 7,000)
--
-- ## 메타데이터 출처
-- - 좌표 [신뢰도 높음]: 카카오 주소검색 "중구 퇴계로90길 17".
-- - 레인/길이/수심 5/25/1.25 [2차 — 권세민 블로그, 스펙은 2차 허용]. 유아풀 정보 없음 → false.
-- - 운영사 korspo(0116 돈암과 동일 계열) → ownership=public. 전화 미확보 → null.
-- 사진: 미확보 → photo_url null.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0130', '성동교육문화관', '서울', '중구',
    '서울특별시 중구 퇴계로90길 17',
    37.5641621970073, 127.022389203196, 'indoor', 'public',
    null, 'http://www.korspo.co.kr/seongdong.php',
    5, 25, 1.25, 1.25,
    '{}', false, false, false,
    true, true,
    10000, 10000, null,
    'http://www.korspo.co.kr/seongdong.php')
on conflict (id) do nothing;

-- 자유수영. 06:00-06:50=0.83, 08:00-08:50=0.83, 13:00-15:50=2.83, 18:00-22:40=4.67, 토 06:30-18:00=11.5.
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0130', '풀스데이', $${
    "월": [{"start":"06:00","end":"06:50","hours":0.83},{"start":"08:00","end":"08:50","hours":0.83},{"start":"13:00","end":"15:50","hours":2.83},{"start":"18:00","end":"22:40","hours":4.67}],
    "화": [{"start":"06:00","end":"06:50","hours":0.83},{"start":"08:00","end":"08:50","hours":0.83},{"start":"13:00","end":"15:50","hours":2.83},{"start":"18:00","end":"22:40","hours":4.67}],
    "수": [{"start":"06:00","end":"06:50","hours":0.83},{"start":"08:00","end":"08:50","hours":0.83},{"start":"13:00","end":"15:50","hours":2.83},{"start":"18:00","end":"22:40","hours":4.67}],
    "목": [{"start":"06:00","end":"06:50","hours":0.83},{"start":"08:00","end":"08:50","hours":0.83},{"start":"13:00","end":"15:50","hours":2.83},{"start":"18:00","end":"22:40","hours":4.67}],
    "금": [{"start":"06:00","end":"06:50","hours":0.83},{"start":"08:00","end":"08:50","hours":0.83},{"start":"13:00","end":"15:50","hours":2.83},{"start":"18:00","end":"22:40","hours":4.67}],
    "토": [{"start":"06:30","end":"18:00","hours":11.5}]
  }$$::jsonb, '{}'::jsonb, '2026-06-08'::timestamptz)
on conflict (pool_id) do nothing;

update public.pools set has_schedule = true
where id = 'POOL_0130' and exists (select 1 from public.schedules where pool_id = 'POOL_0130');
