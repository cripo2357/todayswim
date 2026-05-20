-- Pool's day — Phase 3: app_status에 후원 계좌 정보 컬럼 3개 추가.
--
-- ## 배경
--
-- "후원으로 서비스 응원하기" 화면(Figma 238:8643)에 표시할 카카오뱅크 계좌 정보.
-- 운영자가 Dashboard에서 변경할 수 있어야 — 코드/설정에 박지 않고 app_status
-- 단일 row(id=1)에 컬럼 추가. 재빌드 불필요.
--
-- ## 컬럼
--
-- - donation_bank    : 은행 이름 (예: '카카오뱅크')
-- - donation_account : 계좌 번호 (예: '1234-XX-5678')
-- - donation_holder  : 예금주 (예: "Pool's day 김*호")
--
-- 모두 nullable — 셋 다 채워져야 클라가 후원 카드 노출, 하나라도 NULL이면
-- 카드 미표시(준비 중 상태).

alter table public.app_status
  add column if not exists donation_bank    text,
  add column if not exists donation_account text,
  add column if not exists donation_holder  text;

comment on column public.app_status.donation_bank is
  '후원 안내 화면에 표시할 은행 이름. 운영자가 Dashboard에서 변경.';
comment on column public.app_status.donation_account is
  '후원 안내 화면에 표시할 계좌 번호.';
comment on column public.app_status.donation_holder is
  '후원 안내 화면에 표시할 예금주.';
