# Pool's day — App Store 제출 준비 (App Privacy / 처리방침 / 데모계정)

> 코드·약관 전수 조사 기반(2026-06-06). 입력은 App Store Connect / 콘솔에서.

---

## 1. App Privacy (앱이 수집하는 개인정보)

### 추적(Tracking): **아니오**
광고/추적 SDK 없음(Facebook·AdMob·Amplitude·Firebase Analytics 등 0개, ATT 불필요).
→ "Do you or your third-party partners use data for tracking?" = **No**.

### 수집 데이터 — 전부 "Linked to You(연결됨)", 용도=App Functionality, 추적 안 함

| Apple 데이터 유형 | 우리 항목 | 비고 |
|---|---|---|
| **Contact Info → Email Address** | 소셜 로그인 이메일(계정 키) | auth.users |
| **User Content → Photos or Videos** | 프로필 사진(photo_uri) | Storage |
| **User Content → Other User Content** | 닉네임·한줄소개(bio)·수영 일정·풀/시간표 제보·후원 메시지(입금자명) | profiles/submissions/donations |
| **Health & Fitness → Fitness** | 수영 기록(영법·IM100·자유수영 일정) | 수영=피트니스 활동 |
| **Identifiers → User ID** | auth_uid·친구코드 | |
| **Identifiers → Device ID** | 푸시 토큰(Expo)·active_device(기기 UUID) | push_tokens/profiles |
| **Diagnostics → Crash Data** | Sentry 크래시(사용자 ID 포함, PII 없음) | ⚠️ **DSN 등록 시에만** — 아래 주의 |
| **Other Data → Other Data Types** | 성별·생년월일 | 애플에 인구통계 카테고리 없음 → Other |

각 항목 플로우: **수집함 → Linked: 예 → Used for Tracking: 아니오 → Purpose: App Functionality** (Crash Data는 App Functionality 또는 Analytics).

### 수집 안 함(Not Collected)으로 선언
- **Location(정밀/대략)**: 기기 내 세션 메모리에서만 사용(거리순 정렬·지도 센터링), **서버/저장소 전송·영속화 안 함** → Apple 정의상 "collect"(off-device 전송) 아님 → **선언 X**. (location 이용약관과 일치)
- **Financial Info / Purchases**: 후원은 **외부 은행 계좌이체** — 앱이 카드/결제정보 수집 안 함 → 선언 X. (입금자명은 위 User Content)
- **Usage Data / Analytics**: Firebase Analytics 제거됨(logEvent=no-op) → 선언 X.

### ⚠️ 출시 전 확인
- **Sentry DSN**: EAS env에 `SENTRY_DSN` 등록돼 있으면 Crash Data 실제 수집 → 위 표대로 선언. 미등록이면 크래시 미전송 → Crash Data 빼도 됨. **출시 땐 보통 켜니 선언 권장.**

---

## 2. 개인정보 처리방침 URL (호스팅)

문서: `docs/terms/privacy-policy.md` (존재). 웹에 공개 URL로 올려야 제출 가능(도메인 없음).

### 호스팅 옵션
1. **Notion (추천 — 5분, 무료)**: 새 페이지 → privacy-policy.md 내용 붙여넣기 → 우상단 **공유 → 웹에 게시** → 공개 URL 복사 → App Store Connect "개인정보 처리방침 URL"에 입력.
2. **GitHub Pages**: repo가 **public**이어야 무료(현재 todayswim repo 공개여부 확인). private면 Pro 필요.
3. **Vercel/Netlify**: HTML 올리면 URL.

### ⚠️ 문서 내용 검증 (제출 전 필수)
- 사업자 정보(상호 **CRIPO**, 사업자번호 379-13-02772, 대표·주소·연락처), 시행일이 **실제 값**으로 채워졌는지 확인. (과거 placeholder 였던 이력 있음 — terms_docs_decisions)
- 5개 약관(service/privacy-policy/privacy-consent/marketing-consent/location)이 앱 내 표시본과 일치하는지.

---

## 3. 데모 계정 전략 (소셜 로그인 전용 앱)

### 핵심: **Sign in with Apple 구현됨 → 데모 계정 거의 불필요**
애플 리뷰어는 본인 Apple ID로 "Apple로 로그인"하면 됨. App Review Information에 명시:

> This app uses social login only (Sign in with Apple / Google / Kakao). Please sign in using **"Sign in with Apple"** with your own Apple ID — no demo account is required. After signing in, complete a short profile setup (nickname, gender, birth date) to access all features.

### 반려 방지 한 줄 (중요)
로그인 직후 **프로필 설정(닉네임 등)** 화면이 뜨므로, 위처럼 "After sign-in, complete a short profile setup" 안내를 꼭 넣어야 리뷰어가 막히지 않음.

### 추가 안전장치(선택)
전용 테스트 Apple ID 하나 만들어 자격증명을 App Review Information에 적어두면 더 확실(리뷰어가 자기 ID 쓰기 꺼릴 때 대비).

---

## 남은 ❗ 제출 차단 항목 요약
- [ ] App Privacy 입력(위 1번) — 미입력 시 제출 버튼 비활성
- [ ] 처리방침 URL(위 2번) — 실제 접속되는 URL
- [ ] 데모 계정/리뷰 안내(위 3번)
- [ ] 스크린샷 크기 통일
- [ ] (리스크) 후원 외부결제 — IAP 미사용, 반려 가능성 인지
