-- Pool's day — Phase 2: Supabase Storage `pool-photos` 버킷의 객체명
-- 일괄 rename (0089 풀 ID 리네임과 짝).
--
-- 0089가 pools.photo_url 의 URL 경로(파일명 포함)는 갱신했지만, Storage
-- 객체 자체는 옛 파일명(`POOL_SEOUL_NNNN.jpg`)으로 남아 있어 photo_url
-- 요청 시 404. 객체명을 새 ID(`POOL_NNNN.jpg`)로 일괄 rename.
--
-- ## 매핑 (15개 — 0089와 동일)
--
-- ## 멱등성
--
-- 이미 새 이름으로 rename된 행은 WHERE 매치 안 되어 no-op. 재실행 안전.
-- 0089 적용 전(아직 옛 ID)이면 photo_url과 짝이 안 맞으므로 0089 → 0090
-- 순서로 적용해야 함.

update storage.objects o
set name = m.new_name
from (values
  ('POOL_SEOUL_0005.jpg',       'POOL_0001.jpg'),
  ('POOL_SEOUL_0006.jpg',       'POOL_0002.jpg'),
  ('POOL_SEOUL_0007.jpg',       'POOL_0003.jpg'),
  ('POOL_SEOUL_0008.jpg',       'POOL_0004.jpg'),
  ('POOL_SEOUL_0009.jpg',       'POOL_0005.jpg'),
  ('POOL_SEOUL_0010.jpg',       'POOL_0006.jpg'),
  ('POOL_SEOUL_0011.jpg',       'POOL_0007.jpg'),
  ('POOL_SEOUL_0012.jpg',       'POOL_0008.jpg'),
  ('POOL_SEOUL_0013.jpg',       'POOL_0009.jpg'),
  ('POOL_SEOUL_0014.jpg',       'POOL_0010.jpg'),
  ('POOL_SEOUL_0015.jpg',       'POOL_0011.jpg'),
  ('POOL_SEOUL_0016.jpg',       'POOL_0012.jpg'),
  ('POOL_SEOUL_0017.jpg',       'POOL_0013.jpg'),
  ('POOL_SEOUL_0018.jpg',       'POOL_0014.jpg'),
  ('POOL_BUSAN_HOTEL_0001.jpg', 'POOL_0015.jpg')
) as m(old_name, new_name)
where o.bucket_id = 'pool-photos' and o.name = m.old_name;
