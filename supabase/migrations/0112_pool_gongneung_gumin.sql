-- Pool's day — Phase 2: 수영장 1곳 추가: 공릉구민체육센터 (POOL_0030).
--
-- ## 시간표 출처
--
-- 공식 nowonsc.kr (노원구시설관리공단) — pool_schedule_source_priority 1차.
-- - /fmcs/499 이용안내 (일일 자유수영 표·요금)
-- - /fmcs/498 시설안내 (주소)
-- 운영자 안내 인스타그램은 시간표 출처로 미사용(정책).
--
-- - 일일 자유수영 (공식 표 그대로):
--   · 평일(월~금) 13:00~13:50, 18:00~18:50, 19:00~19:50
--   · 토 09:00~10:50(1h50m), 12:00~13:50(1h50m), 15:00~17:30(2h30m)
--   · 일요일·공휴일 휴관
-- - 요금(성인): 평일 4,800 / 토 6,240
--   (청소년 3,300/4,290, 초등 2,400/3,120 — 스키마는 성인 기준만 보관)
--
-- ## 데이터 모델링
--
-- - by_day = 월~금 3슬롯(50분) + 토 3슬롯. 일요일 키 미포함.
-- - 시즌 분기 없음 → slot_groups 미사용. day_notes 미사용.
--
-- ## 메타데이터 출처
--
-- - 주소: (01818) 서울특별시 노원구 공릉로34길 81. 공식 /fmcs/498.
-- - 전화: 02-2289-6750 (대표). 문의 02-2289-6751~2.
-- - 시설: 25m × 4레인, 수심 1.2m.
--   ⚠️ 신축(2025)이라 공식·서울시 포털 모두 규격 미등록 → 2차 매체(안마을신문
--   등 개관 보도, 신뢰도 낮음)에서 레인/길이/수심 참고. 운영자 확인.
--   depth_min/max = 1.2 단일값. 유아풀 정보 미확인 → has_kids_pool=false(보수적).
-- - 좌표 [신뢰도 높음]: 카카오 POI "공릉구민체육센터"(공릉동 758-5)와
--   도로명 주소(공릉로34길 81)가 ~5m 이내 일치.
-- - 사진: 운영자 제공 외관 사진 400px 리사이즈 → POOL_0030.jpg.
--   기존 컨벤션대로 dev host URL. Supabase pool-photos 버킷(dev) 업로드는 운영자.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0030', '공릉구민체육센터', '서울', '노원구',
    '서울특별시 노원구 공릉로34길 81',
    37.62491461831873, 127.08152999618588, 'indoor', 'public',
    '02-2289-6750', 'https://www.nowonsc.kr/fmcs/498',
    4, 25, 1.2, 1.2,
    '{}', false, false, false,
    true, true,
    4800, 4800, 6240,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0030.jpg',
    'https://www.nowonsc.kr/fmcs/499')
on conflict (id) do nothing;

-- 자유수영 시간표 (공식 이용안내 표 그대로).
-- hours: 50분=0.83, 1h50m=1.83, 2h30m=2.5.
insert into public.schedules (pool_id, author_nickname, by_day, updated_at) values
  ('POOL_0030', '풀스데이', $${
    "월": [
      {"start":"13:00","end":"13:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83},
      {"start":"19:00","end":"19:50","hours":0.83}
    ],
    "화": [
      {"start":"13:00","end":"13:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83},
      {"start":"19:00","end":"19:50","hours":0.83}
    ],
    "수": [
      {"start":"13:00","end":"13:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83},
      {"start":"19:00","end":"19:50","hours":0.83}
    ],
    "목": [
      {"start":"13:00","end":"13:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83},
      {"start":"19:00","end":"19:50","hours":0.83}
    ],
    "금": [
      {"start":"13:00","end":"13:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83},
      {"start":"19:00","end":"19:50","hours":0.83}
    ],
    "토": [
      {"start":"09:00","end":"10:50","hours":1.83},
      {"start":"12:00","end":"13:50","hours":1.83},
      {"start":"15:00","end":"17:30","hours":2.5}
    ]
  }$$::jsonb, '2026-06-03'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_0030'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0030');
