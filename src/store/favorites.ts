// 수영장 즐겨찾기 — 로컬 영속(AsyncStorage) + 서버 동기(pool_favorites, 0269).
//
// 정책(profileSync/userSchedulesSync 와 동일 톤):
// - **로컬이 권위**. hydrate 가 즉시 로컬값으로 UI 채움(빠름). 서버는 백그라운드.
// - serverSync: 로그인 후 서버값을 fetch → 로컬과 **합집합 머지** + 로컬에만 있던
//   id 1회 백필 → 머지결과를 로컬에도 영속. 재설치/기기변경/다기기 복구.
// - toggle: 로컬 갱신 + best-effort 서버 add/remove(실패해도 로컬 유지).

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePrefs } from './prefs';
import { logEvent } from '@/lib/analytics';
import {
  tryFetchFavorites,
  tryAddFavorite,
  tryRemoveFavorite,
  tryAddFavorites,
} from '@/lib/favoritesSync';

const STORAGE_KEY = 'poolsday.favorites';

interface FavoritesState {
  /** 즐겨찾기된 수영장 id 집합 */
  ids: string[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  /** 서버 fetch → 로컬과 합집합 머지 + 로컬전용 id 백필. 로그인 후 호출(App.tsx).
   *  미로그인/서버 실패 시 로컬값 그대로 유지(no-op). */
  serverSync: () => Promise<void>;
  isFavorite: (poolId: string) => boolean;
  /** 토글 후 즐겨찾기 상태(true=등록됨) 반환 */
  toggle: (poolId: string) => Promise<boolean>;
  /** 로그아웃/탈퇴 시 — 메모리·영속 모두 비움(계정 스코프, 서버는 보존). */
  reset: () => Promise<void>;
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

  serverSync: async () => {
    const serverIds = await tryFetchFavorites();
    if (serverIds === null) return; // 미로그인/서버 실패 — 로컬 유지(no-op)
    const local = get().ids;
    // 합집합 머지 — 재설치(로컬 비어있음→서버 복원) / 다기기(양쪽 합침) 모두 커버.
    const merged = Array.from(new Set([...serverIds, ...local]));
    // 로컬에만 있던 id(서버 미동기분) 1회 백필 — 기존 로컬 즐겨찾기 서버 보관.
    const localOnly = local.filter((id) => !serverIds.includes(id));
    if (localOnly.length) void tryAddFavorites(localOnly);
    set({ ids: merged });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    } catch {
      // 영속 실패해도 메모리는 머지값 반영(다음 토글 시 재영속).
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
    // 서버 동기 — best-effort(실패해도 로컬이 권위, 다음 serverSync 가 정정).
    if (has) void tryRemoveFavorite(poolId);
    else void tryAddFavorite(poolId);
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

  reset: async () => {
    set({ ids: [] });
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch {
      // 영속 삭제 실패해도 메모리는 비워짐.
    }
  },
}));
