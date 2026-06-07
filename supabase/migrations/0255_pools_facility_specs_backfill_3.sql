-- Pool's day — 수영장 시설 규격 3차 보강 (leonlsy 네이버 블로그 자치구별 정리).
--
-- 출처: blog.naver.com/leonlsy '서울 OO구 자유수영 정보 모음' 25개 글(자치구 전수).
--   블로거가 구청·공식 예약사이트를 인용해 레인 개수/길이/수심을 정리한 2차 모음.
-- 정책(pool_specs_2nd_source_ok): 규격 2차 출처 OK. 시간표·요금은 블로그서 추출 안 함.
-- coalesce로 기존값 보존(0253·0254 값 유지). 빈칸(fills)만 반영.
--
-- 이번 수확: 그동안 디렉토리에도 없던 청소년센터·아파트부속의 레인·길이 확보
--   (구로청소년·금천청소년·노원청소년·수서청소년·양천주민편익·길음푸르지오·월드컵스파랜드).
--
-- 충돌(블로그≠DB)은 자동 반영 안 함 — 별도 검토(크리스 판단). 다수가 ±0.1m 수심
--   해석차 또는 블로그의 레인 합산(유아풀 포함) 정의 차이. 1차(운영자) 확인 후 정정 예정.

update public.pools set
  lane_count = coalesce(lane_count, 5),
  depth_min = coalesce(depth_min, 1.4),
  depth_max = coalesce(depth_max, 1.4)
where id = 'POOL_0050';

update public.pools set
  lane_count = coalesce(lane_count, 5),
  pool_length = coalesce(pool_length, 25)
where id = 'POOL_0068';

update public.pools set
  lane_count = coalesce(lane_count, 5),
  pool_length = coalesce(pool_length, 25)
where id = 'POOL_0069';

update public.pools set
  lane_count = coalesce(lane_count, 6),
  pool_length = coalesce(pool_length, 25)
where id = 'POOL_0070';

update public.pools set
  lane_count = coalesce(lane_count, 6),
  pool_length = coalesce(pool_length, 25),
  depth_min = coalesce(depth_min, 1.2),
  depth_max = coalesce(depth_max, 1.2)
where id = 'POOL_0074';

update public.pools set
  depth_min = coalesce(depth_min, 1),
  depth_max = coalesce(depth_max, 1.2)
where id = 'POOL_0087';

update public.pools set
  lane_count = coalesce(lane_count, 6),
  pool_length = coalesce(pool_length, 25)
where id = 'POOL_0118';

update public.pools set
  lane_count = coalesce(lane_count, 5),
  pool_length = coalesce(pool_length, 25)
where id = 'POOL_0127';
