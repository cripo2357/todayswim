// "1.2.3" 형식 dotted 버전 비교. 각 segment는 정수만 가정 (pre-release 무시).
// AppUpdateRequired 게이트에서 expo.version vs min_app_version 비교용.

export function isAppBelow(current: string, minimum: string): boolean {
  const a = current.split('.').map((n) => parseInt(n, 10) || 0);
  const b = minimum.split('.').map((n) => parseInt(n, 10) || 0);
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const x = a[i] ?? 0;
    const y = b[i] ?? 0;
    if (x < y) return true;
    if (x > y) return false;
  }
  return false;
}
