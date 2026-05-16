-- Pool's Day v1 — KBS스포츠월드(POOL_SEOUL_0008) 유아풀 보유 정정.
-- 출처: 사용자 확인(KBS에 유아풀 있음). 0034가 has_kids_pool=false로 박았고
-- ON CONFLICT (id) DO NOTHING이라 INSERT 재실행 무효 → UPDATE로 정정. 멱등.
-- (0027 관악구민종합체육센터 유아풀 정정과 동일 패턴.)

update public.pools
set has_kids_pool = true
where id = 'POOL_SEOUL_0008';
