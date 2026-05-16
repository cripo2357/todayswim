// 앱 사용자 환경설정(로컬 보관) — 설정 화면의 선택형 옵션 등.
// AsyncStorage 영속(다른 store와 동일 패턴), App.tsx에서 hydrate.

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** 다른 사람 수영 일정 보기 범위 */
export type OthersScheduleView = 'friends' | 'public';
/** 수영 일정 초대 수신 여부 */
export type ScheduleInvite = 'on' | 'off';

interface PrefsState {
  othersScheduleView: OthersScheduleView;
  scheduleInvite: ScheduleInvite;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setOthersScheduleView: (v: OthersScheduleView) => Promise<void>;
  setScheduleInvite: (v: ScheduleInvite) => Promise<void>;
}

const K_VIEW = 'poolsday.prefs.othersScheduleView';
const K_INVITE = 'poolsday.prefs.scheduleInvite';

export const usePrefs = create<PrefsState>((set) => ({
  othersScheduleView: 'friends', // 기본: 친구 일정만
  scheduleInvite: 'off', // 기본: 초대 안 받기
  hydrated: false,

  hydrate: async () => {
    try {
      const [v, i] = await Promise.all([
        AsyncStorage.getItem(K_VIEW),
        AsyncStorage.getItem(K_INVITE),
      ]);
      set({
        othersScheduleView: v === 'public' ? 'public' : 'friends',
        scheduleInvite: i === 'on' ? 'on' : 'off',
        hydrated: true,
      });
    } catch {
      set({ hydrated: true });
    }
  },

  setOthersScheduleView: async (v) => {
    await AsyncStorage.setItem(K_VIEW, v);
    set({ othersScheduleView: v });
  },

  setScheduleInvite: async (v) => {
    await AsyncStorage.setItem(K_INVITE, v);
    set({ scheduleInvite: v });
  },
}));
