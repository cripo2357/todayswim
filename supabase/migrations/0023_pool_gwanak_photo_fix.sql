-- Pool's day v1 — 관악구민종합체육센터(POOL_SEOUL_0005) photo_url 보정.
-- 0021은 photo_url 없는 버전으로 먼저 적용됨 → 행이 photo_url NULL로 생성.
-- 0021에 photo_url을 추가했지만 INSERT의 `ON CONFLICT (id) DO NOTHING` 때문에
-- 재실행해도 기존 행은 갱신 안 됨 → 명시적 UPDATE 필요.
-- (Storage의 pool-photos/POOL_SEOUL_0005.jpg 는 HTTP 200 정상 확인됨.)

update public.pools
set photo_url = 'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_SEOUL_0005.jpg'
where id = 'POOL_SEOUL_0005'
  and (photo_url is null or photo_url = '');
