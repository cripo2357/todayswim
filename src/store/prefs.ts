// 앱 사용자 환경설정(로컬 보관) — 설정 화면의 선택형 옵션 등.
// AsyncStorage 영속(다른 store와 동일 패턴), App.tsx에서 hydrate.

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSwimSchedules } from './swimSchedule';

/** 다른 사람 수영 일정 보기 범위 */
export type OthersScheduleView = 'friends' | 'public';
/** 수영 일정 초대 수신 여부 */
export type ScheduleInvite = 'on' | 'off';
/** 내 프로필 공개 범위 */
export type ProfileVisibility = 'friends' | 'public';
/** 친구 신청 받기 범위 */
export type FriendRequest = 'off' | 'id' | 'nickname' | 'all';
// 나이 공개여부 설정은 제거됨 — 나이는 항상 비공개(프로필 안내문구만 제공).

interface PrefsState {
  othersScheduleView: OthersScheduleView;
  scheduleInvite: ScheduleInvite;
  profileVisibility: ProfileVisibility;
  friendRequest: FriendRequest;
  /** 지도 시작 위치 — null=내 위치, 그 외=즐겨찾기 poolId. 즐겨찾기 해제 시 null로 리셋(useFavorites). */
  mapStartPoolId: string | null;
  /** 지도에 수영 예정 친구 스택 표시 (false=안 보기) */
  showMapFriendStack: boolean;
  /** OS 푸시 알림 마스터(현재 단일 토글). false=모든 알림 OFF — 설정 행
   *  아이콘이 bell→bell-off로 스왑. 카테고리별 토글 도입 시 이 값 ↔
   *  하위 그룹 합집합으로 확장(스펙 §1191 잔여 작업). */
  pushOn: boolean;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setOthersScheduleView: (v: OthersScheduleView) => Promise<void>;
  setScheduleInvite: (v: ScheduleInvite) => Promise<void>;
  setProfileVisibility: (v: ProfileVisibility) => Promise<void>;
  setFriendRequest: (v: FriendRequest) => Promise<void>;
  setMapStartPoolId: (v: string | null) => Promise<void>;
  setShowMapFriendStack: (v: boolean) => Promise<void>;
  setPushOn: (v: boolean) => Promise<void>;
}

const K_VIEW = 'poolsday.prefs.othersScheduleView';
const K_INVITE = 'poolsday.prefs.scheduleInvite';
const K_PROFILE_VIS = 'poolsday.prefs.profileVisibility';
const K_FRIEND_REQ = 'poolsday.prefs.friendRequest';
const K_MAP_START = 'poolsday.prefs.mapStartPoolId';
const K_MAP_FRIENDS = 'poolsday.prefs.showMapFriendStack';
const K_PUSH_ON = 'poolsday.prefs.pushOn';

const FRIEND_REQ_VALUES: FriendRequest[] = ['off', 'id', 'nickname', 'all'];

export const usePrefs = create<PrefsState>((set) => ({
  // 최초 가입자 기본값 (사용자 지정)
  othersScheduleView: 'friends', // 친구 일정만 보기
  scheduleInvite: 'on', // 초대 받기
  profileVisibility: 'friends', // 친구에게만 공개
  friendRequest: 'nickname', // 닉네임으로만 신청 받기
  mapStartPoolId: null, // 내 위치
  showMapFriendStack: true, // 지도에 표시 (Figma 기본값)
  pushOn: true, // 푸시 알림 기본 ON
  hydrated: false,

  hydrate: async () => {
    try {
      const [i, p, f, ms, mf, pn] = await Promise.all([
        AsyncStorage.getItem(K_INVITE),
        AsyncStorage.getItem(K_PROFILE_VIS),
        AsyncStorage.getItem(K_FRIEND_REQ),
        AsyncStorage.getItem(K_MAP_START),
        AsyncStorage.getItem(K_MAP_FRIENDS),
        AsyncStorage.getItem(K_PUSH_ON),
      ]);
      const pv: ProfileVisibility = p === 'public' ? 'public' : 'friends';
      set({
        // '프로필과 일정 공유' 단일 제어 — 일정 공유는 항상 프로필 공개 미러
        othersScheduleView: pv,
        scheduleInvite: i === 'off' ? 'off' : 'on',
        profileVisibility: pv,
        friendRequest: FRIEND_REQ_VALUES.includes(f as FriendRequest)
          ? (f as FriendRequest)
          : 'nickname',
        mapStartPoolId: ms || null,
        showMapFriendStack: mf === 'false' ? false : true,
        pushOn: pn === 'false' ? false : true,
        hydrated: true,
      });
    } catch {
      set({ hydrated: true });
    }
  },

  setOthersScheduleView: async (v) => {
    await AsyncStorage.setItem(K_VIEW, v);
    set({ othersScheduleView: v });
    // '친구 일정만'으로 바뀌면 내 예정 일정 중 전체공개 → 친구공개로 강등
    if (v === 'friends') {
      await useSwimSchedules.getState().downgradePublicToFriends();
    }
  },

  setScheduleInvite: async (v) => {
    await AsyncStorage.setItem(K_INVITE, v);
    set({ scheduleInvite: v });
  },

  setProfileVisibility: async (v) => {
    // '프로필과 일정 공유' 단일 제어(Figma 129:6006) — 일정 공유는
    // 항상 프로필 공개를 미러. 2기능 1제어로 병합(사용자 확정).
    await AsyncStorage.setItem(K_PROFILE_VIS, v);
    await AsyncStorage.setItem(K_VIEW, v);
    set({ profileVisibility: v, othersScheduleView: v });
    if (v === 'friends') {
      // 친구만 → 내 예정 일정 중 전체공개 → 친구공개로 강등
      await useSwimSchedules.getState().downgradePublicToFriends();
    }
  },

  setFriendRequest: async (v) => {
    await AsyncStorage.setItem(K_FRIEND_REQ, v);
    set({ friendRequest: v });
  },

  setMapStartPoolId: async (v) => {
    if (v) await AsyncStorage.setItem(K_MAP_START, v);
    else await AsyncStorage.removeItem(K_MAP_START);
    set({ mapStartPoolId: v });
  },

  setShowMapFriendStack: async (v) => {
    await AsyncStorage.setItem(K_MAP_FRIENDS, v ? 'true' : 'false');
    set({ showMapFriendStack: v });
  },

  setPushOn: async (v) => {
    await AsyncStorage.setItem(K_PUSH_ON, v ? 'true' : 'false');
    set({ pushOn: v });
  },
}));
