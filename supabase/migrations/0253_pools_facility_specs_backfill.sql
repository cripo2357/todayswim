-- Pool's day — 수영장 시설 규격(레인수·길이·수심·유아풀·다이빙풀) 일괄 보강.
--
-- 누락 84곳 중 68곳을 웹 리서치로 확인해 채움. 출처 우선순위:
--   1차) 서울시 생활체육포털·구청·운영주체 공식 페이지
--   2차) swimmingis/kswim 등 디렉토리 (시설 규격은 변동성 낮은 객관사실이라 참고 가능)
-- 정책(pool_specs_2nd_source_ok): 규격은 2차 출처 OK. 확인 안 된 항목은 추측하지 않고 비워둠.
--
-- 안전장치: 숫자 컬럼은 coalesce(기존값, 신규)로 **기존 비-null 값을 절대 덮어쓰지 않음**.
--           플래그(has_kids_pool/has_diving_pool)는 출처에서 확인된 경우만 true로 승격.
--
-- 제외(전 항목 미확인 또는 출처 충돌/저신뢰): 0050 수서청소년·0065 와우스포츠·0068 구로청소년·
--   0069 금천청소년·0070 양천YMCA·0074 월드컵스파랜드·0096 서울YWCA·0118 길음푸르지오·
--   0127 노원청소년·0129 서울YMCA — 운영자 직접 확인 필요.
-- 0054 곰두리: 레인수 출처 충돌(포털12 vs 디렉토리6)로 레인수만 보류, 나머지 보강.
-- 0053 올림픽수영장·0055 잠실제1: 다이빙풀 보유 확정(국제규격).

update public.pools set
  lane_count = coalesce(lane_count, 6),
  pool_length = coalesce(pool_length, 25),
  has_kids_pool = true
where id = 'POOL_0009';

update public.pools set
  lane_count = coalesce(lane_count, 6),
  pool_length = coalesce(pool_length, 25),
  has_kids_pool = true
where id = 'POOL_0010';

update public.pools set
  has_kids_pool = true
where id = 'POOL_0064';

update public.pools set
  lane_count = coalesce(lane_count, 6),
  pool_length = coalesce(pool_length, 25)
where id = 'POOL_0035';

update public.pools set
  lane_count = coalesce(lane_count, 6),
  pool_length = coalesce(pool_length, 25),
  has_kids_pool = true
where id = 'POOL_0036';

update public.pools set
  lane_count = coalesce(lane_count, 5),
  pool_length = coalesce(pool_length, 25)
where id = 'POOL_0038';

update public.pools set
  lane_count = coalesce(lane_count, 6),
  pool_length = coalesce(pool_length, 25),
  depth_min = coalesce(depth_min, 1.2),
  depth_max = coalesce(depth_max, 1.4)
where id = 'POOL_0040';

update public.pools set
  lane_count = coalesce(lane_count, 8),
  pool_length = coalesce(pool_length, 25),
  has_kids_pool = true
where id = 'POOL_0041';

update public.pools set
  lane_count = coalesce(lane_count, 6),
  pool_length = coalesce(pool_length, 25),
  depth_min = coalesce(depth_min, 1.3),
  depth_max = coalesce(depth_max, 1.3)
where id = 'POOL_0042';

update public.pools set
  lane_count = coalesce(lane_count, 5)
where id = 'POOL_0043';

update public.pools set
  lane_count = coalesce(lane_count, 5),
  pool_length = coalesce(pool_length, 25),
  depth_min = coalesce(depth_min, 1.2),
  depth_max = coalesce(depth_max, 1.4),
  has_kids_pool = true
where id = 'POOL_0044';

update public.pools set
  lane_count = coalesce(lane_count, 5),
  pool_length = coalesce(pool_length, 25),
  has_kids_pool = true
where id = 'POOL_0046';

update public.pools set
  lane_count = coalesce(lane_count, 6),
  pool_length = coalesce(pool_length, 25),
  has_kids_pool = true
where id = 'POOL_0047';

update public.pools set
  lane_count = coalesce(lane_count, 5),
  has_kids_pool = true
where id = 'POOL_0048';

update public.pools set
  lane_count = coalesce(lane_count, 5),
  pool_length = coalesce(pool_length, 25),
  has_kids_pool = true
where id = 'POOL_0051';

update public.pools set
  lane_count = coalesce(lane_count, 6),
  pool_length = coalesce(pool_length, 25),
  depth_min = coalesce(depth_min, 1.2),
  depth_max = coalesce(depth_max, 1.2),
  has_kids_pool = true
where id = 'POOL_0052';

update public.pools set
  lane_count = coalesce(lane_count, 10),
  pool_length = coalesce(pool_length, 50),
  depth_max = coalesce(depth_max, 3),
  has_diving_pool = true
where id = 'POOL_0053';

update public.pools set
  pool_length = coalesce(pool_length, 25),
  depth_min = coalesce(depth_min, 1.2),
  depth_max = coalesce(depth_max, 1.2),
  has_kids_pool = true
where id = 'POOL_0054';

update public.pools set
  pool_length = coalesce(pool_length, 50),
  has_diving_pool = true
