// 수영장 즐겨찾기 — 로컬 영속(prefs와 동일 패턴, App.tsx에서 hydrate).
// 백엔드 미연동(Phase1) — poolId 집합을 AsyncStorage에 보관.

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePrefs } from './prefs';
import { logEvent } from '@/lib/analytics';

const STORAGE_KEY = 'poolsday.favorites';

interface FavoritesState {
  /** 즐겨찾기된 수영장 id 집합 */
  ids: string[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  isFavorite: (poolId: string) => boolean;
  /** 토글 후 즐겨찾기 상태(true=등록됨) 반환 */
  toggle: (poolId: string) => Promise<boolean>;
}

export const useFavorites = create<FavoritesState>((set, get) => ({
  ids: [],
  hydrated: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const ids = raw ? (JSON.parse(raw) as string[]) : [];
      set({ ids: Array.isArray(ids) ? ids : [], hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },

  isFavorite: (poolId) => get().ids.includes(poolId),

  toggle: async (poolId) => {
    const prev = get().ids;
    const has = prev.includes(poolId);
    const next = has ? prev.filter((id) => id !== poolId) : [...prev, poolId];
    set({ ids: next });
    void logEvent(has ? 'pool_favorite_remove' : 'pool_favorite_add', {
      pool_id: poolId,
    });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // 영속 실패해도 메모리 상태는 유지(다음 토글/재시도 시 정정).
    }
    // 즐겨찾기 해제한 풀이 지도 시작 위치였으면 → 내 위치로 리셋
    // (사용자 확정: 해제 시 시작 위치는 '내 위치'로 변경).
    if (has && usePrefs.getState().mapStartPoolId === poolId) {
      void usePrefs.getState().setMapStartPoolId(null);
    }
    return !has;
  },
}));
