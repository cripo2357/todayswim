/**
 * 내 수영 일정 — Phase 1 AsyncStorage 로컬 + Phase 2(2026-05-20) 서버
 * best-effort 동기(user_schedules 테이블, 0049).
 *
 * 정책(profileSync/friendsSync와 동일 톤):
 * - 로컬(AsyncStorage)이 권위. UI 즉시 반영, 서버는 백그라운드.
 * - 5개 mutation에 userSchedulesSync 호출 부착(실패 silent).
 * - 친구 일정 fetch(MOCK_OTHER_SCHEDULES 교체)는 후속 배치.
 *
 * 달력 탭(Figma 120:3156) / 일정 추가 시트(122:6779·7490·8027) / 완료(125:3342).
 */
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MOCK_SCHEDULES } from '@/lib/mockData';
import { useProfile } from '@/store/profile';
import {
  tryInsertSchedule,
  tryDeleteSchedule,
  tryUpdateScheduleVisibility,
  tryUpdateScheduleCompleted,
  tryDowngradePublicToFriends,
} from '@/lib/userSchedulesSync';

/** 현재 유저 친구코드 — 없으면 서버 호출 skip. */
function myProfileId(): string | undefined {
  return useProfile.getState().profile?.id;
}

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
  /** 지난 일정 "수영 완료" 확정 여부 (일정 관리 시트에서 선택) */
  completed?: boolean;
  createdAt: string;
}

interface SwimScheduleState {
  schedules: MySwimSchedule[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  add: (s: Omit<MySwimSchedule, 'id' | 'createdAt'>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  setVisibility: (id: string, visibility: ScheduleVisibility) => Promise<void>;
  /** 지난 일정 "수영 완료" 확정/해제 */
  setCompleted: (id: string, completed: boolean) => Promise<void>;
  /** 다른 사람 일정 보기 '친구 일정만' 전환 시 — 예정 일정 중 public → friends 강등 */
  downgradePublicToFriends: () => Promise<void>;
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
    const me = myProfileId();
    if (me) void tryInsertSchedule(me, item);
  },

  remove: async (id) => {
    const next = get().schedules.filter((x) => x.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    set({ schedules: next });
    if (myProfileId()) void tryDeleteSchedule(id);
  },

  setVisibility: async (id, visibility) => {
    const next = get().schedules.map((x) =>
      x.id === id ? { ...x, visibility } : x,
    );
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    set({ schedules: next });
    if (myProfileId()) void tryUpdateScheduleVisibility(id, visibility);
  },

  setCompleted: async (id, completed) => {
    const next = get().schedules.map((x) =>
      x.id === id ? { ...x, completed } : x,
    );
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    set({ schedules: next });
    if (myProfileId()) void tryUpdateScheduleCompleted(id, completed);
  },

  downgradePublicToFriends: async () => {
    let changed = false;
    const next = get().schedules.map((x) => {
      if (x.visibility === 'public' && !isSchedulePast(x)) {
        changed = true;
        return { ...x, visibility: 'friends' as const };
      }
      return x;
    });
    if (!changed) return;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    set({ schedules: next });
    const me = myProfileId();
    if (me) void tryDowngradePublicToFriends(me, dateKey(new Date()));
  },
}));

/** YYYY-MM-DD 로컬 날짜 키 */
export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
