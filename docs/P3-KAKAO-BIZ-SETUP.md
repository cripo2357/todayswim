# P3 — Kakao 비즈 앱 등록 가이드

목표: Kakao 로그인 활성화. Supabase GoTrue 가 `account_email` 을 강제 요청해서 **일반 앱**으로는 카카오 로그인 자체가 작동 안 함. **비즈 앱 등록 + 사업자 인증** 후 이메일 동의항목 활성 = 정상 동작.

## 현재 상태

- 사업자등록 완료 (2026-05-26, 등록번호 379-13-02772) ✅
- 코드: [src/store/auth.ts:197](src/store/auth.ts#L197) — `supabase.auth.signInWithOAuth({ provider: 'kakao' })` 이미 정확. **코드 변경 X**.
- 막힌 곳: Kakao Developers Console 의 앱이 **일반 앱** 이라 `account_email` 동의항목 미허용 → 로그인 콜백 시 `Invalid scope: account_email` 실패.

## 등록 절차 (외부 콘솔)

### 1. Kakao Developers 접속

https://developers.kakao.com/console/app

- 기존 dev 앱이 있으면 거기서 진행 OR
- prod 용 새 앱 생성 (Recommended — dev/prod 분리)

### 2. prod 앱 생성 (Recommended)

**내 애플리케이션 > 애플리케이션 추가하기**:
- 앱 이름: `Pool's day`
- 사업자명: `CRIPO`
- 카테고리: 스포츠

### 3. 비즈 앱 전환 신청 ⚠️ 핵심

**앱 설정 > 일반 > 비즈 앱 신청**:

1. **사업자 정보 입력**:
   - 상호: `CRIPO`
   - 대표자: `김은호`
   - 사업자등록번호: `379-13-02772`
   - 사업장 주소: `경기도 화성시 병점구 효행로 1068, 604호`
   - 업태/업종: (사업자등록증 기재 그대로)

2. **사업자등록증 파일 업로드** (PDF/이미지)

3. **신청 제출** → 카카오 검수 (영업일 1-3일 보통, 길면 1-2주)

### 4. 비즈 인증 완료 후 동의항목 활성화

**제품 설정 > 카카오 로그인 > 동의항목**:

| 항목 | 동의 단계 | 사유 |
|---|---|---|
| 닉네임 (`profile_nickname`) | 선택 동의 | 표시명 폴백 |
| 프로필 사진 (`profile_image`) | 선택 동의 | 아바타 폴백 |
| **카카오계정(이메일) (`account_email`)** | **필수 동의** | **Supabase 계정 key — 필수** |

⚠️ 이메일 항목은 비즈 인증 전엔 "필수 동의" 토글 불가 (회색 처리). 비즈 승인 직후 활성화.

### 5. 카카오 로그인 활성화

**제품 설정 > 카카오 로그인 > 활성화 ON**

**Redirect URI 등록**:
```
https://<supabase-project>.supabase.co/auth/v1/callback
```

(prod Supabase 프로젝트 생성 후 채울 값. 일단 dev 용 URI 등록 → prod 분리 시 추가)

### 6. 앱 키 발급 확인

**앱 설정 > 앱 키**:
- Native App Key (모바일 SDK 용 — 현재 코드는 미사용)
- REST API Key — **Supabase 등록 시 사용**
- JavaScript Key (웹 — 미사용)
- Admin Key (서버 운영 — 미사용)

**보안 > Client Secret** 발급:
- 보안 강화 위해 활성화 권장
- 발급한 Secret 도 Supabase 에 등록

### 7. Supabase Auth Provider 등록

Supabase Studio > **Authentication → Providers → Kakao**:

| 필드 | 값 |
|---|---|
| Enable | ON |
| Kakao Client ID | REST API Key (위 6번) |
| Kakao Client Secret | Secret (위 6번) |
| Callback URL | (자동 생성 — `https://<project>.supabase.co/auth/v1/callback`) — Kakao Developers Console Redirect URI 에 등록한 URL 과 일치 |

prod/dev Supabase 양쪽 모두 등록 (각 환경에 맞는 REST API Key).

## 검증

비즈 인증 + 동의항목 활성 + Supabase 등록 완료 후:

1. 앱에서 카카오 로그인 시도 → 카카오 동의 화면에 `카카오계정(이메일)` 항목 표시 확인
2. 로그인 완료 → `useProfile.profile?.email` 또는 `auth.user.email` 채워졌는지 확인
3. Supabase Studio > Authentication > Users → 카카오 로그인 사용자 행에 email 채워짐 확인

## 트러블슈팅

| 증상 | 원인 |
|---|---|
| `Invalid scope: account_email` | 비즈 인증 안 됨 또는 동의항목 미활성 |
| Redirect URI mismatch | Supabase Callback URL ≠ Kakao Console Redirect URI |
| 로그인 후 email 빈 값 | 동의항목이 "선택 동의" — "필수 동의" 로 변경 |
| 비즈 인증 거절 | 사업자등록증 흐림 / 정보 불일치 / 업종 부적합 — 카카오 안내 따라 재신청 |

[[email_account_key]] [[business_registration_progress]] [[oauth_login_progress]]
