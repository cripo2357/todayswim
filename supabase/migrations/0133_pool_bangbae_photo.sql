-- Pool's day — 방배열린문화센터(POOL_0038) 사진 연결.
-- 운영자 드롭 사진(방배열린.jpg) → 400px 리사이즈 + POOL_0038.jpg 리네임 완료.
-- 0132 등록 시 photo_url=NULL이었고 이미 적용됨 → UPDATE로 연결.
-- (usePools가 파일명만 추출해 환경별 Storage URL 조합하므로 host는 무관 — 기존 패턴 유지.)

update public.pools
set photo_url = 'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0038.jpg'
where id = 'POOL_0038';
