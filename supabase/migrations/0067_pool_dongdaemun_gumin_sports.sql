-- Pool's day — Phase 2: 수영장 1곳 추가: 동대문구민체육센터 (POOL_SEOUL_0018).
--
-- ## 시간표 출처
--
-- 공식 사이트(동대문구시설관리공단 https://www.dfmc.kr:8443/course/sports/fmcs/283)는
-- SSL 인증서 검증 실패로 fetch 불가. KBS스포츠월드(0034)와 동일 패턴.
-- → 2차 출처 합의 채택:
--   - 첨벙 cbswim
--   - 서울시 자유수영 정보 서비스 (sports.seoul.go.kr/main/facilities/facilities_view.do?ft_idx=1094)
--   양 출처 시간표/가격 완전 일치 → 데이터 신뢰.
-- 향후 1차 사진 확보 시 정정 가능. schedule_source_url은 공식 dfmc.kr 그대로 기록(다음
-- 배치에서 fetch_error 반복되면 sports.seoul.go.kr로 교체).
--
-- - 시간표:
--   · 평일(월~금): 13:00–13:50, 21:00–21:50 (2슬롯)
--   · 토       : 09:00–09:50, 10:00–10:50, 11:00–11:50, 13:00–13:50, 14:00–14:50,
--                16:00–16:50, 17:00–17:50 (7슬롯)
--   · 일       : 10:00–10:50, 11:00–11:50, 13:00–13:50, 14:00–14:50, 16:00–16:50,
--                17:00–17:50 (6슬롯, 첫째·셋째 주만 운영)
-- - 가격: 평일 3,700원 / 주말 4,800원 (성인).
-- - 휴관: 일요일 2·4·5주 + 법정공휴일 → 일 day_note에 "1·3주만 운영" 안내.
--
-- ## 메타데이터 출처
--
-- - 성인풀 25m × 6레인, 수심 1.2m: 첨벙.
-- - 어린이풀 3레인: sports.seoul.go.kr → has_kids_pool=true.
-- - 좌표 [신뢰도 높음]: 카카오 POI "동대문구민체육센터 수영장" 정확 매치
--   (장안동 356, 도로명 장안벚꽃로 67).
-- - 전화: 02-2247-9772.
--
-- 사진: pool-photos/POOL_SEOUL_0018.jpg 업로드 대기.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_SEOUL_0018', '동대문구민체육센터', '서울', '동대문구',
    '서울특별시 동대문구 장안벚꽃로 67',
    37.566538362878, 127.073496614169, 'indoor', 'public',
    '02-2247-9772', 'https://www.dfmc.kr:8443/course/sports/fmcs/283',
    6, 25, 1.2, 1.2,
    '{}', true, false, false,
    true, true,
    3700, 3700, 4800,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_SEOUL_0018.jpg',
    'https://www.dfmc.kr:8443/course/sports/fmcs/283')
on conflict (id) do nothing;

-- 자유수영 시간표.
-- hours = (종료 - 시작) 분/60. 50분=0.83.
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_SEOUL_0018', '풀스데이', $${
    "월": [
      {"start":"13:00","end":"13:50","hours":0.83},
      {"start":"21:00","end":"21:50","hours":0.83}
    ],
    "화": [
      {"start":"13:00","end":"13:50","hours":0.83},
      {"start":"21:00","end":"21:50","hours":0.83}
    ],
    "수": [
      {"start":"13:00","end":"13:50","hours":0.83},
      {"start":"21:00","end":"21:50","hours":0.83}
    ],
    "목": [
      {"start":"13:00","end":"13:50","hours":0.83},
      {"start":"21:00","end":"21:50","hours":0.83}
    ],
    "금": [
      {"start":"13:00","end":"13:50","hours":0.83},
      {"start":"21:00","end":"21:50","hours":0.83}
    ],
    "토": [
      {"start":"09:00","end":"09:50","hours":0.83},
      {"start":"10:00","end":"10:50","hours":0.83},
      {"start":"11:00","end":"11:50","hours":0.83},
      {"start":"13:00","end":"13:50","hours":0.83},
      {"start":"14:00","end":"14:50","hours":0.83},
      {"start":"16:00","end":"16:50","hours":0.83},
      {"start":"17:00","end":"17:50","hours":0.83}
    ],
    "일": [
      {"start":"10:00","end":"10:50","hours":0.83},
      {"start":"11:00","end":"11:50","hours":0.83},
      {"start":"13:00","end":"13:50","hours":0.83},
      {"start":"14:00","end":"14:50","hours":0.83},
      {"start":"16:00","end":"16:50","hours":0.83},
      {"start":"17:00","end":"17:50","hours":0.83}
    ]
  }$$::jsonb, $${"일":"매월 첫째·셋째 주 일요일에만 운영합니다."}$$::jsonb, '2026-05-20'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_SEOUL_0018'
  and exists (select 1 from public.schedules where pool_id = 'POOL_SEOUL_0018');
