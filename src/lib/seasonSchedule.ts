// 시즌제(slot_groups) 운영 시간표 공유 로직 — ScheduleView(조회)와
// AddScheduleSheet(등록)가 "전환월" 정의를 동일하게 쓰도록 단일화.

import type { Schedule, DayOfWeek, TimeSlot, SlotGroup } from '@/types/schedule';

/** 모든 그룹에 months가 채워져 시즌 판별이 가능한가. */
function allHaveMonths(groups: SlotGroup[]): boolean {
  return groups.every(
    (g) => Array.isArray(g.months) && g.months.length > 0,
  );
}

/**
 * 전환 직전 달 여부 — 그 달 적용 그룹 ≠ 다음 달 적용 그룹(KBS=5월·9월).
 * months 불완전/판별 불가 시 false(전환 아님으로 취급, 안전).
 */
export function isSeasonTransitionMonth(
  groups: SlotGroup[] | undefined,
  month: number,
): boolean {
  if (!groups || groups.length === 0 || !allHaveMonths(groups)) return false;
  const next = (month % 12) + 1;
  const cur = groups.find((g) => g.months?.includes(month));
  const nxt = groups.find((g) => g.months?.includes(next));
  if (!cur) return false;
  return cur !== nxt;
}

/**
 * 그 달에 노출할 시즌 그룹 — 전환 직전 달이면 전체(미리보기),
 * 그 외엔 현재 시즌만. months 불완전하면 전체(하위호환).
 */
export function visibleSeasonGroups(
  groups: SlotGroup[] | undefined,
  month: number,
): SlotGroup[] | undefined {
  if (!groups || groups.length === 0 || !allHaveMonths(groups)) return groups;
  const cur = groups.find((g) => g.months?.includes(month));
  if (!cur) return groups;
  return isSeasonTransitionMonth(groups, month) ? groups : [cur];
}

/**
 * 선택 날짜에 맞는 슬롯 — slotGroups 있으면 그 달 포함 그룹,
 * 없으면 by_day flat(하위호환). months 없는 그룹은 기본 취급.
 */
export function resolveSeasonSlots(
  schedule: Schedule | undefined,
  dow: DayOfWeek,
  date: Date,
): TimeSlot[] {
  if (!schedule) return [];
  const groups = schedule.slotGroups?.[dow];
  if (groups && groups.length > 0) {
    const m = date.getMonth() + 1;
    const matched =
      groups.find((g) => g.months?.includes(m)) ??
      groups.find((g) => !g.months || g.months.length === 0) ??
      groups[0];
    return matched.slots;
  }
  return schedule.byDay[dow] ?? [];
}
