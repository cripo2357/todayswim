-- Pool's day v1 — 요일 안내문구(day_notes) 톤앤매너 통일.
-- 표준 톤(사당 0024 기준): "매월 {주차}주차에만 운영합니다." — 숫자 주차, "에만 운영합니다." 종결.
-- 영등포제2스포츠센터(0031) "매월 둘째·넷째 일요일만 개관합니다." → 표준 톤으로 정정.
--   (둘째·넷째 = 2·4주차) 0031 ON CONFLICT라 INSERT 재실행 무효 → day_notes UPDATE.
-- 참고: 사당(POOL_SEOUL_0006) "매월 1주차에만 운영합니다."는 이미 표준 톤 → 미변경.

update public.schedules
set day_notes = $${"일":"매월 2·4주차에만 운영합니다."}$$::jsonb
where pool_id = 'POOL_SEOUL_0007';
