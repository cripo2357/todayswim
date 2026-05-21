# 출시 메타 (P3 / D)

App Store / Google Play 등록 준비 자산. 사업자 등록·도메인 확정 전에도
대부분 작업 가능 — 일부 메타 필드만 placeholder 로 표시.

## 파일

| | 항목 | 상태 |
|---|---|---|
| [D1](D1-screenshot-checklist.md) | 스크린샷 캡쳐 체크리스트 (8장 + 사이즈) | 📝 가이드 작성 — 실제 캡쳐는 빌드 안정화 후 |
| [D2](D2-privacy-manifest.md) | iOS Privacy Manifest 근거 + 적용 코드 | ✅ `app.config.ts` 적용 — 다음 EAS 빌드에 포함 |
| [D3](D3-icon-splash-audit.md) | 아이콘·스플래시 자산 현황 + 보완 항목 | ⚠️ adaptive-icon / splash 설정 미적용 |
| [D4](D4-store-description.md) | 한/영 description, 키워드, Release Notes, 카테고리 | ✅ 본문 작성 — 사업자 정보만 placeholder |

## 사업자 등록 후 채울 항목

- D4 의 Developer Name / 사업자등록번호
- D4 의 Privacy URL / Support URL (도메인 확정 후)
- 약관 5종 (`docs/terms/`) 의 [사업자 정보] placeholder
- App Store Connect 의 App Review Contact

## 다음 단계 순서

1. **지금**: D2 적용 완료, D4 본문 검토 / 영문 카피 다듬기
2. **빌드 단계**: D3 보완 (adaptive-icon export + splash 플러그인 설정)
3. **앱 안정화 후**: D1 실제 캡쳐 8장
4. **사업자 등록 + 도메인 후**: D4 메타 필드 채우고 최종 검토
