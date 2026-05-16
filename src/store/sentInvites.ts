// 보낸 초대 추적 — 한 번 초대장을 보낸 친구는 같은 일정 슬롯에 재초대
// 불필요(계속 보낼 수 있으나 한 번이면 충분). 검색 대상에서 제외용.
// 백엔드 미연동(Phase1) — 메모리 보관(앱 재시작 시 초기화).

import { create } from 'zustand';

/** 슬롯 식별 키 (풀+날짜+시작/끝) */
export function inviteSlotKey(
  poolId: string,
  date: string,
  start: string,
  end: string,
): string {
  return `${poolId}|${date}|${start}|${end}`;
}

interface SentInvitesState {
  /** slotKey → 초대장 보낸 친구 id 목록 */
  bySlot: Record<string, string[]>;
  markInvited: (slotKey: string, friendIds: string[]) => void;
}

export const useSentInvites = create<SentInvitesState>((set) => ({
  bySlot: {},
  markInvited: (slotKey, friendIds) =>
    set((s) => {
      const prev = s.bySlot[slotKey] ?? [];
      const merged = Array.from(new Set([...prev, ...friendIds]));
      return { bySlot: { ...s.bySlot, [slotKey]: merged } };
    }),
}));
