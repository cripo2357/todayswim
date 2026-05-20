// 앱 전반 날짜·시각 표시 단일 포맷 — v0.6 통일.
//
// 풀:    YY.MM.DD(요일) 오전/오후 H:MM    예) 26.05.20(수) 오후 1:00
// 날짜만: YY.MM.DD(요일)                  예) 26.05.20(수)
// 시간만: 오전/오후 H:MM                   예) 오후 1:00
//
// 시(hour)만 1~2자리 가변(1·12 모두 자연수 표기). 연·월·일·분은 전부 2자리.
// 모든 화면(알림·캘린더·시간표·일정 등)에서 본 모듈만 호출 — 직접 포맷 금지.

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function toDate(d: Date | string | number): Date {
  if (d instanceof Date) return d;
  if (typeof d === 'string') {
    // "YYYY-MM-DD" 형식은 로컬 자정으로 해석(UTC 자정 → 전날로 밀리는 버그 방지).
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
      const [y, m, dd] = d.split('-').map(Number);
      return new Date(y, m - 1, dd);
    }
  }
  return new Date(d);
}

const pad2 = (n: number) => String(n).padStart(2, '0');

/** YY.MM.DD(요일) — 날짜만. */
export function formatDate(d: Date | string | number): string {
  const date = toDate(d);
  const yy = pad2(date.getFullYear() % 100);
  const mm = pad2(date.getMonth() + 1);
  const dd = pad2(date.getDate());
  const w = WEEKDAYS[date.getDay()];
  return `${yy}.${mm}.${dd}(${w})`;
}

/** 오전/오후 H:MM — 시간만(시 1~2자리, 분 2자리). */
export function formatTime(d: Date | string | number): string {
  const date = toDate(d);
  return formatTimeHM(date.getHours(), date.getMinutes());
}

/** YY.MM.DD(요일) 오전/오후 H:MM — 풀. */
export function formatDateTime(d: Date | string | number): string {
  return `${formatDate(d)} ${formatTime(d)}`;
}

/** "HH:MM" 또는 "H:MM" 시간 문자열 → 오전/오후 H:MM. */
export function formatTimeHHMM(hhmm: string): string {
  const [hStr, mStr = '00'] = hhmm.split(':');
  return formatTimeHM(parseInt(hStr, 10), parseInt(mStr, 10));
}

/** 시·분 숫자 → 오전/오후 H:MM. */
export function formatTimeHM(hour24: number, minute: number): string {
  const ampm = hour24 < 12 ? '오전' : '오후';
  let h = hour24 % 12;
  if (h === 0) h = 12; // 0시 = 오전 12, 12시 = 오후 12
  return `${ampm} ${h}:${pad2(minute)}`;
}
