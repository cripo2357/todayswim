# P3 외부 콘솔 체크리스트 — D-U-N-S 대기 동안 진행 가능

D-U-N-S 발급 (영업일 5-14일) 대기 동안 외부 콘솔 작업 정리.
크리스가 직접 진행. 코드 변경 X.

---

## 1. Sentry 프로젝트 + DSN 등록 (5분)

크래시·에러 리포팅. **출시 직전 활성화 가능** — 우선순위 중간.

### 단계

1. https://sentry.io/signup/ (계정 없으면) 또는 https://sentry.io/login/
2. GitHub / Google OAuth 로 가입
3. **+ Create Project**:
   - Platform: **React Native**
   - Alert frequency: 기본 (Alert me on every new issue)
   - Project name: `poolsday`
4. 생성 후 첫 화면에 **DSN** 박혀있어:
   ```
   https://<key>@<org>.ingest.sentry.io/<project-id>
   ```
   메모장에 복사. ⚠️ 채팅에 붙이지 마.

### EAS env 등록

EAS Dashboard > Environment variables > **+ Create**:

| Name | Value | Environment |
|---|---|---|
| `EXPO_PUBLIC_SENTRY_DSN` | DSN 값 (4번에서 복사) | production (선택) |

또는 dev/preview 도 등록하면 dev 빌드도 Sentry 활성. 우선 production 만.

### 코드 복원

app.config.ts 에서 plugin 한 줄 복원:

```ts
// Sentry 에러·크래시 리포팅 (P3-A6). DSN 등록 후 활성.
'@sentry/react-native/expo',
```

(현재 임시 제거 상태. commit `d94935c` 참조.)

### 다음 빌드 자동 활성

EAS prod 빌드 시 DSN env 변수 inline → runtime Sentry init 자동 활성.

### 사업자 정보 등록

sentry.io > Settings > **Subscription** 또는 **Billing**:
- Business name: CRIPO
- Tax ID: 379-13-02772

(Free tier 5K events/mo 라 결제 0 이지만 등록해두면 향후 Pro 전환 시 자동 사업자 영수증.)

---

## 2. SaaS 사업자 정보 등록 (각 5분)

이미 결제 중인 SaaS 들에 **사업자 정보 등록** → 한국 부가세 면제 + 사업자 영수증 + 한국 회계처리 가능.

### 공통 입력값

| 필드 | 값 |
|---|---|
| Business name | **CRIPO** |
| Country | **South Korea** |
| Tax ID / VAT number / Business registration number | **379-13-02772** |
| Address | 경기도 화성시 병점구 효행로 1068, 604호 |
| Email | cripo2357@gmail.com |

### 서비스별 등록 위치

| 서비스 | 등록 메뉴 | 비고 |
|---|---|---|
| **Anthropic (Claude)** | claude.ai → Settings > **Billing** > Manage subscription → Edit billing info | Pro/Max/Team/API |
| | console.anthropic.com → Billing > **Tax info** | API 별도 |
| **Figma** | Settings → Plans → **Billing** → Edit billing information → "I'm a business" toggle ON | |
| **Expo / EAS** | expo.dev → Account Settings → **Billing** → Tax info | |
| **GitHub** | github.com → Settings → **Billing** → Payment information → Edit company info | |
| **Naver Cloud Platform** | console.ncloud.com → 마이페이지 > **결제관리** > 사업자 정보 | 한국 사업자라 사업자등록증 직접 등록 |
| **Google Cloud** | console.cloud.google.com → 결제 > **결제 프로필 관리** | OAuth client 결제 무관, Cloud 사용 시만 필요 |
| **Supabase** | dashboard.supabase.com → Organization → **Billing** → Update billing | Free tier 라 미필요, 향후 Pro 전환 시 |
| **Sentry** | sentry.io → Settings → **Subscription** | 위 1번 참조 |

### 영수증 / 세금계산서

각 서비스마다 사업자 정보 등록 후 **과거 결제 영수증 재발급** 가능한지 확인:
- Figma / Anthropic / GitHub: 보통 등록 시점부터 사업자 영수증. 과거 분은 별도 요청 (지원 채널 통해)
- EAS: 동일

