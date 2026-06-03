-- Pool's day — Phase 2: 수영장 1곳 추가: 방배열린문화센터 (POOL_0038). 서초구 방배동(내방역).
--
-- ## 시간표·가격 출처
--
-- 공식 서초 공공체육시설(seocho.go.kr/sports/fmcs/88) "일일자유수영" 표 + 운영자 확인 — 1차.
-- (코오롱스포렉스 위탁 구립 시설.)
--
-- - 자유수영 시간표 (공식 표):
--   · 평일 1부 08:00 (월~금) / 2부 13:00 (화·목)
--     → 월·수·금: 1부만 / 화·목: 1·2부
--   · 주말 1부 09:30~11:30 / 2부 12:30~14:30 / 3부 15:30~17:30 (토·일)
--   · ★평일 종료시간이 표에 미기재(시작시간만). 같은 페이지 타 프로그램이 모두 50분 단위
--     (스피닝 09:00~09:50, 요가 20:00~20:50)이라 평일 자유수영도 50분(08:00~08:50,
--     13:00~13:50)으로 추정 등록. 다르면 UPDATE 보강.
-- - 가격: 평일 3,300 / 주말 5,500.
--
-- ## 메타데이터
--
-- - 시설: 성인풀 25m × 5레인 + 체온조절풀 보유. depth는 출처 미기재 → NULL.
-- - 좌표 [신뢰도 높음]: 카카오 "서울 서초구 방배로 173" ROAD_ADDR 정확 매치(5·6·7층).
-- - 전화: 02-535-2601. ownership=public(구립·코오롱스포렉스 위탁).
-- - photo_url=NULL: 사진 미수령.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url,
  schedule_source_url
) values
  ('POOL_0038', '방배열린문화센터', '서울', '서초구',
    '서울특별시 서초구 방배로 173',
    37.4890076091191, 126.992242397414, 'indoor', 'public',
    '02-535-2601', 'https://www.seocho.go.kr/sports/fmcs/88',
    5, 25, null, null,
    ARRAY['체온조절풀'], false, false, false,
    true, true,
    3300, 3300, 5500, null,
    'https://www.seocho.go.kr/sports/fmcs/88')
on conflict (id) do nothing;

-- 자유수영 시간표 (공식 표 + 평일 50분 추정).
-- hours: 50분=0.83, 2h00m=2.
insert into public.schedules (pool_id, author_nickname, by_day, updated_at) values
  ('POOL_0038', '풀스데이', $${
    "월": [{"start":"08:00","end":"08:50","hours":0.83}],
    "화": [
      {"start":"08:00","end":"08:50","hours":0.83},
      {"start":"13:00","end":"13:50","hours":0.83}
    ],
    "수": [{"start":"08:00","end":"08:50","hours":0.83}],
    "목": [
      {"start":"08:00","end":"08:50","hours":0.83},
      {"start":"13:00","end":"13:50","hours":0.83}
    ],
    "금": [{"start":"08:00","end":"08:50","hours":0.83}],
    "토": [
      {"start":"09:30","end":"11:30","hours":2},
      {"start":"12:30","end":"14:30","hours":2},
      {"start":"15:30","end":"17:30","hours":2}
    ],
    "일": [
      {"start":"09:30","end":"11:30","hours":2},
      {"start":"12:30","end":"14:30","hours":2},
      {"start":"15:30","end":"17:30","hours":2}
    ]
  }$$::jsonb, '2026-06-04'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_0038'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0038');
