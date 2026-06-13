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
import { useProfile } from '@/store/profile';
import {
  tryInsertSchedule,
  tryDeleteSchedule,
  tryUpdateScheduleVisibility,
  tryUpdateScheduleCompleted,
  tryDowngradePublicToFriends,
  tryFetchMySchedules,
  rowToSchedule,
} from '@/lib/userSchedulesSync';
import { checkFriendOverlap } from '@/lib/friendOverlap';

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
  /** 서버 fetch → 로컬 교체. P3 2026-05-22 — 다기기 동기 + 재설치 복구.
   *  profile.id 가 생긴 시점에 App.tsx useEffect 가 호출. session 미인증
   *  (Apple mock / 비로그인) 시 호출 안 됨 → AsyncStorage 캐시 유지. */
  serverSync: () => Promise<void>;
  add: (s: Omit<MySwimSchedule, 'id' | 'createdAt'>) => Promise<string>;
  remove: (id: string) => Promise<void>;
  setVisibility: (id: string, visibility: ScheduleVisibility) => Promise<void>;
  /** 지난 일정 "수영 완료" 확정/해제 */
  setCompleted: (id: string, completed: boolean) => Promise<void>;
  /** 다른 사람 일정 보기 '친구 일정만' 전환 시 — 예정 일정 중 public → friends 강등 */
  downgradePublicToFriends: () => Promise<void>;
  /** 로그아웃/탈퇴 시 — 메모리·영속 모두 비움(계정 스코프). */
  reset: () => Promise<void>;
}

/** 일정이 지났는지 — 그 일정 date+end(종료시각) 기준 현재시각이 더 크면 지남.
 *  진행중 슬롯(start<=now<=end) 은 "지남 X" = 예정에 포함.
 *  poolScheduleSlots 의 슬롯 노출 기준(end>now)과 동일 — 단일 의미. */
export function isSchedulePast(s: {
  date: string;
  end: string;
}): boolean {
  const [y, m, d] = s.date.split('-').map(Number);
  const [hh, mm] = s.end.split(':').map(Number);
  return new Date() > new Date(y, m - 1, d, hh, mm, 0, 0);
}

/** 슬롯 시작 시각이 지났는가 — '수영 일기 작성' 버튼 전환 기준(시작 시점).
 *  참여자 표시(다른사람/친구초대)는 종료 기준 isSchedulePast 유지. */
export function isScheduleStarted(s: {
  date: string;
  start: string;
}): boolean {
  const [y, m, d] = s.date.split('-').map(Number);
  const [hh, mm] = s.start.split(':').map(Number);
  return new Date() > new Date(y, m - 1, d, hh, mm, 0, 0);
}

const STORAGE_KEY = 'poolsday.swimSchedules';

export const useSwimSchedules = create<SwimScheduleState>((set, get) => ({
  // P3 prod 준비: MOCK_SCHEDULES 50개 더미 시드 제거 — 신규 사용자는 빈 일정.
  // dev demo 데이터는 dev/preview env 분기 단계에서 별도 시드 메커니즘으로 처리.
  schedules: [],
  hydrated: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const schedules = raw ? (JSON.parse(raw) as MySwimSchedule[]) : [];
      set({ schedules, hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },

  serverSync: async () => {
    const me = myProfileId();
    if (!me) return; // 미인증 / Apple mock — 로컬 캐시 유지
    const rows = await tryFetchMySchedules(me);
    if (!rows) return; // fetch 실패(네트워크 등) — 캐시 유지
    // 서버 권위 — 빈 배열도 정상 응답으로 처리(신규 가입자 = 빈 일정).
    // 단, 시드 mock 이 들어있는 가입 전 상태와 구분 불가하니 정책 명확화:
    // session 있는 = 가입자 = 서버가 진실원본 = 빈 배열도 그대로 반영.
    const next = rows.map(rowToSchedule);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    set({ schedules: next });
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
    if (me) {
      void tryInsertSchedule(me, item);
      // 같은 슬롯에 일정 있는 친구 있으면 본인 알림함에 겹침 알림(best-effort).
      void checkFriendOverlap(item);
    }
    return item.id;
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

  reset: async () => {
    set({ schedules: [] });
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch {
      // 영속 삭제 실패해도 메모리는 비워짐.
    }
  },
}));

/** YYYY-MM-DD 로컬 날짜 키 */
export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
