-- Pool's day v1 — 관악구민종합체육센터(POOL_SEOUL_0005) 유아풀 보유 반영.
-- 0021은 출처에 시설 정보 없어 has_kids_pool=false로 등록 → 사용자 확인: 유아풀 있음.
-- 0021 ON CONFLICT DO NOTHING이라 INSERT 재실행 무효 → UPDATE 보정.
-- has_kids_pool=true → 카드 cyan 칩(0013) 노출 대상이 됨.

update public.pools
set has_kids_pool = true
where id = 'POOL_SEOUL_0005';
