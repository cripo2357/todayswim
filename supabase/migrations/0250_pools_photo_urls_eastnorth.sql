-- Pool's day — 동북권 신규 풀 19곳 photo_url 일괄 등록 (POOL_0108~0127).
-- 사진은 pool-photos/POOL_NNNN.jpg(400px 리사이즈) → Supabase Storage(pool-photos 버킷) 업로드.
-- photo_url 형식·호스트는 기존 풀과 동일(기존 100여 곳과 일관). hostless 리팩토링은 출시 후 별도.
-- (POOL_0110 동대문야외=삭제됨 / POOL_0128 노원구민체육센터=운영중단 사진없음 → 제외)
update public.pools
set photo_url = 'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/' || id || '.jpg'
where id in (
  'POOL_0108','POOL_0109','POOL_0111','POOL_0112','POOL_0113','POOL_0114',
  'POOL_0115','POOL_0116','POOL_0117','POOL_0118','POOL_0119','POOL_0120',
  'POOL_0121','POOL_0122','POOL_0123','POOL_0124','POOL_0125','POOL_0126','POOL_0127'
);
