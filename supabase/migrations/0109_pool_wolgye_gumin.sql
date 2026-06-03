-- Pool's day — Phase 2: 수영장 1곳 추가: 월계구민체육센터 (POOL_0028).
--
-- ## 시간표 출처
--
-- 공식 nowonsc.kr (노원구시설관리공단) — pool_schedule_source_priority 1차.
-- - /fmcs/83 이용안내 (일일 자유수영 표·요금)
-- - /fmcs/82 시설안내, /fmcs/88 오시는길 (주소)
-- 운영자 안내 블로그(aqudadawoo_)는 정책상 미사용.
--
-- - 일일 자유수영 (공식 표 그대로):
--   · 평일 1부 12:00~12:50 (월~금)
--   · 평일 2부 15:00~15:50 (월~금; 월·수·금 정원 80, 화·목 정원 40 — 시간 동일)
--   · 토 1부 09:00~10:50, 2부 12:00~13:50, 3부 15:00~16:50 (각 1h50m)
--   · 일요일·공휴일 휴관
-- - 요금(성인): 평일 4,300 / 토 5,500
--   (청소년 2,900/3,800, 초등 2,100/2,700 — 스키마는 성인 기준만 보관)
-- - 정원(80/40)은 슬롯 모델 표현 불가 → 비고 생략, 시간만 반영.
--
-- ## 데이터 모델링
--
-- - by_day = 월~금 2슬롯(12/15 각 50분) + 토 3슬롯(각 1h50m). 일요일 키 미포함.
-- - 시즌 분기 없음 → slot_groups 미사용.
-- - day_notes는 슬롯 1개+ 요일일 때만 → 미사용.
--
-- ## 메타데이터 출처
--
-- - 주소: (01884) 서울특별시 노원구 월계로 298. 공식 /fmcs/82·/fmcs/88.
-- - 전화: 02-2289-6874 (수영장 직통). 안내데스크 02-2289-6888~6889.
-- - 시설: 25m × 5레인, 수심 1.2m, 어린이풀 2개.
--   nowonsc 시설안내엔 규격 미기재 → 서울시 공식 체육시설 포털
--   (sports.seoul.go.kr ft_idx=1412) 보조 출처. depth_min/max = 1.2 단일값.
-- - 좌표 [신뢰도 높음]: 카카오 POI "월계구민체육센터"(월계동 547-61)와
--   도로명 주소(월계로 298)가 ~3m 이내 일치.
-- - 사진: 운영자 제공 외관 사진 400×300 리사이즈 → POOL_0028.jpg.
--   기존 컨벤션대로 dev host URL 박음(prod 정규화는 별도 hotfix 흐름,
--   pool_photo_url_dev_baked). Supabase pool-photos 버킷 업로드는 운영자.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0028', '월계구민체육센터', '서울', '노원구',
    '서울특별시 노원구 월계로 298',
    37.62665728039086, 127.0547374929045, 'indoor', 'public',
    '02-2289-6874', 'https://www.nowonsc.kr/fmcs/82',
    5, 25, 1.2, 1.2,
    '{}', true, false, false,
    true, true,
    4300, 4300, 5500,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0028.jpg',
    'https://www.nowonsc.kr/fmcs/83')
on conflict (id) do nothing;

-- 자유수영 시간표 (공식 이용안내 자유수영 표 그대로).
-- hours: 50분=0.83, 1h50m=1.83.
insert into public.schedules (pool_id, author_nickname, by_day, updated_at) values
  ('POOL_0028', '풀스데이', $${
    "월": [
      {"start":"12:00","end":"12:50","hours":0.83},
      {"start":"15:00","end":"15:50","hours":0.83}
    ],
    "화": [
      {"start":"12:00","end":"12:50","hours":0.83},
      {"start":"15:00","end":"15:50","hours":0.83}
    ],
    "수": [
      {"start":"12:00","end":"12:50","hours":0.83},
      {"start":"15:00","end":"15:50","hours":0.83}
    ],
    "목": [
      {"start":"12:00","end":"12:50","hours":0.83},
      {"start":"15:00","end":"15:50","hours":0.83}
    ],
    "금": [
      {"start":"12:00","end":"12:50","hours":0.83},
      {"start":"15:00","end":"15:50","hours":0.83}
    ],
    "토": [
      {"start":"09:00","end":"10:50","hours":1.83},
      {"start":"12:00","end":"13:50","hours":1.83},
      {"start":"15:00","end":"16:50","hours":1.83}
    ]
  }$$::jsonb, '2026-06-03'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_0028'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0028');
