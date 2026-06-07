-- Pool's day — photo_url 호스트를 prod로 통일 (dev/prod 모두 prod Storage 참조).
-- 배경(크리스 결정 2026-06-07): prod Storage를 사진 단일 출처(SSOT)로. 기존 photo_url이
--   dev 호스트(hldfsst)로 박혀 있던 것을 prod 호스트(rwxefc)로 치환. prod 버킷 public이라
--   dev·prod 앱 모두 동일 public URL로 사진 로드 → dev host 회귀 근본 정리.
-- [[pool_photo_url_dev_baked]] 해소. 적용 대상=dev host가 박힌 모든 풀(신규 19곳 포함).
update public.pools
set photo_url = replace(photo_url, 'hldfsstyzbnqnrlqhhtc', 'rwxefcbqybzsyjtpfbdt')
where photo_url like '%hldfsstyzbnqnrlqhhtc%';
