/**
 * 내 수영 일정 — Phase 1: AsyncStorage 로컬 보관 (내 일정만).
 * Phase 2: Supabase 테이블 + 친구 초대/공개범위 실동작 (친구 시스템 선행 필요).
 *
 * 달력 탭(Figma 120:3156) / 일정 추가 시트(122:6779·7490·8027) / 완료(125:3342).
 */
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MOCK_SCHEDULES } from '@/lib/mockData';

export type ScheduleVisibility = 'private' | 'friends' | 'public';

export interface MySwimSchedule {
  id: string;
  poolId: string;
  poolName: string;
  poolPhotoUrl?: string;
  date: string; // YYYY-MM-DD
  start: string; // "15:00"
  end: string; // "18:00"
  visibility: ScheduleVisibility;
  createdAt: string;
}

interface SwimScheduleState {
  schedules: MySwimSchedule[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  add: (s: Omit<MySwimSchedule, 'id' | 'createdAt'>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  setVisibility: (id: string, visibility: ScheduleVisibility) => Promise<void>;
}

/** 일정이 지났는지 — 그 일정 date+start(시작시각) 기준 현재시각이 더 크면 지남. */
export function isSchedulePast(s: {
  date: string;
  start: string;
}): boolean {
  const [y, m, d] = s.date.split('-').map(Number);
  const [hh, mm] = s.start.split(':').map(Number);
  return new Date() > new Date(y, m - 1, d, hh, mm, 0, 0);
}

const STORAGE_KEY = 'poolsday.swimSchedules';

export const useSwimSchedules = create<SwimScheduleState>((set, get) => ({
  // Phase 1: 저장소 비어있으면 더미 50개로 시드 (mockData).
  schedules: MOCK_SCHEDULES,
  hydrated: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      set({
        schedules: raw ? (JSON.parse(raw) as MySwimSchedule[]) : MOCK_SCHEDULES,
        hydrated: true,
      });
    } catch {
      set({ hydrated: true });
    }
  },

  add: async (s) => {
    const item: MySwimSchedule = {
      ...s,
      id: `sch-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const next = [...get().schedules, item];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    set({ schedules: next });
  },

  remove: async (id) => {
    const next = get().schedules.filter((x) => x.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    set({ schedules: next });
  },

  setVisibility: async (id, visibility) => {
    const next = get().schedules.map((x) =>
      x.id === id ? { ...x, visibility } : x,
    );
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    set({ schedules: next });
  },
}));

/** YYYY-MM-DD 로컬 날짜 키 */
export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
