-- Pool's Day v1 — 사당문화회관(POOL_SEOUL_0006) 수심 반영.
-- 0024는 출처 "전화문의 필요"라 수심 컬럼 생략(NULL). 사용자 확인값으로 보정.
-- min == max (수심 차이 없음) → 클라이언트는 "1.2m"로 단일 표시(범위 표기 안 함).
-- 사용자가 Supabase에 직접 입력한 값을 마이그레이션으로 고정(재현성/소스 일치).
-- ※ 값 가정: depth_min = depth_max = 1.2 (m). 실제 다르면 알려주면 수정.
-- 0024 ON CONFLICT DO NOTHING이라 INSERT 재실행 무효 → UPDATE 보정.

update public.pools
set depth_min = 1.2,
    depth_max = 1.2
where id = 'POOL_SEOUL_0006';
