// 수영 수업 시간 표시·생성 헬퍼. SwimClass 타입은 store/profile에 정의.
// 목적: 친구 초대 시 프로필에서 참고용(정보 전용). 시스템 연동 없음.

import type { DayOfWeek } from '@/types/schedule';
import type { SwimClass } from '@/store/profile';

/** 요일 정렬 순서 (월~일) */
export const DAY_ORDER: DayOfWeek[] = ['월', '화', '수', '목', '금', '토', '일'];

export function genSwimClassId(): string {
  return `sc-${Date.now()}-${Math.floor(Math.random() * 1e4)}`;
}

/** "HH:MM" → "오전/오후 h:MM" (12h 한국식). 00시=오전 12시, 12시=오후 12시 */
export function to12h(hhmm: string): string {
  const [hStr, mStr] = hhmm.split(':');
  const h = Number(hStr);
  const ampm = h < 12 ? '오전' : '오후';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${ampm} ${h12}:${mStr}`;
}

/** 등록 화면 알약 라벨 — "HH:MM ~ HH:MM" (24h 그대로) */
export function formatTimeRange(c: Pick<SwimClass, 'start' | 'end'>): string {
  return `${c.start} ~ ${c.end}`;
}

/** 프로필 칩 라벨 — "{요일}요일 {오전/오후 h:MM}" (시작 시각 기준) */
export function formatClassChip(c: SwimClass): string {
  return `${c.day}요일 ${to12h(c.start)}`;
}

// 요일 → JS Date.getDay() (일=0..토=6)
const DOW_JS: Record<DayOfWeek, number> = {
  일: 0, 월: 1, 화: 2, 수: 3, 목: 4, 금: 5, 토: 6,
};

/**
 * 주간 반복 레슨의 "지금 기준 가장 가까운 회차" 절대시각(ms).
 * 이번 주 해당 요일 회차를 만들고, 이미 종료됐으면 다음 주 회차로.
 * 지도 stack 노출창 now∈[start-24h, end] 판정·최임박 비교에 사용.
 */
export function lessonOccurrenceMs(
  day: DayOfWeek,
  start: string,
  end: string,
  now: number = Date.now(),
): { startMs: number; endMs: number } {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const base = new Date(now);
  const d0 = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  const delta = (DOW_JS[day] - d0.getDay() + 7) % 7; // 0=오늘 .. 6
  const mk = (addDays: number) => {
    const s = new Date(d0);
    s.setDate(d0.getDate() + addDays);
    s.setHours(sh, sm, 0, 0);
    const e = new Date(d0);
    e.setDate(d0.getDate() + addDays);
    e.setHours(eh, em, 0, 0);
    return { startMs: s.getTime(), endMs: e.getTime() };
  };
  const occ = mk(delta);
  // 이번 주 회차가 이미 끝났으면 다음 주 회차.
  return occ.endMs < now ? mk(delta + 7) : occ;
}

/** 요일별로 그룹핑 (DAY_ORDER 순). 각 요일 배열은 시작시각 오름차순. */
export function groupByDay(
  classes: SwimClass[],
): Record<DayOfWeek, SwimClass[]> {
  const out = {} as Record<DayOfWeek, SwimClass[]>;
  for (const d of DAY_ORDER) out[d] = [];
  for (const c of classes) {
    if (out[c.day]) out[c.day].push(c);
  }
  for (const d of DAY_ORDER) {
    out[d].sort((a, b) => a.start.localeCompare(b.start));
  }
  return out;
}
