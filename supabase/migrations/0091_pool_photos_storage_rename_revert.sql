-- Pool's day — Phase 2: 0090 storage rename revert + photo_url 정합 복구.
--
-- ## 사유 (2026-05-25)
--
-- 0090이 `update storage.objects set name=...` 으로 metadata 만 갱신했고
-- 실제 S3 파일은 옛 경로(POOL_SEOUL_NNNN, POOL_BUSAN_HOTEL_0001)에 그대로.
-- → 클라이언트가 새 URL(POOL_NNNN.jpg) 요청 시 404.
-- → 앱에서 13개 풀 섬네일 안 보임 (POOL_0014만 새로 업로드되어 정합).
--
-- ## 복구 전략
--
-- "사진 URL 명명 = 옛 패턴, pools.id = 새 opaque" 분리 허용:
--   - storage.objects.name → 옛 이름 (S3 파일과 정합)
--   - pools.photo_url      → 옛 파일명 경로 (storage와 정합)
--   - pools.id             → 새 POOL_NNNN 유지
-- photo_url은 사용자 노출 string이 아니므로 명명 mismatch 무해.
--
-- POOL_0014 (동대문 — 새로 업로드된 유일한 케이스)는 정합 상태라 매핑 제외.
-- POOL_0015 (르컬렉티브)는 옛 ID가 POOL_BUSAN_HOTEL_0001 — 같이 revert.
--
-- ## 멱등성
--
-- WHERE 매치 안 되면 no-op. 재실행 안전.

begin;

-- 1) storage.objects.name 옛 이름으로 revert
update storage.objects o
set name = m.old_name
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
  ('POOL_BUSAN_HOTEL_0001.jpg', 'POOL_0015.jpg')
) as m(old_name, new_name)
where o.bucket_id = 'pool-photos' and o.name = m.new_name;

-- 2) pools.photo_url 옛 파일명으로 revert (storage와 정합)
update public.pools p
set photo_url = replace(p.photo_url, m.new_name, m.old_name)
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
  ('POOL_BUSAN_HOTEL_0001.jpg', 'POOL_0015.jpg')
) as m(old_name, new_name)
where p.photo_url like '%' || m.new_name;

commit;
