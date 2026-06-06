-- Pool's day — 초기 풀(POOL_0001~0013) photo_url 정정. 옛 파일명(POOL_SEOUL_00XX.jpg) → id 기반(POOL_00XX.jpg).
-- 배경: 0001~0013은 POOL_SEOUL_xxxx → POOL_00XX로 리네임됐으나 photo_url은 옛 POOL_SEOUL_00XX.jpg를 가리킨 채 방치.
--   prod Storage엔 이미 POOL_0001.jpg~POOL_0013.jpg가 업로드돼 있어(200) 파일명만 맞추면 표시됨(드롭/업로드 불필요).
--   resolvePoolPhotoUrl이 host는 현재 env로 재조합하므로 파일명만 정확하면 됨([[pool_photo_url_dev_baked]] 교훈).
update public.pools set photo_url = 'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/' || id || '.jpg'
where id in (
  'POOL_0001','POOL_0002','POOL_0003','POOL_0004','POOL_0005','POOL_0006','POOL_0007',
  'POOL_0008','POOL_0009','POOL_0010','POOL_0011','POOL_0012','POOL_0013'
);
