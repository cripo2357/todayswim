-- Pool's day — 약관 동의 'age'(만14세)도 서버 보관.
--
-- 배경: age 는 약관 '문서'는 없지만 가입 필수 동의 항목인데, 지금까지 로컬
-- (AsyncStorage)에만 저장돼서 — 재로그인/기기변경/재설치/타 프로바이더 로그인
-- 시 age 가 비어 "약관 미동의"로 판정 → 약관 화면 → ProfileSetup(새 가입처럼)
-- 으로 잘못 보내던 문제(2026-06-03). 동의 기록은 계정 소속이므로 age 도
-- terms_agreements(서버, uid 기준, append-only)에 함께 적재한다.
--
-- terms_agreements.terms_type CHECK 에 'age' 추가. (terms 문서 테이블은
-- 그대로 — age 는 문서 없는 연령확인이라 terms row 불필요.)

alter table public.terms_agreements
  drop constraint if exists terms_agreements_terms_type_check;

alter table public.terms_agreements
  add constraint terms_agreements_terms_type_check
  check (terms_type in
    ('service','privacy_consent','privacy_policy','location','marketing','age'));
