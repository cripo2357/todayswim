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
  /** 수정 제안 흐름 — 기존 시간표를 base로 draft 초기화 (사용자가 수정 시작점으로). */
  initFromSchedule: (
    poolId: string,
    base: { byDay: ScheduleDraft['byDay']; dayNotes?: ScheduleDraft['dayNotes'] },
  ) => void;
  setNickname: (nickname: string) => void;
  addTimeSlot: (day: DayOfWeek, slot: TimeSlot) => void;
  removeTimeSlot: (day: DayOfWeek, index: number) => void;
  setDayNote: (day: DayOfWeek, note: string) => void;
  reset: () => void;
}

const empty = (poolId: string): ScheduleDraft => ({
  poolId,
  byDay: {},
});

export const useScheduleDraft = create<DraftState>((set) => ({
  draft: null,

  init: (poolId) => set({ draft: empty(poolId) }),

  initFromSchedule: (poolId, base) => {
    // base.byDay 깊은 복사 — store 상태 mutation 방지 + 각 요일 슬롯도 새 배열로.
    const byDayCopy: ScheduleDraft['byDay'] = {};
    for (const [day, slots] of Object.entries(base.byDay) as [DayOfWeek, TimeSlot[]][]) {
      if (slots && slots.length > 0) {
        byDayCopy[day] = [...slots].sort((a, b) => a.start.localeCompare(b.start));
      }
    }
    const dayNotesCopy = base.dayNotes ? { ...base.dayNotes } : undefined;
    set({ draft: { poolId, byDay: byDayCopy, dayNotes: dayNotesCopy } });
  },

  setNickname: (nickname) =>
    set((s) => (s.draft ? { draft: { ...s.draft, nickname } } : s)),

  addTimeSlot: (day, slot) =>
    set((s) => {
      if (!s.draft) return s;
      const existing = s.draft.byDay[day] ?? [];
      // 시간 오름차순 유지 — "HH:MM" 문자열은 lexical 비교 = 시간순.
      const sorted = [...existing, slot].sort((a, b) => a.start.localeCompare(b.start));
      return {
        draft: {
          ...s.draft,
          byDay: { ...s.draft.byDay, [day]: sorted },
        },
      };
    }),

  removeTimeSlot: (day, index) =>
    set((s) => {
      if (!s.draft) return s;
      const existing = s.draft.byDay[day] ?? [];
      const nextSlots = existing.filter((_, i) => i !== index);
      // 마지막 슬롯 제거 시 해당 요일의 note도 자동 삭제 (note는 슬롯 1개+ 일 때만 존재 가능)
      let nextNotes = s.draft.dayNotes;
      if (nextSlots.length === 0 && nextNotes?.[day]) {
        nextNotes = { ...nextNotes };
        delete nextNotes[day];
      }
      return {
        draft: {
          ...s.draft,
          byDay: { ...s.draft.byDay, [day]: nextSlots },
          dayNotes: nextNotes,
        },
      };
    }),

  setDayNote: (day, note) =>
    set((s) => {
      if (!s.draft) return s;
      const trimmed = note.trim();
      const next = { ...(s.draft.dayNotes ?? {}) };
      if (trimmed) next[day] = trimmed;
      else delete next[day];
      return { draft: { ...s.draft, dayNotes: next } };
    }),

  reset: () => set({ draft: null }),
}));