⚠️ 출시 전 1회 등록하면 향후 결제는 자동 사업자 영수증. **종합소득세 신고 시 비용 처리 가능** (5월 신고 기간 전 영수증 모아 회계사 또는 홈택스).

---

## 3. 스토어 자산 준비 (1-2시간, D-U-N-S 받기 전 가능)

Play Console / App Store Connect 의 스토어 등록정보 페이지에 업로드할 시각 자산:

### Google Play

| 자산 | 사양 | 비고 |
|---|---|---|
| **앱 아이콘** | 512×512 PNG, 32-bit | `assets/icon.png` 가공 (1024 → 512) |
| **그래픽 이미지 (Feature graphic)** | 1024×500 PNG/JPG | 새로 만들어야 — 앱 메인 시각 (Pool's day 로고 + 지도 마커 등) |
| **스크린샷 (휴대전화)** | 최소 2장, 최대 8장. 16:9 또는 9:16, JPG/PNG, 320~3840 px | 실 디바이스 / 시뮬레이터에서 캡처. 핵심 화면: 지도·시간표·일정·친구 (4장 추천) |
| **스크린샷 (7" 태블릿)** | 선택 | 미제출 가능 |
| **스크린샷 (10" 태블릿)** | 선택 | |

### Apple App Store

| 자산 | 사양 | 비고 |
|---|---|---|
| **앱 아이콘** | 1024×1024 PNG, no alpha, no rounded corners | iOS 빌드 자동 처리 (assets/icon.png → 빌드 시 가공). App Store Connect 에 별도 업로드 필요 |
| **스크린샷 6.7"** | 1290×2796 px, JPG/PNG, max 5장 (iPhone 15 Pro Max) | 필수 |
| **스크린샷 6.5"** | 1242×2688 px | 선택 (6.7 만 있어도 OK) |
| **스크린샷 5.5"** | 1242×2208 px | iPhone 8 Plus — 점차 폐지, 안 만들어도 OK |
| **App Preview (동영상)** | 선택 | 출시 후 추가 가능 |

### 스크린샷 캡처 전략

핵심 화면 4장 추천:
1. **지도 + 풀 마커** (Pool's day 핵심 가치)
2. **시간표 화면** (자유수영 시간 정보)
3. **일정 추가 + 친구 초대** (소셜 기능)
4. **친구 목록 / 프로필** (커뮤니티)

각 스크린샷에 짧은 설명 텍스트 오버레이 추가 권장:
- "동네 자유수영장 한눈에"
- "시간표 · 요금 · 시설 정보"
- "친구와 함께 수영 일정 잡기"
- "프로필 · 공개범위 자유롭게"

도구: Figma / Sketch / Canva / Notion. 또는 그냥 캡처 + 작은 텍스트 추가.

---

## 4. dev keystore APK 검증 빌드 (선택, 30분)

prod env 변수로 dev keystore APK 빌드 → 디바이스 install → e2e 검증 (Play Console 등록 전).

```bash
# eas.json 에 preview profile production env 등록 (이미 있음)
# 또는 development profile production env 로 빌드

# 임시 검증용:
# eas.json 에 "production-apk" profile 추가 — APK 형식 + production env
```

또는 더 단순: development 빌드 (APK) + production env override.

이건 좀 복잡. 출시 직전 Play Console Internal Testing 으로 검증해도 충분.

---

## 우선순위

| 작업 | 우선순위 | 시간 |
|---|---|---|
| **2. SaaS 사업자 정보 등록** | 🔴 높음 (절세) | 30분 (전체) |
| **3. 스토어 자산 준비** (스크린샷 + 그래픽 이미지) | 🟡 중간 (출시 시점에 필요) | 1-2시간 |
| **1. Sentry 프로젝트** | 🟢 낮음 (출시 직전) | 5분 |
| **4. 검증 빌드** | 🟢 낮음 (Play Internal 로 대체) | 30분 |

[[business_registration_progress]] [[p3_pre_env_complete]] [[email_account_key]]
