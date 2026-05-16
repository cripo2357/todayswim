-- Pool's Day v1 — KBS스포츠월드(POOL_SEOUL_0008) 이용요금 공식 정정.
-- 출처: 사용자 제공 공식 요금(kbssw.co.kr 기준).
--   · 평일 성인 9,000원  → price_weekday
--   · 주말 성인 10,000원 → price_weekend
--   (청소년 9,000·어린이 8,000 등은 스키마 컬럼 없음 → 성인 기준만 저장)
-- 0034가 cbswim 추정치(8000/9000)로 박았고 ON CONFLICT DO NOTHING이라
-- INSERT 재실행 무효 → UPDATE로 정정. 멱등.
-- price_per_session(레거시 단일 표시용)도 stale 8000 제거 위해 평일가 9000으로 동기화.

update public.pools
set price_weekday     = 9000,
    price_weekend     = 10000,
    price_per_session = 9000
where id = 'POOL_SEOUL_0008';
