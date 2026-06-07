-- Pool's day — 수영장 시설 규격 2차 보강 (첨벙·헬로우스윔 추가 출처).
--
-- 0253(1차) 이후 남은 51개 갭 중 19곳을 보강. 이번엔 1차에서 안 쓴
-- 첨벙(cbswim)·헬로우스윔(helloswim) 디렉토리를 우선 사용 — 특히 cbswim이
-- 수심을 명시한 페이지가 많아 수심 갭 다수 해소.
-- 정책(pool_specs_2nd_source_ok): 규격은 2차 출처 OK. 첨벙은 시간표만 배제 대상,
--   레인/길이/수심 같은 고정 규격은 참고 가능. 가능한 한 2개 출처 교차검증.
-- coalesce로 기존 비-null 값 보존(0253에서 채운 값 안 건드림).
--
-- 판정/특이: 0054 곰두리 레인수 6 확정(포털'12'는 이상치로 판단).
--   0053 올림픽 경영풀 가변수심 1.2~2.0(다이빙풀 별도 5m는 0253서 처리).
--   0129 서울YMCA 1~3m 점진(공식 TLS차단으로 후기 기반, medium).
-- 여전히 미확인(전부 운영자 확인 필요): 0050·0068·0069·0070·0074·0118·0127 등
--   청소년센터·아파트부속·찜질방부속은 디렉토리에도 규격 미수록.

update public.pools set
  depth_min = coalesce(depth_min, 1.2),
  depth_max = coalesce(depth_max, 1.2)
where id = 'POOL_0009';

update public.pools set
  depth_min = coalesce(depth_min, 1),
  depth_max = coalesce(depth_max, 1.3)
where id = 'POOL_0038';

update public.pools set
  depth_min = coalesce(depth_min, 1.2),
  depth_max = coalesce(depth_max, 2)
where id = 'POOL_0053';

update public.pools set
  lane_count = coalesce(lane_count, 6)
where id = 'POOL_0054';

update public.pools set
  pool_length = coalesce(pool_length, 25)
where id = 'POOL_0056';

update public.pools set
  lane_count = coalesce(lane_count, 4),
  pool_length = coalesce(pool_length, 20)
where id = 'POOL_0062';

update public.pools set
  depth_min = coalesce(depth_min, 0.4),
  depth_max = coalesce(depth_max, 1.2)
where id = 'POOL_0064';

update public.pools set
  depth_min = coalesce(depth_min, 1),
  depth_max = coalesce(depth_max, 1.3),
  has_kids_pool = true
where id = 'POOL_0065';

update public.pools set
  depth_min = coalesce(depth_min, 1.4),
  depth_max = coalesce(depth_max, 1.4)
where id = 'POOL_0079';

update public.pools set
  lane_count = coalesce(lane_count, 5)
where id = 'POOL_0082';

update public.pools set
  depth_min = coalesce(depth_min, 0.9),
  depth_max = coalesce(depth_max, 1.4)
where id = 'POOL_0088';

update public.pools set
  pool_length = coalesce(pool_length, 25)
where id = 'POOL_0090';

update public.pools set
  depth_min = coalesce(depth_min, 1.2),
  depth_max = coalesce(depth_max, 1.4)
where id = 'POOL_0092';

update public.pools set
  pool_length = coalesce(pool_length, 25)
where id = 'POOL_0093';

update public.pools set
  lane_count = coalesce(lane_count, 5),
  pool_length = coalesce(pool_length, 25),
  depth_min = coalesce(depth_min, 1.2),
  depth_max = coalesce(depth_max, 1.2)
where id = 'POOL_0096';

update public.pools set
  depth_min = coalesce(depth_min, 1.2),
  depth_max = coalesce(depth_max, 1.2)
where id = 'POOL_0098';

update public.pools set
  depth_min = coalesce(depth_min, 1.3),
  depth_max = coalesce(depth_max, 1.5)
where id = 'POOL_0104';

update public.pools set
  depth_min = coalesce(depth_min, 1.3),
  depth_max = coalesce(depth_max, 1.3)
where id = 'POOL_0106';

update public.pools set
  pool_length = coalesce(pool_length, 25),
  depth_min = coalesce(depth_min, 1),
  depth_max = coalesce(depth_max, 3)
where id = 'POOL_0129';
