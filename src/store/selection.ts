/**
 * 메인 지도에서 현재 선택된 풀 관리.
 * 메모리만 — 영속화 X (앱 재진입 시 선택 해제).
 */
import { create } from 'zustand';

interface SelectionState {
  selectedPoolId: string | null;
  /**
   * 외부(목록 등)에서 선택 시 카메라를 해당 풀로 이동하도록 신호.
   * MapScreen이 consume 후 null로 clear.
   */
  pendingFocusPoolId: string | null;
  select: (poolId: string | null) => void;
  /** 풀 선택 + 지도에 카메라 이동 요청 (지도 외부에서 호출용). */
  selectAndFocus: (poolId: string) => void;
  clearPendingFocus: () => void;
}

export const useSelection = create<SelectionState>((set) => ({
  selectedPoolId: null,
  pendingFocusPoolId: null,
  select: (poolId) => set({ selectedPoolId: poolId }),
  selectAndFocus: (poolId) =>
    set({ selectedPoolId: poolId, pendingFocusPoolId: poolId }),
  clearPendingFocus: () => set({ pendingFocusPoolId: null }),
}));
