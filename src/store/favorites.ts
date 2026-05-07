/**
 * 즐겨찾기 스토어 (또 가고 싶은 곳).
 * AsyncStorage로 영속화.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FavoritesState {
  ids: Set<string>;
  toggle: (poolId: string) => void;
  has: (poolId: string) => boolean;
}

export const useFavorites = create<FavoritesState>()(
  persist(
    (set, get) => ({
      ids: new Set<string>(),
      toggle: (poolId) =>
        set((state) => {
          const next = new Set(state.ids);
          if (next.has(poolId)) next.delete(poolId);
          else next.add(poolId);
          return { ids: next };
        }),
      has: (poolId) => get().ids.has(poolId),
    }),
    {
      name: 'poolsday-favorites',
      storage: createJSONStorage(() => AsyncStorage),
      // Set은 JSON으로 직렬화 안 되니 array ↔ Set 변환
      partialize: (state) => ({ ids: Array.from(state.ids) }) as any,
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray((state as any).ids)) {
          state.ids = new Set((state as any).ids);
        }
      },
    },
  ),
);
