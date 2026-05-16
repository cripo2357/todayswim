/**
 * 자유수영 시간표 더블탭 → 일정 등록 플로우로 넘기는 일회성 의도.
 *
 * ScheduleView가 풀+날짜만 잡아 set → 내 정보(달력) 진입 → CalendarTab이
 * mount 시 소비(시트 프리필 오픈) 후 clear. 타임은 등록 시트에서 그 날짜의
 * 시즌(slotGroups months)에 맞춰 다시 고르므로 여기엔 슬롯을 담지 않는다.
 */
import { create } from 'zustand';

export interface AddScheduleIntent {
  poolId: string;
  date: string; // YYYY-MM-DD
}

interface AddScheduleIntentState {
  intent: AddScheduleIntent | null;
  setIntent: (i: AddScheduleIntent) => void;
  clearIntent: () => void;
}

export const useAddScheduleIntent = create<AddScheduleIntentState>((set) => ({
  intent: null,
  setIntent: (intent) => set({ intent }),
  clearIntent: () => set({ intent: null }),
}));
