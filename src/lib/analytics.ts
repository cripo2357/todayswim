// Pool's day — Firebase Analytics 초기화·이벤트 로깅 헬퍼.
//
// 익명 통계 수집(앱 사용 빈도/화면 진입/핵심 액션). PII 와 GPS 위치는 보내지
// 않음 — `location_privacy_policy` 메모리 톤 유지. `user_id` 도 매칭 안 함
// (마케팅 동의자 한정으로 향후 setUserId 옵션은 추후 별도 결정).
//
// 활성화 순서:
//   1. Firebase 콘솔에서 프로젝트 생성 (https://console.firebase.google.com)
//   2. iOS 앱 등록: bundle ID = com.cripo.poolsday → GoogleService-Info.plist 다운
//      → 프로젝트 루트(c:/poolsday/)에 배치
//   3. Android 앱 등록: package = com.cripo.poolsday → google-services.json 다운
//      → 프로젝트 루트에 배치
//   4. `npm install` (package.json 에 추가된 @react-native-firebase/* 설치)
//   5. 다음 EAS 빌드 — 네이티브 통합 활성화
//
// config 파일이 없거나 패키지가 미설치된 환경(예: Expo Go) 에서는 모든
// 함수가 silent no-op 으로 작동. Sentry 와 동일 패턴.

let analyticsModule: typeof import('@react-native-firebase/analytics').default | null = null;
let initialized = false;

function loadAnalyticsModule(): typeof import('@react-native-firebase/analytics').default | null {
  if (analyticsModule !== null) return analyticsModule;
  try {
    // 동적 require — Expo Go 등 네이티브 모듈 미로딩 환경에서 import 실패해도
    // 앱 부팅을 망치지 않음.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('@react-native-firebase/analytics');
    analyticsModule = mod.default ?? mod;
    return analyticsModule;
  } catch {
    return null;
  }
}

export function initAnalytics(): void {
  if (initialized) return;
  const analytics = loadAnalyticsModule();
  if (!analytics) return;
  try {
    // 기본은 enabled — Firebase 자체가 익명 app_instance_id 만 사용.
    // 사용자 본인 식별(user_id) 매칭은 setUserId 호출 시점에 명시(현재 안 함).
    void analytics().setAnalyticsCollectionEnabled(true);
    initialized = true;
  } catch {
    // native module 미준비 — config 파일 없는 빌드 등.
  }
}

export async function logScreen(screenName: string): Promise<void> {
  const analytics = loadAnalyticsModule();
  if (!analytics) return;
  try {
    await analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenName,
    });
  } catch {
    // 무시.
  }
}

export async function logEvent(
  name: string,
  params?: Record<string, string | number | boolean>,
): Promise<void> {
  const analytics = loadAnalyticsModule();
  if (!analytics) return;
  try {
    await analytics().logEvent(name, params);
  } catch {
    // 무시.
  }
}

export function setAnalyticsEnabled(enabled: boolean): void {
  const analytics = loadAnalyticsModule();
  if (!analytics) return;
  try {
    void analytics().setAnalyticsCollectionEnabled(enabled);
  } catch {
    // 무시.
  }
}
