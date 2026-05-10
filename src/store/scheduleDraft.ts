/**
 * 시간표 작성 4스텝 임시 상태.
 * (Splash → Map → 마커 탭 → "작성하기" → Nickname → Write → Time → Done)
 *
 * 메모리 only. 시작은 init(poolId)로, 종료/취소는 reset()으로.
 */
import { create } from 'zustand';
import type { ScheduleDraft, DayOfWeek, TimeSlot } from '@/types/schedule';

interface DraftState {
  draft: ScheduleDraft | null;
  init: (poolId: string) => void;
  setNickname: (nickname: string) => void;
  addTimeSlot: (day: DayOfWeek, slot: TimeSlot) => void;
  removeTimeSlot: (day: DayOfWeek, index: number) => void;
  reset: () => void;
}

const empty = (poolId: string): ScheduleDraft => ({
  poolId,
  byDay: {},
});

export const useScheduleDraft = create<DraftState>((set) => ({
  draft: null,

  init: (poolId) => set({ draft: empty(poolId) }),

  setNickname: (nickname) =>
    set((s) => (s.draft ? { draft: { ...s.draft, nickname } } : s)),

  addTimeSlot: (day, slot) =>
    set((s) => {
      if (!s.draft) return s;
      const existing = s.draft.byDay[day] ?? [];
      return {
        draft: {
          ...s.draft,
          byDay: { ...s.draft.byDay, [day]: [...existing, slot] },
        },
      };
    }),

  removeTimeSlot: (day, index) =>
    set((s) => {
      if (!s.draft) return s;
      const existing = s.draft.byDay[day] ?? [];
      return {
        draft: {
          ...s.draft,
          byDay: { ...s.draft.byDay, [day]: existing.filter((_, i) => i !== index) },
        },
      };
    }),

  reset: () => set({ draft: null }),
}));
