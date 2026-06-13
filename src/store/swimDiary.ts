// 수영 일기 로컬 스토어 — 일정당 1건(scheduleId 키). swimSchedule 패턴.
// 로컬(AsyncStorage) 우선 + 서버 best-effort 동기. 카드가 bySchedule로 일기 존재/내용 조회.
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useProfile } from './profile';
import type { ScheduleVisibility } from './swimSchedule';
import type { StrokeKey } from '@/lib/swimCalories';
import {
  tryUpsertDiary,
  tryDeleteDiary,
  tryFetchMyDiaries,
  rowToDiary,
} from '@/lib/swimDiarySync';

export interface SwimDiary {
  id: string; // 서버 uuid (미동기 시 '')
  scheduleId: string; // user_schedules.id (이 일정의 일기)
  poolId: string;
  poolName: string;
  date: string; // YYYY-MM-DD
  start: string; // 실제 수영 시작 HH:MM
  end: string; // 실제 수영 종료 HH:MM
  laneLength: number; // 25 | 50
  reps: Partial<Record<StrokeKey, number>>; // 영법별 회수
  note?: string; // 수영 노트(최대 300자)
  visibility: ScheduleVisibility; // 나만(private)/친구(friends)/모두(public)
  createdAt: string;
}

const STORAGE_KEY = 'poolsday.swimDiaries';
function myProfileId(): string | undefined {
  return useProfile.getState().profile?.id;
}

interface SwimDiaryState {
  diaries: SwimDiary[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  /** 서버 fetch → 로컬 교체. 로그인(profile.id) 후 호출. */
  serverSync: () => Promise<void>;
  /** 이 일정의 일기(없으면 undefined). */
  bySchedule: (scheduleId: string) => SwimDiary | undefined;
  /** 추가/수정 — scheduleId 기준 upsert. */
  upsert: (
    input: Omit<SwimDiary, 'id' | 'createdAt'> & { id?: string },
  ) => Promise<void>;
  removeBySchedule: (scheduleId: string) => Promise<void>;
  /** 로그아웃/게스트 — 메모리+영속 비움. */
  reset: () => Promise<void>;
}

export const useSwimDiaries = create<SwimDiaryState>((set, get) => ({
  diaries: [],
  hydrated: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      set({ diaries: raw ? (JSON.parse(raw) as SwimDiary[]) : [], hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },

  serverSync: async () => {
    const me = myProfileId();
    if (!me) return;
    const rows = await tryFetchMyDiaries(me);
    if (!rows) return; // fetch 실패 — 캐시 유지
    const next = rows.map(rowToDiary);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    set({ diaries: next });
  },

  bySchedule: (scheduleId) =>
    get().diaries.find((d) => d.scheduleId === scheduleId),

  upsert: async (input) => {
    const existing = get().diaries.find((d) => d.scheduleId === input.scheduleId);
    const item: SwimDiary = {
      ...input,
      id: input.id ?? existing?.id ?? '',
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };
    const next = [
      ...get().diaries.filter((d) => d.scheduleId !== input.scheduleId),
      item,
    ];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    set({ diaries: next });

    const me = myProfileId();
    if (me) {
      const saved = await tryUpsertDiary(me, item);
      if (saved?.id && saved.id !== item.id) {
        const withId = get().diaries.map((d) =>
          d.scheduleId === item.scheduleId ? { ...d, id: saved.id } : d,
        );
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(withId));
        set({ diaries: withId });
      }
    }
  },

  removeBySchedule: async (scheduleId) => {
    const target = get().diaries.find((d) => d.scheduleId === scheduleId);
    const next = get().diaries.filter((d) => d.scheduleId !== scheduleId);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    set({ diaries: next });
    if (myProfileId() && target?.id) void tryDeleteDiary(target.id);
  },

  reset: async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    set({ diaries: [], hydrated: true });
  },
}));
