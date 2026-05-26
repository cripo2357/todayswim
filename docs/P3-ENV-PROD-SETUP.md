# P3 — env 분기 + prod Supabase 분리 가이드

목표: dev (현재) / prod (출시용) 두 환경 분리. 코드 변경 최소화, **EAS env 변수만 환경별 다르게 등록**.

## 0. 코드 상태

코드는 환경별 분기 없이 동일 변수 (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` 등) 를 읽는다. EAS Dashboard 의 `development` / `production` 환경에 각자 다른 값을 등록하면 빌드 시점에 올바른 값이 번들 인라인됨.

- `__DEV__` 글로벌은 React Native 빌드 모드를 자동 감지 (`development` 빌드면 true, `production` 빌드면 false). 이미 [sentry.ts](src/lib/sentry.ts), [analytics.ts](src/lib/analytics.ts) 등에서 활용.

## 1. prod Supabase 프로젝트 생성

[https://supabase.com/dashboard](https://supabase.com/dashboard) → **New project**.

- 이름: `poolsday-prod` (또는 원하는 이름)
- Region: **Northeast Asia (Seoul, ap-northeast-2)** — dev 와 동일, 데이터 국내 보관 ([[location_privacy_policy]])
- DB password: 강한 비밀번호 (저장 필수, 잃으면 복구 불가)
- Pricing: Free tier 시작 (출시 후 트래픽 따라 Pro)

생성 후 5-10분 프로비저닝. 완료되면 **Project Settings → API** 에서:
- **Project URL** 복사
- **anon public** key 복사
- **service_role** key 도 보관 (Edge Functions / 관리 작업용, 절대 클라이언트 배포 X)

## 2. 마이그레이션 적용 (0001 → 0092)

### CLI 방식 (권장)

```bash
# 새 prod 프로젝트 link
npx supabase link --project-ref <prod-project-ref>

# 마이그 일괄 적용
npx supabase db push
```

### Studio SQL Editor 방식 (대안)

CLI 가 안 되면 Studio > SQL Editor 에서 `supabase/migrations/*.sql` 을 알파벳 순으로 모두 실행. 0072 / 0073 / 0081 prefix 중복 정상 ([[P3-DEPLOY-CHECKLIST.md]] 참조).

### 0087 pg_net push 자동화 SQL (수동 1회)

prod URL / service_role key 로:

```sql
alter database postgres
  set "app.settings.supabase_url" = 'https://<prod-project-ref>.supabase.co';
alter database postgres
  set "app.settings.service_role_key" = '<prod_service_role_key>';
```

## 3. Edge Functions 배포

```bash
npx supabase functions deploy delete-account
npx supabase functions deploy send-push
# geocode 는 운영자 전용 — 필요 시 별도 배포
```

## 4. Auth Providers 설정

Studio > **Authentication → Providers**:

- **Google**: client ID + secret 입력 (prod OAuth client — 다음 단계)
- **Kakao**: REST API Key + secret (prod Kakao app — Kakao Developers Console)
- **Apple**: 비활성 (출시 후 등록)

**URL Configuration**:
- Site URL: `https://cripo2357.github.io/todayswim/`
- Redirect URLs: `poolsday://auth/callback`

## 5. Storage 초기화

Studio > **Storage**:

- `avatars` 버킷 생성 (public read, RLS write 본인 폴더만 — 0081 가 적용)
- `pool-photos` 버킷 생성 (public read)

`pool-photos/` 에 dev Supabase 에서 모든 풀 사진 다운로드 → prod 에 재업로드. 운영자가 직접:

```bash
# dev Supabase Storage 다운로드
npx supabase storage cp --recursive supabase://pool-photos ./pool-photos-backup

# prod 로 업로드
npx supabase --project-ref <prod-ref> storage cp --recursive ./pool-photos-backup supabase://pool-photos
```

## 6. EAS env 변수 등록

EAS Dashboard > **Project Settings → Environment variables**.

| 변수 | development | production |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | dev URL | **prod URL** |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | dev anon | **prod anon** |
| `EXPO_PUBLIC_NAVER_MAP_CLIENT_ID` | 동일 | 동일 |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | dev OAuth client | **prod OAuth client** |
| `EXPO_PUBLIC_SENTRY_DSN` | dev project DSN | **prod project DSN** (분리 권장) |
| `EXPO_PUBLIC_EAS_PROJECT_ID` | 동일 | 동일 |
| `GOOGLE_IOS_URL_SCHEME` | dev iOS client reversed | **prod iOS client reversed** |
| `KAKAO_REST_KEY` | dev Kakao | **prod Kakao** (server only) |
| `GOOGLE_SERVICES_JSON` | dev Firebase Android | **prod Firebase Android** (file path) |
| `GOOGLE_SERVICES_PLIST` | dev Firebase iOS | **prod Firebase iOS** (file path) |

→ EAS 빌드 시 환경(`--profile production` / `--profile development`)에 맞는 값이 자동 주입.

## 7. OAuth production 콘솔 분리

### Google Cloud Console

dev 와 별도 OAuth 2.0 Client 생성:
- **Web client** (Android / Supabase Google provider): `<prod-name>-web`
- **iOS client**: `<prod-name>-ios` (Bundle ID = `com.cripo.poolsday`)
- prod SHA-1 등록 — `eas credentials -p android --profile production` 으로 EAS keystore SHA-1 확인 후 등록

### Kakao Developers

dev 와 별도 앱 생성:
- 앱 이름: `Pool's day (prod)`
- Native App Key + REST API Key 발급
- Redirect URI: `poolsday://auth/callback`
- 이메일 동의 항목 활성 (비즈 인증 후, [[email_account_key]])

## 8. Sentry production 프로젝트

[sentry.io](https://sentry.io) > New project (React Native, name = `poolsday-prod`):
- DSN 복사 → EAS env `EXPO_PUBLIC_SENTRY_DSN` (production) 등록

## 9. EAS production 빌드

```bash
# build profile 은 eas.json 에 정의 (development / preview / production)
EXPO_TOKEN=<your-pat> npx eas-cli build --platform all --profile production
```

빌드 후:
- 1 회 install → 실제 동작 검증 (로그인·일정·푸시 알림 e2e)
- prod Supabase 데이터 정상 조회·기록 확인
- Sentry prod project 로 이벤트 도달 확인

## 10. 스토어 제출

- Android: Play Console 등록 + EAS submit → review (1-3일)
- iOS: Apple Dev 등록 (2026-05-21~) 필요, 등록 후 EAS submit → review (1-2주)

## 검증 체크리스트

prod 환경 정상 동작 검증:

- [ ] dev Supabase 변경 → prod 영향 0 (격리 확인)
- [ ] prod 로그인 (Google / Kakao) 정상
- [ ] 풀 마커 / 시간표 표시 정상
- [ ] 일정 추가 / 친구 요청 / 알림 발송 e2e
- [ ] Sentry dashboard 에 prod 이벤트 도달
- [ ] Firebase Analytics console 에 prod 이벤트 도달
- [ ] 회원 탈퇴 → tombstone 적재 → 90일 cleanup cron 확인 (Studio)

## 위험·롤백

- **마이그 실패**: 새 prod 프로젝트라 데이터 영향 없음 → 프로젝트 삭제 후 재생성
- **OAuth 설정 오류**: Provider 콘솔에서 클라이언트 갱신, 5분 propagation 대기
- **EAS 빌드 실패**: env 변수 누락이 가장 흔함 — Dashboard 에서 production 환경 확인

[[business_registration_progress]] 완료 시 약관 placeholder 채우고 v1.0.2 bump 후 출시.
