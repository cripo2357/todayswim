// Pool's day — Sentry 에러·크래시 리포팅 초기화 (P3-A6, 2026-05-21).
//
// DSN 은 EXPO_PUBLIC_SENTRY_DSN env (없으면 init 자체 no-op — JS 에러 발생
// 시 콘솔만 찍힘). EAS env 와 로컬 .env 양쪽에 동일 변수명 설정.
//
// 활성화 순서:
//   1. sentry.io 에서 프로젝트 생성(React Native, platform 'react-native')
//   2. DSN 복사 → 로컬 .env 의 EXPO_PUBLIC_SENTRY_DSN= 에 박음
//   3. EAS Dashboard > Project Settings > Environment variables 에
//      EXPO_PUBLIC_SENTRY_DSN 동일 값 등록 (production / preview / development
//      세 환경 모두)
//   4. 다음 EAS 빌드 — JS·네이티브 양쪽 활성화
//
// JS 에러: init 직후부터 fetch 로 보고됨(빌드 안 해도 동작).
// 네이티브 크래시(NDK/Obj-C): 다음 EAS 빌드 후 활성화.
//
// 민감정보 정책:
//   - 자동 PII 수집(IP·사용자명) → 비활성 (sendDefaultPii: false)
//   - 메시지 본문(notifications.body 등) 은 텍스트 자체가 알림 문구라 OK,
//     하지만 카드 화면에 박힌 닉네임은 PII 라 beforeSend 에서 마스킹 검토.
//   - 약관 위반 데이터(예: 비공개 후원 메시지)는 코드에서 absorb 되어
//     Sentry 까지 안 도달.

import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

const DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;

let initialized = false;

/** 앱 시동 시 1회 호출. DSN 없으면 no-op. */
export function initSentry(): void {
  if (initialized) return;
  if (!DSN) {
    // DSN 미설정 — JS 에러는 콘솔에만, Sentry 미전송. 출시 전 EAS env 등록 필수.
    return;
  }
  Sentry.init({
    dsn: DSN,
    // 자동 세션 추적 — 앱 사용 시간/충돌률 산정.
    enableAutoSessionTracking: true,
    // 자동 PII 수집 차단. 필요 정보는 setUser 로 명시 등록.
    sendDefaultPii: false,
    // 환경 — Constants.expoConfig.extra 의 release channel 또는
    // app.config 의 version 으로 분기 가능. 단순화: 빌드 타입만.
    environment: __DEV__ ? 'development' : 'production',
    release: Constants.expoConfig?.version ?? 'unknown',
    // 트레이싱(transactions·spans) 은 우선 비활성 — 출시 후 필요 시 활성.
    tracesSampleRate: 0,
  });
  initialized = true;
}

/** 명시적 에러 보고 — try/catch 분기에서 호출. */
export function captureError(err: unknown, context?: Record<string, unknown>): void {
  if (!DSN) {
    if (__DEV__) console.error('[sentry no-dsn]', err, context);
    return;
  }
  Sentry.captureException(err, context ? { extra: context } : undefined);
}

/** ErrorBoundary 등에서 사용 — Sentry SDK 의 ErrorBoundary 컴포넌트 재export. */
export const SentryErrorBoundary = Sentry.ErrorBoundary;

/** 사용자 식별 (로그인 후) — auth.uid 만 박고 닉네임/이메일 PII 는 보내지 않음. */
export function setSentryUser(authUid: string | null): void {
  if (!DSN) return;
  if (authUid) Sentry.setUser({ id: authUid });
  else Sentry.setUser(null);
}
