-- Pool's day — 강남 공공 2곳 사진 연결 (강남주민편익·자곡동).
-- 운영자 드롭 사진 → 400px 리사이즈 + POOL_00XX.jpg 리네임 완료(pool-photos/, gitignored).
-- 등록 마이그레이션(0143·0144)이 이미 적용됐으므로 photo_url을 UPDATE로 연결.
-- (강남스포츠문화센터 POOL_0046은 0142 INSERT에 이미 포함. 더논현은 자유수영 1회 불가로 등록 제외.)

update public.pools set photo_url = 'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0047.jpg' where id = 'POOL_0047';
update public.pools set photo_url = 'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0048.jpg' where id = 'POOL_0048';
