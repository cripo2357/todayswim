# P3 배포 체크리스트 (Supabase 인프라 적용)

P3 진행 중 추가된 마이그레이션·Edge Function 들의 **실 배포 상태 점검**.
크리스가 Supabase Studio 와 CLI 에서 한 번씩 확인·실행할 항목.

## 1. 마이그레이션 적용 상태

Supabase Studio > **Database > Migrations** 에서 적용 이력 확인.
또는 SQL Editor 에서:

```sql
select name, executed_at
  from supabase_migrations.schema_migrations
 order by executed_at desc
 limit 20;
```

### P3 추가 마이그레이션 (전부 적용돼야 함)

| 번호 | 파일 | 목적 |
|---|---|---|
| 0076 | `donation_thanks_message_tweak.sql` | 후원 알림 본문 톤 정정 |
| 0077 | `donation_default_message_random_pool.sql` | 디폴트 메시지 10개 풀 랜덤 |
| 0078 | `faqs_donation_addback.sql` | FAQ 후원 4건 복원 |
| 0079 | `terms_activate.sql` | 약관 5종 시드 (v1.0.0) |
| 0080 | `donation_totals_views.sql` | 후원 누적 집계 view |
| 0081 | `ops_stats_views.sql` | 운영 통계 view |
| 0081 | `rls_hardening_p3.sql` | notifications.select 본인만, avatars 본인 폴더만 |
| 0082 | `push_tokens.sql` | OS 푸시 토큰 보관 + RLS 본인 행만 |
| 0083 | `usage_cohort_views.sql` | 사용자 코호트 view |
| 0084 | `user_tombstones_cleanup.sql` | 탈퇴 후 90일 자동 파기 (pg_cron) |
| 0085 | `notifications_realtime.sql` | notifications realtime 활성 |
| 0086 | `scheduled_triggers.sql` | 시간 기반 cron 트리거 3종 |
| 0087 | `notifications_push_trigger.sql` | system 인서트 시 자동 OS 푸시 (pg_net) |

### 0087 추가 설정 — pg_net push 자동화 활성

0087 trigger 가 작동하려면 Supabase Studio SQL Editor 에서 1회:

```sql
alter database postgres
  set "app.settings.supabase_url" = 'https://<project>.supabase.co';
alter database postgres
  set "app.settings.service_role_key" = '<service_role_key>';
```

미설정 시 trigger silent skip — system 인서트(cron 등)는 in-app realtime
으로만 인지 (백그라운드 OS 푸시 X). 설정 후엔 cron 발화 알림도 자동 푸시.

⚠️ **번호 충돌**: 0081 이 2개 (`ops_stats_views` + `rls_hardening_p3`). 두 파일
독립적이라 둘 다 적용 OK. Supabase 가 알파벳 순으로 ops → rls 적용.

### 적용 안 됐을 때

Supabase CLI 사용:
```bash
npx supabase db push
```

또는 Studio SQL Editor 에서 빠진 파일 내용을 직접 붙여넣어 실행.

## 2. Edge Function 배포

`supabase/functions/` 하위 3종 모두 배포 필요.

```bash
npx supabase functions deploy delete-account
npx supabase functions deploy send-push
# geocode 는 운영자 전용 스크립트라 배포 필요 시 별도
```

### 배포 후 확인

```bash
npx supabase functions list
```

각 함수 status `ACTIVE` 인지 확인. 또는 Studio > **Edge Functions** 탭에서 시각
확인.

### 환경변수

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` 는 Supabase 가
자동 주입 — 별도 설정 불필요. 나머지(NAVER, SENTRY 등)는 함수별로:

```bash
npx supabase secrets list
```

## 3. 호스트 환경 (EAS) env 변수

EAS Dashboard > Project Settings > Environment variables (production / preview /
development 3환경 모두 등록):

| 변수 | 출처 | 비고 |
|---|---|---|
| `EXPO_PUBLIC_NAVER_MAP_CLIENT_ID` | Naver Cloud Console | 번들ID 제한 |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Google Cloud Console (Web client) | Google idToken |
| `EXPO_PUBLIC_SENTRY_DSN` | sentry.io 프로젝트 생성 후 | 출시 전 필수 |
| `EXPO_PUBLIC_EAS_PROJECT_ID` | app.config.extra.eas.projectId (이미 박힘) | expo-notifications 토큰 발급용 |
| `GOOGLE_IOS_URL_SCHEME` | Google Cloud iOS client (reversed) | iOS 빌드 전 |

## 4. Supabase Auth 설정 (Studio)

Studio > **Authentication > Providers**:

- **Google** ✅ provider 활성 + Web Client ID + Secret 입력
- **Kakao** ✅ provider 활성 + REST API Key + Secret 입력
- **Apple** — 현재 mock, 출시 시점 정식 등록 (B1 Apple Dev 후)

Authentication > **URL Configuration**:
- Site URL: `https://cripo2357.github.io/todayswim/`
- Redirect URLs: `poolsday://auth/callback`

## 5. Storage 정책 확인

Studio > **Storage**:

- `avatars` 버킷 존재 ✓
- public read = on
- 0081 RLS 하드닝 적용 후 본인 폴더만 write
- `pool-photos` 버킷 (운영자 수동 생성, public, 풀 사진용)

## 6. Realtime / Webhooks (P3 outside scope)

현재 미사용. 추후 P3 후속 (realtime notifications, pg_cron 등) 진입 시 활성화.

---

## 한 번에 점검하는 방법

각 항목 옆 ✓/✗ 표시하면서 한 줄씩 체크:

- [ ] 마이그레이션 0076 ~ 0083 전부 적용
- [ ] Edge Functions 3종 (delete-account / send-push / geocode) 배포
- [ ] EAS env 5종 등록 (3환경 × 5변수 = 15 entry)
- [ ] Supabase Auth Google/Kakao provider 키 등록
- [ ] Storage avatars 버킷 + 정책 정상

---

*Last updated: 2026-05-22 by P3 마무리 점검*
