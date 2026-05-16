// 앱 사용자 환경설정(로컬 보관) — 설정 화면의 선택형 옵션 등.
// AsyncStorage 영속(다른 store와 동일 패턴), App.tsx에서 hydrate.

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** 다른 사람 수영 일정 보기 범위 */
export type OthersScheduleView = 'friends' | 'public';
/** 수영 일정 초대 수신 여부 */
export type ScheduleInvite = 'on' | 'off';
/** 내 프로필 공개 범위 */
export type ProfileVisibility = 'friends' | 'public';
/** 친구 신청 받기 범위 */
export type FriendRequest = 'off' | 'id' | 'nickname' | 'all';

interface PrefsState {
  othersScheduleView: OthersScheduleView;
  scheduleInvite: ScheduleInvite;
  profileVisibility: ProfileVisibility;
  friendRequest: FriendRequest;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setOthersScheduleView: (v: OthersScheduleView) => Promise<void>;
  setScheduleInvite: (v: ScheduleInvite) => Promise<void>;
  setProfileVisibility: (v: ProfileVisibility) => Promise<void>;
  setFriendRequest: (v: FriendRequest) => Promise<void>;
}

const K_VIEW = 'poolsday.prefs.othersScheduleView';
const K_INVITE = 'poolsday.prefs.scheduleInvite';
const K_PROFILE_VIS = 'poolsday.prefs.profileVisibility';
const K_FRIEND_REQ = 'poolsday.prefs.friendRequest';

const FRIEND_REQ_VALUES: FriendRequest[] = ['off', 'id', 'nickname', 'all'];

export const usePrefs = create<PrefsState>((set) => ({
  othersScheduleView: 'friends', // 기본: 친구 일정만
  scheduleInvite: 'off', // 기본: 초대 안 받기
  profileVisibility: 'friends', // 기본: 친구에게만 공개
  friendRequest: 'all', // 기본: 모두에게 신청 받기
  hydrated: false,

  hydrate: async () => {
    try {
      const [v, i, p, f] = await Promise.all([
        AsyncStorage.getItem(K_VIEW),
        AsyncStorage.getItem(K_INVITE),
        AsyncStorage.getItem(K_PROFILE_VIS),
        AsyncStorage.getItem(K_FRIEND_REQ),
      ]);
      set({
        othersScheduleView: v === 'public' ? 'public' : 'friends',
        scheduleInvite: i === 'on' ? 'on' : 'off',
        profileVisibility: p === 'public' ? 'public' : 'friends',
        friendRequest: FRIEND_REQ_VALUES.includes(f as FriendRequest)
          ? (f as FriendRequest)
          : 'all',
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

  setProfileVisibility: async (v) => {
    await AsyncStorage.setItem(K_PROFILE_VIS, v);
    set({ profileVisibility: v });
  },

  setFriendRequest: async (v) => {
    await AsyncStorage.setItem(K_FRIEND_REQ, v);
    set({ friendRequest: v });
  },
}));
