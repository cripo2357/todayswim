-- Pool's day — 청구문화스포츠센터(POOL_0095, 청구교육문화관) 제외(삭제).
-- 사유: 2024-10 리뷰('시설공사로 폐쇄') + 당근 동네생활('문 닫음, 재개발') 다수 신호 + 2025~2026 재개관 확인 정보 없음.
-- 닫힌 수영장 노출은 헛걸음·신뢰도 손상이라 크리스 승인하에 제외(2026-06-06). 재개관 확인되면 청구교육문화관 명으로 재등록.
delete from public.schedules where pool_id = 'POOL_0095';
delete from public.pools where id = 'POOL_0095';
