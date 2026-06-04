// Pool's day — 분석(Analytics) 헬퍼 — 현재 no-op.
//
// Firebase Analytics 제거(2026-06-04): RNFirebase + 정적프레임워크 + New
// Architecture iOS 빌드 비호환(RCTBridgeModule 모듈 import 에러)으로 v1에서
// 분리. 호출부 API(initAnalytics/logScreen/logEvent/setAnalyticsEnabled)는
// 그대로 유지하되 모든 함수는 silent no-op. 추후 New-Arch 호환 분석 도구
// 도입 시 이 파일 내부만 교체하면 호출부는 변경 없이 동작.

export function initAnalytics(): void {
  // no-op (분석 미연동)
}

export async function logScreen(_screenName: string): Promise<void> {
  // no-op
}

export async function logEvent(
  _name: string,
  _params?: Record<string, string | number | boolean>,
): Promise<void> {
  // no-op
}

export function setAnalyticsEnabled(_enabled: boolean): void {
  // no-op
}
