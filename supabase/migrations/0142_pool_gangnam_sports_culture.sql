-- Pool's day — Phase 2: 수영장 1곳 추가: 강남스포츠문화센터 (POOL_0046). 강남구 수서동(공공). 강남구 첫 풀.
--
-- ## 시간표·가격 출처
--
-- 공식 강남구 통합예약(life.gangnam.go.kr/fmcs/341) 자유수영 표 + 운영자 캡처 — 1차.
-- (강남구도시관리공단 운영, 강남 최대규모.)
--
-- - 자유수영 시간표 (공식 표 그대로, 각 50분):
--   · 평일(월~금): 12:30~13:20, 15:30~16:20, 16:30~17:20 (한시 운영·추후 변동, 선착순)
--   · 토: 06:30~07:20, 07:30~08:20, 09:30~10:20, 10:30~11:20, 11:30~12:20,
--         12:30~13:20, 13:30~14:20, 14:30~15:20, 15:30~16:20, 16:30~17:20 (10슬롯)
--   · 일: 09:30~10:20, 10:30~11:20, 11:30~12:20, 13:30~14:20, 14:30~15:20
--         (둘째·넷째 주만, 정비 12:30~13:20 발권 안됨)
-- - 가격: 일일입장 5,000원(운영자 확인). 공식 페이지엔 금액 미기재였음.
--
-- ## 메타데이터
--
-- - 좌표 [신뢰도 높음]: 카카오 POI "강남스포츠문화센터"(수서동 718) 정확 매치.
-- - 시설: 25m × 5레인. 전화: 02-2176-0803. ownership=public. photo_url=NULL.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0046', '강남스포츠문화센터', '서울', '강남구',
    '서울특별시 강남구 광평로31길 20',
    37.4891939721457, 127.105262207682, 'indoor', 'public',
    '02-2176-0803', 'https://life.gangnam.go.kr/fmcs/341',
    5, 25, null, null,
    '{}', false, false, false,
    true, true,
    5000, 5000, 5000, null,
    'https://life.gangnam.go.kr/fmcs/341')
on conflict (id) do nothing;

-- 자유수영 시간표 (공식 표). 각 50분=0.83.
-- day_notes: 평일 한시운영·일요일 격주 운영 안내.
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0046', '풀스데이', $${
    "월": [
      {"start":"12:30","end":"13:20","hours":0.83},
      {"start":"15:30","end":"16:20","hours":0.83},
      {"start":"16:30","end":"17:20","hours":0.83}
    ],
    "화": [
      {"start":"12:30","end":"13:20","hours":0.83},
      {"start":"15:30","end":"16:20","hours":0.83},
      {"start":"16:30","end":"17:20","hours":0.83}
    ],
    "수": [
      {"start":"12:30","end":"13:20","hours":0.83},
      {"start":"15:30","end":"16:20","hours":0.83},
      {"start":"16:30","end":"17:20","hours":0.83}
    ],
    "목": [
      {"start":"12:30","end":"13:20","hours":0.83},
      {"start":"15:30","end":"16:20","hours":0.83},
      {"start":"16:30","end":"17:20","hours":0.83}
    ],
    "금": [
      {"start":"12:30","end":"13:20","hours":0.83},
      {"start":"15:30","end":"16:20","hours":0.83},
      {"start":"16:30","end":"17:20","hours":0.83}
    ],
    "토": [
      {"start":"06:30","end":"07:20","hours":0.83},
      {"start":"07:30","end":"08:20","hours":0.83},
      {"start":"09:30","end":"10:20","hours":0.83},
      {"start":"10:30","end":"11:20","hours":0.83},
      {"start":"11:30","end":"12:20","hours":0.83},
      {"start":"12:30","end":"13:20","hours":0.83},
      {"start":"13:30","end":"14:20","hours":0.83},
      {"start":"14:30","end":"15:20","hours":0.83},
      {"start":"15:30","end":"16:20","hours":0.83},
      {"start":"16:30","end":"17:20","hours":0.83}
    ],
    "일": [
      {"start":"09:30","end":"10:20","hours":0.83},
      {"start":"10:30","end":"11:20","hours":0.83},
      {"start":"11:30","end":"12:20","hours":0.83},
      {"start":"13:30","end":"14:20","hours":0.83},
      {"start":"14:30","end":"15:20","hours":0.83}
    ]
  }$$::jsonb, $${
    "월": "한시 운영으로 시간이 변동될 수 있습니다(선착순 마감).",
    "화": "한시 운영으로 시간이 변동될 수 있습니다(선착순 마감).",
    "수": "한시 운영으로 시간이 변동될 수 있습니다(선착순 마감).",
    "목": "한시 운영으로 시간이 변동될 수 있습니다(선착순 마감).",
    "금": "한시 운영으로 시간이 변동될 수 있습니다(선착순 마감).",
    "일": "둘째·넷째 주만 운영합니다."
  }$$::jsonb, '2026-06-04'::timestamptz)
on conflict (pool_id) do nothing;

update public.pools
set has_schedule = true
where id = 'POOL_0046'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0046');
