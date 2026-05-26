-- Pool's day — Phase 2: 수영장 1곳 추가: 50플러스수영장 (POOL_0024).
-- 서울시50플러스 남부캠퍼스 내 수영장(구로시설관리공단 위탁 운영).
--
-- ## 시간표 출처
--
-- 공식 사이트 gurosisul.or.kr (구로시설관리공단) — pool_schedule_source_priority 1차 출처.
-- - s=b07-4&c=1 프로그램. SSL 체인 오류 → curl -k.
-- 운영자가 안내한 블로그(tjdud5991)는 정책상 일체 미사용.
--
-- - 수영장 자유수영 (공식 c=1 그대로, 연중운영):
--   · 평일 자유수영 월~금 08:00~08:50 (정원 36명)
--   · 토요일 자유수영 (수준별 운영, 정원 36명):
--     - 1부 10:00~11:30 (중·상급)
--     - 2부 12:00~13:30 (초급·어린이)
--     - 3부 14:00~15:30 (초급·어린이)
--     - 4부 16:00~17:30 (중·상급)
-- - 일요일: 자유수영 없음.
-- - 요금: 평일 성인 4,000원 / 토 성인 4,500원·청소년 3,500원·어린이 2,500원.
--
-- ## 데이터 모델링
--
-- - by_day = 월~금(08:00) + 토 4슬롯. 일요일 키 미포함.
-- - 시즌 분기 없음 → slot_groups 미사용.
-- - 토 수준별 운영(1·4부 중상급 / 2·3부 초급·어린이), 어린이 보호자 동반 필수,
--   수영 외 활동 금지 등 비고는 슬롯별 표현 불가 → schedule_source_url 우회.
-- - day_notes는 슬롯 1개+ 요일일 때만 사용 → 미사용.
--
-- ## 메타데이터 출처
--
-- - 풀 제원(레인 수/길이/수심·유아풀 유무): 공식 페이지 미명시 → null.
-- - 좌표 [신뢰도 중]: 카카오 POI "서울시50플러스 남부캠퍼스" — 캠퍼스 단위 매치.
--   풀 단독 POI 부재. 캠퍼스 내 위치라 캠퍼스 좌표로 충분.
--   (구로구 천왕동 280-14, 도로명 오류로 36-25).
-- - 전화: 02-839-4875 (구로시설관리공단 대표, 풀 전용 번호 없음).

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0024', '50플러스수영장', '서울', '구로구',
    '서울특별시 구로구 오류로 36-25',
    37.48856097997178, 126.84178127102444, 'indoor', 'public',
    '02-839-4875', 'https://www.gurosisul.or.kr/mod.asp?m=business&s=b07-4&t=1&c=1',
    null, null, null, null,
    '{}', false, false, false,
    true, true,
    4000, 4000, 4500,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0024.jpg',
    'https://www.gurosisul.or.kr/mod.asp?m=business&s=b07-4&t=1&c=1')
on conflict (id) do nothing;

-- 자유수영 시간표 (공식 c=1 그대로, 연중운영).
-- hours: 50분=0.83, 1h30m=1.5.
insert into public.schedules (pool_id, author_nickname, by_day, updated_at) values
  ('POOL_0024', '풀스데이', $${
    "월": [{"start":"08:00","end":"08:50","hours":0.83}],
    "화": [{"start":"08:00","end":"08:50","hours":0.83}],
    "수": [{"start":"08:00","end":"08:50","hours":0.83}],
    "목": [{"start":"08:00","end":"08:50","hours":0.83}],
    "금": [{"start":"08:00","end":"08:50","hours":0.83}],
    "토": [
      {"start":"10:00","end":"11:30","hours":1.5},
      {"start":"12:00","end":"13:30","hours":1.5},
      {"start":"14:00","end":"15:30","hours":1.5},
      {"start":"16:00","end":"17:30","hours":1.5}
    ]
  }$$::jsonb, '2026-05-26'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_0024'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0024');
