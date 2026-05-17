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

/** 프로필 칩 라벨 — "매주 {요일}요일 {오전/오후 h:MM}" (시작 시각 기준) */
export function formatClassChip(c: SwimClass): string {
  return `매주 ${c.day}요일 ${to12h(c.start)}`;
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
