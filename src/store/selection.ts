/**
 * 메인 지도에서 현재 선택된 풀 관리.
 * 메모리만 — 영속화 X (앱 재진입 시 선택 해제).
 */
import { create } from 'zustand';

interface SelectionState {
  selectedPoolId: string | null;
  select: (poolId: string | null) => void;
}

export const useSelection = create<SelectionState>((set) => ({
  selectedPoolId: null,
  select: (poolId) => set({ selectedPoolId: poolId }),
}));
