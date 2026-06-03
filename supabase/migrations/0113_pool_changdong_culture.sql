-- Pool's day — Phase 2: 수영장 1곳 추가: 창동문화체육센터 (POOL_0031).
--
-- ## 시간표 출처
--
-- 운영자 제공 공식 "자유수영 안내" 게시물(이미지) — pool_schedule_source_priority 1차.
-- 도봉구시설관리공단 yeyak 사이트는 강습 페이지만 노출(자유수영 표 없음) →
-- 운영자가 직접 제공한 공식 자유수영 안내판을 1차 출처로 사용.
-- 블로그(waterpole2/bak_dobby)는 시간표 출처로 미사용(정책).
--
-- - 일일 자유수영 (공식 안내판 그대로):
--   · 월·수 13:00~13:50
--   · 화·목 13:00~13:50, 19:00~19:50
--   · 금 13:00~13:50, 15:00~15:50, 16:00~16:50
--   · 토 06:00~17:50 매시간 50분 회차(12회), 18:00대 제외
--   · 일 09:00~10:50, 12:00~13:50, 15:00~16:50 (2시간 단위)
-- - 요금: 평일·토 1시간권 성인 4,000 / 일요일 2시간권 성인 5,200
--   (청소년 2,800/3,600, 어린이 2,500/3,300)
--   price_weekday=4,000(평일·토 동일), price_weekend=5,200(일요일) 매핑.
--
-- ## 데이터 모델링
--
-- - by_day = 요일별 회차. 토 12슬롯, 일 3슬롯(2시간). 모든 요일 키 포함(일 운영).
-- - ⚠️ 격주 휴관(1·3·5주 일요일+공휴일+대체공휴일)은 슬롯 모델(요일 기반)로
--   주차 구분 표현 불가 → schedule_source_url 비고로 우회. 일요일 슬롯은 유지.
-- - 정원(90명, 화목 19시 60명), 일요일 점심(13~14시) 접수불가도 슬롯 표현 불가 → 생략.
-- - slot_groups 미사용. day_notes 미사용.
--
-- ## 메타데이터 출처
--
-- - 주소: 서울특별시 도봉구 노해로69길 132 (지하2층). 서울시 체육포털 ft_idx=1081.
-- - 전화: 02-901-5046~7 (수영장/문의). 대표 02-901-5000.
-- - 시설: 경영풀 6레인 수심 1.2m + 유아풀 수심 0.8m. 서울시 포털.
--   pool_length=25 는 경영풀 표준 추정(공식·포털 길이 미기재, 2차 활용 허락).
--   depth_min/max = 경영풀 기준 1.2.
-- - 좌표 [신뢰도 높음]: 카카오 POI "창동문화체육센터"(창동 1-6)와
--   도로명 주소(노해로69길 132)가 ~13m 이내 일치.
-- - 사진: 운영자 제공 외관 사진 400px 리사이즈 → POOL_0031.jpg.
--   기존 컨벤션대로 dev host URL. Supabase pool-photos 버킷(dev) 업로드는 운영자.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0031', '창동문화체육센터', '서울', '도봉구',
    '서울특별시 도봉구 노해로69길 132',
    37.6580440189558, 127.05058549094, 'indoor', 'public',
    '02-901-5046', 'https://yeyak.dobongsiseol.or.kr/lecture/swimming.php?c_id=01&page_info=swimming&n_type=lecture',
    6, 25, 1.2, 1.2,
    '{}', true, false, false,
    true, true,
    4000, 4000, 5200,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0031.jpg',
    'https://yeyak.dobongsiseol.or.kr/lecture/swimming.php?c_id=01&page_info=swimming&n_type=lecture')
on conflict (id) do nothing;

-- 자유수영 시간표 (공식 자유수영 안내판 그대로).
-- hours: 50분=0.83, 2h(일요일)=1.83(1h50m 회차).
insert into public.schedules (pool_id, author_nickname, by_day, updated_at) values
  ('POOL_0031', '풀스데이', $${
    "월": [
      {"start":"13:00","end":"13:50","hours":0.83}
    ],
    "화": [
      {"start":"13:00","end":"13:50","hours":0.83},
      {"start":"19:00","end":"19:50","hours":0.83}
    ],
    "수": [
      {"start":"13:00","end":"13:50","hours":0.83}
    ],
    "목": [
      {"start":"13:00","end":"13:50","hours":0.83},
      {"start":"19:00","end":"19:50","hours":0.83}
    ],
    "금": [
      {"start":"13:00","end":"13:50","hours":0.83},
      {"start":"15:00","end":"15:50","hours":0.83},
      {"start":"16:00","end":"16:50","hours":0.83}
    ],
    "토": [
      {"start":"06:00","end":"06:50","hours":0.83},
      {"start":"07:00","end":"07:50","hours":0.83},
      {"start":"08:00","end":"08:50","hours":0.83},
      {"start":"09:00","end":"09:50","hours":0.83},
      {"start":"10:00","end":"10:50","hours":0.83},
      {"start":"11:00","end":"11:50","hours":0.83},
      {"start":"12:00","end":"12:50","hours":0.83},
      {"start":"13:00","end":"13:50","hours":0.83},
      {"start":"14:00","end":"14:50","hours":0.83},
      {"start":"15:00","end":"15:50","hours":0.83},
      {"start":"16:00","end":"16:50","hours":0.83},
      {"start":"17:00","end":"17:50","hours":0.83}
    ],
    "일": [
      {"start":"09:00","end":"10:50","hours":1.83},
      {"start":"12:00","end":"13:50","hours":1.83},
      {"start":"15:00","end":"16:50","hours":1.83}
    ]
  }$$::jsonb, '2026-06-03'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_0031'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0031');
