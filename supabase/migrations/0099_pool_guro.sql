-- Pool's day — Phase 2: 수영장 1곳 추가: 구로구민체육센터 (POOL_0022).
--
-- ## 시간표 출처
--
-- 공식 사이트 gurosisul.or.kr (구로시설관리공단) — pool_schedule_source_priority 1차 출처.
-- - c=1 시설소개 / c=2 프로그램. WebFetch가 SSL 체인 오류 → curl -k.
-- 운영자가 안내한 블로그(gyp03417n)는 정책상 일체 미사용.
--
-- - 자유수영 (공식 c=2 그대로): "토요일 일일입장 (연중운영)"
--   · 09:00~10:30 (1h30m)
--   · 11:00~12:30
--   · 14:00~15:30
--   · 16:00~17:30
-- - 평일/일요일: 자유수영 일일입장 없음 (강습/등록형만).
--   - 평일 18시 특수수영(자유수영형)은 월회비 등록제라 일일입장과 다름 → 제외.
-- - 요금: 성인 4,500원 / 청소년 3,500원 / 어린이 2,500원 (토요일만 운영).
-- - 정원 70명.
--
-- ## 데이터 모델링
--
-- - by_day = 토 4슬롯만. 다른 요일 키 미포함.
-- - 시즌 분기 없음 → slot_groups 미사용.
-- - day_notes는 슬롯 1개+ 요일일 때만 사용(day_note_constraint) → 미사용.
--
-- ## 메타데이터 출처
--
-- - 시설(성인풀 7레인, 어린이풀 2레인, 지하2층 819.98㎡): 공식 c=1.
-- - 풀 길이/수심: 공식 미명시 → null.
-- - 좌표 [신뢰도 높음]: 카카오 POI "구로구민체육센터 수영장" 정확 매치
--   (구로구 고척동 산 9-14, 도로명 고척로45길 1).
-- - 전화: 02-839-4875 (시설관리공단 대표, 센터 전용 번호 없음).

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0022', '구로구민체육센터', '서울', '구로구',
    '서울특별시 구로구 고척로45길 1',
    37.5066184847981, 126.853300806677, 'indoor', 'public',
    '02-839-4875', 'https://www.gurosisul.or.kr/mod.asp?m=business&s=b01-3&t=1&c=1',
    7, null, null, null,
    '{}', true, false, false,
    true, true,
    4500, null, 4500,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0022.jpg',
    'https://www.gurosisul.or.kr/mod.asp?m=business&s=b01-3&t=1&c=2')
on conflict (id) do nothing;

-- 자유수영 시간표 (토요일만, 공식 c=2 그대로).
-- hours = 1h30m = 1.5.
insert into public.schedules (pool_id, author_nickname, by_day, updated_at) values
  ('POOL_0022', '풀스데이', $${
    "토": [
      {"start":"09:00","end":"10:30","hours":1.5},
      {"start":"11:00","end":"12:30","hours":1.5},
      {"start":"14:00","end":"15:30","hours":1.5},
      {"start":"16:00","end":"17:30","hours":1.5}
    ]
  }$$::jsonb, '2026-05-26'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_0022'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0022');
