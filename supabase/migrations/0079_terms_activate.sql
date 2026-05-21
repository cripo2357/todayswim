-- Pool's day — terms 활성화 + 초기 시드 (P3-A2).
--
-- 0044_terms 가 "Phase 2 설계 초안 미적용" 상태로 남아 있었음. P3 진입 +
-- 출시 준비(법적 의무) → 활성화. 0044 가 이미 적용됐다면 본 마이그레이션은
-- 시드만 추가.
--
-- 시드 정책:
--   - 5종 약관 모두 version '1.0.0', effective_date '2026-05-28' 으로 통일.
--   - content 는 빈 배열 — 화면 표시는 src/lib/termsContent.ts 가 단일 출처
--     (앱 배포 단위로 묶임). 약관 개정 시 termsContent.ts 갱신 + 새 version
--     마이그레이션 + is_active 갱신.
--   - 법적 증빙은 terms_agreements.terms_version 문자열 스냅샷 + git 히스토리.
--
-- is_required / requires_consent 의미 (0044 헤더 기준):
--   service         — 가입 필수 동의
--   privacy_consent — 가입 필수 동의
--   privacy_policy  — 통지 문서(동의 대상 아님 → requires_consent=false)
--   location        — 가입 필수 동의
--   marketing       — 선택 동의(가입 필수 아님)

insert into public.terms
  (type, version, effective_date, content, is_required, requires_consent, is_active)
values
  ('service',         '1.0.0', '2026-05-28', '[]'::jsonb, true,  true,  true),
  ('privacy_consent', '1.0.0', '2026-05-28', '[]'::jsonb, true,  true,  true),
  ('privacy_policy',  '1.0.0', '2026-05-28', '[]'::jsonb, false, false, true),
  ('location',        '1.0.0', '2026-05-28', '[]'::jsonb, true,  true,  true),
  ('marketing',       '1.0.0', '2026-05-28', '[]'::jsonb, false, true,  true)
on conflict (type, version) do nothing;
