-- Pool's day — 서초 사설 6곳 사진 연결 (방배현대·한전·삼성·코오롱·서일·일흥).
-- 운영자 드롭 사진 → 400px 리사이즈 + POOL_00XX.jpg 리네임 완료(pool-photos/, gitignored).
-- 등록 마이그레이션(0134~0139)이 이미 적용됐으므로 photo_url을 UPDATE로 연결.

update public.pools set photo_url = 'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0039.jpg' where id = 'POOL_0039';
update public.pools set photo_url = 'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0040.jpg' where id = 'POOL_0040';
update public.pools set photo_url = 'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0041.jpg' where id = 'POOL_0041';
update public.pools set photo_url = 'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0042.jpg' where id = 'POOL_0042';
update public.pools set photo_url = 'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0043.jpg' where id = 'POOL_0043';
update public.pools set photo_url = 'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0044.jpg' where id = 'POOL_0044';