where id = 'POOL_0055';

update public.pools set
  lane_count = coalesce(lane_count, 6),
  depth_min = coalesce(depth_min, 1.2),
  depth_max = coalesce(depth_max, 1.4),
  has_kids_pool = true
where id = 'POOL_0056';

update public.pools set
  lane_count = coalesce(lane_count, 5),
  pool_length = coalesce(pool_length, 25),
  depth_min = coalesce(depth_min, 1.1),
  depth_max = coalesce(depth_max, 1.4),
  has_kids_pool = true
where id = 'POOL_0057';

update public.pools set
  lane_count = coalesce(lane_count, 4),
  pool_length = coalesce(pool_length, 25),
  depth_min = coalesce(depth_min, 1.2),
  depth_max = coalesce(depth_max, 1.2),
  has_kids_pool = true
where id = 'POOL_0058';

update public.pools set
  lane_count = coalesce(lane_count, 6),
  pool_length = coalesce(pool_length, 25),
  depth_min = coalesce(depth_min, 1.2),
  depth_max = coalesce(depth_max, 1.2),
  has_kids_pool = true
where id = 'POOL_0059';

update public.pools set
  lane_count = coalesce(lane_count, 6),
  pool_length = coalesce(pool_length, 25),
  has_kids_pool = true
where id = 'POOL_0061';

update public.pools set
  has_kids_pool = true
where id = 'POOL_0062';

update public.pools set
  lane_count = coalesce(lane_count, 5),
  pool_length = coalesce(pool_length, 25),
  has_kids_pool = true
where id = 'POOL_0023';

update public.pools set
  lane_count = coalesce(lane_count, 6),
  pool_length = coalesce(pool_length, 25),
  depth_min = coalesce(depth_min, 1.3),
  depth_max = coalesce(depth_max, 1.3),
  has_kids_pool = true
where id = 'POOL_0066';

update public.pools set
  lane_count = coalesce(lane_count, 5),
  pool_length = coalesce(pool_length, 25),
  depth_min = coalesce(depth_min, 1.2),
  depth_max = coalesce(depth_max, 1.2),
  has_kids_pool = true
where id = 'POOL_0067';

update public.pools set
  depth_min = coalesce(depth_min, 1.4),
  depth_max = coalesce(depth_max, 1.5)
where id = 'POOL_0018';

update public.pools set
  lane_count = coalesce(lane_count, 5),
  pool_length = coalesce(pool_length, 25),
  depth_min = coalesce(depth_min, 0.8),
  depth_max = coalesce(depth_max, 1.7)
where id = 'POOL_0071';

update public.pools set
  lane_count = coalesce(lane_count, 6),
  pool_length = coalesce(pool_length, 25),
  depth_min = coalesce(depth_min, 1.2),
  depth_max = coalesce(depth_max, 1.4),
  has_kids_pool = true
where id = 'POOL_0072';

update public.pools set
  lane_count = coalesce(lane_count, 6),
  pool_length = coalesce(pool_length, 25),
  depth_min = coalesce(depth_min, 1.2),
  depth_max = coalesce(depth_max, 1.4),
  has_kids_pool = true
where id = 'POOL_0073';

update public.pools set
  pool_length = coalesce(pool_length, 25),
  has_kids_pool = true
where id = 'POOL_0075';

update public.pools set
  pool_length = coalesce(pool_length, 25),
  depth_min = coalesce(depth_min, 1.3),
  depth_max = coalesce(depth_max, 1.3)
where id = 'POOL_0082';

update public.pools set
  lane_count = coalesce(lane_count, 6),
  pool_length = coalesce(pool_length, 25),
  depth_min = coalesce(depth_min, 1.4),
  depth_max = coalesce(depth_max, 1.4),
  has_kids_pool = true
where id = 'POOL_0077';

update public.pools set
  lane_count = coalesce(lane_count, 7),
  pool_length = coalesce(pool_length, 25),
  depth_min = coalesce(depth_min, 1.4),
  depth_max = coalesce(depth_max, 1.4),
  has_kids_pool = true
where id = 'POOL_0078';

update public.pools set
  lane_count = coalesce(lane_count, 5),
  pool_length = coalesce(pool_length, 20)
where id = 'POOL_0079';

update public.pools set
  lane_count = coalesce(lane_count, 5),
  pool_length = coalesce(pool_length, 25),
  depth_min = coalesce(depth_min, 1.3),
  depth_max = coalesce(depth_max, 1.4),
  has_kids_pool = true
where id = 'POOL_0080';

update public.pools set
  lane_count = coalesce(lane_count, 4),
  pool_length = coalesce(pool_length, 25),
  depth_min = coalesce(depth_min, 1.2),
  depth_max = coalesce(depth_max, 1.3)
where id = 'POOL_0081';

update public.pools set
  lane_count = coalesce(lane_count, 6),
  pool_length = coalesce(pool_length, 25),
  depth_min = coalesce(depth_min, 1.1),
  depth_max = coalesce(depth_max, 1.3)
where id = 'POOL_0084';

update public.pools set
  lane_count = coalesce(lane_count, 5)
where id = 'POOL_0085';

