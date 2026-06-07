-- Pool's day — 노원구민체육센터(POOL_0128) photo_url 등록.
--
-- 크리스 결정(2026-06-08): 0248에서 재건축 운영중단 placeholder로 등록되며 사진이 없던
-- 유일한 풀(전체 135곳 중 1곳)이었음. 운영자가 시설 사진 제공 → 등록.
-- 사진은 pool-photos/POOL_0128.jpg(660x380 → 400x230 리사이즈) → Storage(pool-photos 버킷) 업로드.
--
-- 호스트는 실제 DB에 저장된 값(prod rwxefc…)과 일치 — dev 호스트 회귀([[pool_photo_url_dev_baked]]) 회피.
-- (운영 상태는 그대로: free_swim_available=false / has_schedule=false. 재개관 시 별도 UPDATE.)
update public.pools
set photo_url = 'https://rwxefcbqybzsyjtpfbdt.supabase.co/storage/v1/object/public/pool-photos/' || id || '.jpg'
where id = 'POOL_0128';
