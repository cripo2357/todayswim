-- Pool's day — 유한·남원 photo_url 기록. 2026-06-13.
-- 크리스 제공 사진을 pool-photos 버킷 업로드 → photo_url(prod 직접 적용). 이미지는 Storage.
update public.pools set photo_url = 'https://rwxefcbqybzsyjtpfbdt.supabase.co/storage/v1/object/public/pool-photos/POOL_0533.jpg' where id = 'POOL_0533';
update public.pools set photo_url = 'https://rwxefcbqybzsyjtpfbdt.supabase.co/storage/v1/object/public/pool-photos/POOL_0534.jpg' where id = 'POOL_0534';