update public.pools set
  lane_count = coalesce(lane_count, 4),
  pool_length = coalesce(pool_length, 25),
  has_kids_pool = true
where id = 'POOL_0086';

update public.pools set
  lane_count = coalesce(lane_count, 6),
  pool_length = coalesce(pool_length, 25)
where id = 'POOL_0087';

update public.pools set
  lane_count = coalesce(lane_count, 4),
  pool_length = coalesce(pool_length, 25),
  has_kids_pool = true
where id = 'POOL_0088';

update public.pools set
  lane_count = coalesce(lane_count, 6),
  pool_length = coalesce(pool_length, 25),
  depth_min = coalesce(depth_min, 1.2),
  depth_max = coalesce(depth_max, 1.2)
where id = 'POOL_0089';

update public.pools set
  lane_count = coalesce(lane_count, 5),
  has_kids_pool = true
where id = 'POOL_0090';

update public.pools set
  lane_count = coalesce(lane_count, 5),
  pool_length = coalesce(pool_length, 25),
  depth_min = coalesce(depth_min, 1.2),
  depth_max = coalesce(depth_max, 1.4),
  has_kids_pool = true
where id = 'POOL_0091';

update public.pools set
  lane_count = coalesce(lane_count, 6)
where id = 'POOL_0093';

update public.pools set
  lane_count = coalesce(lane_count, 5),
  pool_length = coalesce(pool_length, 25),
  depth_min = coalesce(depth_min, 1.3),
  depth_max = coalesce(depth_max, 1.4),
  has_kids_pool = true
where id = 'POOL_0094';

update public.pools set
  lane_count = coalesce(lane_count, 8),
  pool_length = coalesce(pool_length, 25),
  depth_min = coalesce(depth_min, 1.2),
  depth_max = coalesce(depth_max, 1.3),
  has_kids_pool = true
where id = 'POOL_0097';

update public.pools set
  lane_count = coalesce(lane_count, 7),
  pool_length = coalesce(pool_length, 25),
  has_kids_pool = true
where id = 'POOL_0098';

update public.pools set
  lane_count = coalesce(lane_count, 5),
  pool_length = coalesce(pool_length, 25),
  depth_min = coalesce(depth_min, 1.3),
  depth_max = coalesce(depth_max, 1.3),
  has_kids_pool = true
where id = 'POOL_0099';

update public.pools set
  depth_min = coalesce(depth_min, 1.2),
  depth_max = coalesce(depth_max, 1.2),
  has_kids_pool = true
where id = 'POOL_0100';

update public.pools set
  depth_min = coalesce(depth_min, 1.1),
  depth_max = coalesce(depth_max, 1.3)
where id = 'POOL_0101';

update public.pools set
  lane_count = coalesce(lane_count, 5),
  pool_length = coalesce(pool_length, 25),
  has_kids_pool = true
where id = 'POOL_0104';

update public.pools set
  lane_count = coalesce(lane_count, 6),
  pool_length = coalesce(pool_length, 25),
  depth_min = coalesce(depth_min, 1.3),
  depth_max = coalesce(depth_max, 1.3),
  has_kids_pool = true
where id = 'POOL_0105';

update public.pools set
  lane_count = coalesce(lane_count, 6),
  depth_min = coalesce(depth_min, 1.2),
  depth_max = coalesce(depth_max, 1.2),
  has_kids_pool = true
where id = 'POOL_0107';

update public.pools set
  depth_min = coalesce(depth_min, 1.2),
  depth_max = coalesce(depth_max, 1.3)
where id = 'POOL_0108';

update public.pools set
  has_kids_pool = true
where id = 'POOL_0109';

update public.pools set
  lane_count = coalesce(lane_count, 6),
  pool_length = coalesce(pool_length, 25)
where id = 'POOL_0116';

update public.pools set
  depth_min = coalesce(depth_min, 1.2),
  depth_max = coalesce(depth_max, 1.3),
  has_kids_pool = true
where id = 'POOL_0119';

update public.pools set
  depth_min = coalesce(depth_min, 1.2),
  depth_max = coalesce(depth_max, 1.4)
where id = 'POOL_0120';

update public.pools set
  depth_min = coalesce(depth_min, 1.3),
  depth_max = coalesce(depth_max, 1.3)
where id = 'POOL_0121';

update public.pools set
  lane_count = coalesce(lane_count, 5),
  pool_length = coalesce(pool_length, 25),
  has_kids_pool = true
where id = 'POOL_0122';

update public.pools set
  pool_length = coalesce(pool_length, 25)
where id = 'POOL_0125';

update public.pools set
  lane_count = coalesce(lane_count, 6),
  pool_length = coalesce(pool_length, 25),
  has_kids_pool = true
where id = 'POOL_0126';

update public.pools set
  lane_count = coalesce(lane_count, 5),
  has_kids_pool = true
where id = 'POOL_0128';

update public.pools set
  lane_count = coalesce(lane_count, 10),
  pool_length = coalesce(pool_length, 50),
  depth_min = coalesce(depth_min, 1.2),
  depth_max = coalesce(depth_max, 1.4),
  has_kids_pool = true
where id = 'POOL_0083';
