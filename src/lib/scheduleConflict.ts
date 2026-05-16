// 수영 일정 등록 충돌 판정 — 시간표(ScheduleView)·등록 시트(AddScheduleSheet)
// 공용. 정책:
//  1) duplicate: 같은 풀·날짜·시작·끝이 이미 등록됨 → "이미 등록한 일정"
//  2) overlap:   같은 날짜의 다른 일정과 시간대가 겹침(맞닿음 제외)
//                → "다른 일정과 중복" (다른 수영장 동시간 등록 방지)
// 충돌 슬롯은 선택/등록 불가 + 5초 툴팁으로 안내.

import type { MySwimSchedule } from '@/store/swimSchedule';

export type SlotConflict = 'duplicate' | 'overlap' | null;

export const CONFLICT_LABEL: Record<'duplicate' | 'overlap', string> = {
  duplicate: '이미 등록한 일정',
  overlap: '다른 일정과 중복',
};

function toMin(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export interface SlotCandidate {
  poolId: string;
  date: string; // YYYY-MM-DD
  start: string; // "09:00"
  end: string; // "11:00"
}

/**
 * 후보 슬롯이 내 기존 일정과 충돌하는지. duplicate 우선 판정.
 * 시간 겹침은 strict (12:00~13:00 과 13:00~14:00 은 안 겹침).
 */
export function slotConflict(
  schedules: MySwimSchedule[],
  cand: SlotCandidate,
): SlotConflict {
  const sameDay = schedules.filter((s) => s.date === cand.date);
  if (
    sameDay.some(
      (s) =>
        s.poolId === cand.poolId &&
        s.start === cand.start &&
        s.end === cand.end,
    )
  ) {
    return 'duplicate';
  }
  const cs = toMin(cand.start);
  const ce = toMin(cand.end);
  const overlap = sameDay.some((s) => {
    const ss = toMin(s.start);
    const se = toMin(s.end);
    return cs < se && ss < ce;
  });
  return overlap ? 'overlap' : null;
}
