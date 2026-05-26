# 사업자 정보 입력 체크리스트

[[business_registration_progress]] 완료 시 (2026-05-21~ 진행 중) 아래 4개 파일의 placeholder 를 **확정값**으로 일괄 교체.

## 확정 후 채울 값

| 항목 | 확정값 |
|---|---|
| 상호 | CRIPO (이미 박힘) |
| 대표자 | 김은호 (이미 박힘) |
| 사업자등록번호 | `XXX-XX-XXXXX` |
| 사업장 주소 | (사업자등록 시 확정 주소) |
| 이메일 | cripo2357@gmail.com (이미 박힘) |

## 교체 대상 위치

### 1. 코드 (단일 출처)

**`src/lib/termsContent.ts:38-43`** — `BIZ_INFO` 상수
- 한 번만 수정하면 service / privacyPolicy / location 약관 화면 3종에 모두 반영됨.

```ts
const BIZ_INFO =
  `· 상호: CRIPO\n` +
  `· 대표자: 김은호\n` +
  `· 사업자등록번호: [사업자등록 완료 후 기재 — 정식 출시(앱스토어 배포) 전 기재 예정]\n` +  // ← 교체
  `· 사업장 주소: [사업자등록 시 확정 — 정식 출시 전 기재 예정]\n` +                       // ← 교체
  `· 이메일: cripo2357@gmail.com`;
```

### 2. 약관 원본 docs (각 별도 — 코드와 동기 필요)

| 파일 | 라인 | 항목 |
|---|---|---|
| `docs/terms/service-terms.md` | 205-206 | 사업자등록번호 / 사업장 주소 |
| `docs/terms/privacy-policy.md` | 213-214 | 사업자등록번호 / 사업장 주소 |
| `docs/terms/location-terms.md` | 86-87 | 사업자등록번호 / 사업장 주소 |

각 파일 동일 placeholder 라 검색·치환 가능:
```
[사업자등록 완료 후 기재 — 정식 출시(앱스토어 배포) 전 기재 예정] → <등록번호>
[사업자등록 시 확정 — 정식 출시 전 기재 예정]                      → <주소>
```

### 3. 영향 없는 파일 (placeholder 없음 — 확인 완료)

- `docs/terms/privacy-consent.md` — 동의 항목만, 사업자 정보 미수록
- `docs/terms/marketing-consent.md` — 동의 항목만, 사업자 정보 미수록

## 검증 명령

```bash
# 등록 완료 후, 잔여 placeholder 가 0개인지 확인
grep -rn "사업자등록 완료 후 기재" src/ docs/terms/
grep -rn "사업자등록 시 확정" src/ docs/terms/
# 결과: 둘 다 0건이면 OK
```

## 출시 순서

1. 사업자등록증 발급 → 사업자등록번호 / 등록 주소 확정
2. 위 4개 파일 교체
3. `termsContent.ts` 의 `VERSION` 을 `v1.0.1` 로 bump (개정 알림 트리거)
4. `EFFECTIVE` 날짜 갱신
5. 약관 동의 마이그(`terms_agreements`) 사용자 재동의 트리거 (개정 알림 시스템 통해)
6. EAS production 빌드 + 스토어 제출

[[terms_docs_decisions]] [[business_registration_progress]]
