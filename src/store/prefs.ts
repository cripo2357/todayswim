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
/** 지도 친구 수영 일정 스택 노출 시점 — 슬롯 시작 N 전 ~ 종료까지.
 *  'off'=스택 전체 미표시. mapProfileStacks 가 horizonMs 로 환산. */
export type MapFriendHorizon = 'd1' | 'h12' | 'h6' | 'off';
/** 사람들(비친구 전체공개) 수영 일정 스택 노출 시점 — friend horizon과 같은 enum.
 *  'off'=미표시. profileVisibility==='public'일 때만 의미(친구공개면 행 자체 없음). */
export type MapPublicHorizon = 'd1' | 'h12' | 'h6' | 'off';
/** 내 수영 일정·레슨의 지도 stack 노출 범위 — Figma 179:4763.
 *  'off'=어디에도 표시 X / 'self'=내 지도에만 / 'friends'=친구 지도까지 /
 *  'public'=전체 공개. 'public'은 profileVisibility==='public'일 때만 선택
 *  가능(설정 화면 강제). profileVisibility 'public'→'friends' 변경 시
 *  'public'은 'friends'로 강등. (구 LessonVisibility 확장 — 일정·레슨 통합 제어) */
export type MyScheduleVisibility = 'off' | 'self' | 'friends' | 'public';

/** horizon → ms (스택 노출창 = 슬롯 시작 − horizonMs ~ 슬롯 종료). */
export const MAP_FRIEND_HORIZON_MS: Record<MapFriendHorizon, number> = {
  d1: 24 * 60 * 60 * 1000,
  h12: 12 * 60 * 60 * 1000,
  h6: 6 * 60 * 60 * 1000,
  off: 0,
};
export const MAP_PUBLIC_HORIZON_MS: Record<MapPublicHorizon, number> = MAP_FRIEND_HORIZON_MS;
// 나이 공개여부 설정은 제거됨 — 나이는 항상 비공개(프로필 안내문구만 제공).

interface PrefsState {
  othersScheduleView: OthersScheduleView;
  scheduleInvite: ScheduleInvite;
  profileVisibility: ProfileVisibility;
  friendRequest: FriendRequest;
  /** 지도 시작 위치 — null=내 위치, 그 외=즐겨찾기 poolId. 즐겨찾기 해제 시 null로 리셋(useFavorites). */
  mapStartPoolId: string | null;
  /** 지도 친구 수영 일정 스택 노출 시점(슬롯 시작 N 전부터). 'off'=미표시. */
  mapFriendHorizon: MapFriendHorizon;
  /** 지도 '사람들'(비친구 전체공개) 수영 일정 스택 노출 시점. profileVisibility
   *  ==='public'일 때만 유효(친구공개면 행 자체 미노출). 기본 'off'. */
  mapPublicHorizon: MapPublicHorizon;
  /** 내 수영 일정·레슨 stack 노출 범위(off/self/friends/public). */
  myScheduleVisibility: MyScheduleVisibility;
  /** OS 푸시 알림 마스터(Figma 223:2799 "푸시 알림"). **5개 sub의 OR 집계
   *  (derived)** — 별도 저장 X. 마케팅은 정통망법 §50 별도 동의라 집계에서
   *  제외. 토글 시 5개 sub로 cascade(마케팅 무관). */
  pushOn: boolean;
  /** 알림 유형 5개 카테고리 토글(Figma 223:2799 "알림 유형" 섹션). */
  notifFriendInvite: boolean;
  notifScheduleReminder: boolean;
  notifSubmissionResult: boolean;
  notifServiceAnnounce: boolean;
  notifMonthlyReport: boolean;
  /** 마케팅 동의(Figma 223:2799 "광고성 정보"). 정통망법 §50 별도 동의
   *  대상이라 인박스도 차단. 동의일은 lib/terms.ts AsyncStorage가 보유
   *  (poolsday.terms.marketing = ISO timestamp). 토글 ↔ setConsent 양방향. */
  notifMarketing: boolean;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setOthersScheduleView: (v: OthersScheduleView) => Promise<void>;
  setScheduleInvite: (v: ScheduleInvite) => Promise<void>;
  setProfileVisibility: (v: ProfileVisibility) => Promise<void>;
  setFriendRequest: (v: FriendRequest) => Promise<void>;
  setMapStartPoolId: (v: string | null) => Promise<void>;
  setMapFriendHorizon: (v: MapFriendHorizon) => Promise<void>;
  setMapPublicHorizon: (v: MapPublicHorizon) => Promise<void>;
  setMyScheduleVisibility: (v: MyScheduleVisibility) => Promise<void>;
  setPushOn: (v: boolean) => Promise<void>;
  setNotifFriendInvite: (v: boolean) => Promise<void>;
  setNotifScheduleReminder: (v: boolean) => Promise<void>;
  setNotifSubmissionResult: (v: boolean) => Promise<void>;
  setNotifServiceAnnounce: (v: boolean) => Promise<void>;
  setNotifMonthlyReport: (v: boolean) => Promise<void>;
  setNotifMarketing: (v: boolean) => Promise<void>;
}

const K_VIEW = 'poolsday.prefs.othersScheduleView';
const K_INVITE = 'poolsday.prefs.scheduleInvite';
const K_PROFILE_VIS = 'poolsday.prefs.profileVisibility';
const K_FRIEND_REQ = 'poolsday.prefs.friendRequest';
const K_MAP_START = 'poolsday.prefs.mapStartPoolId';
// 노출 horizon 키는 v0.6에서 boolean → enum 으로 교체(이전 키 폐기).
// 옛 'true'/'false' 값은 hydrate 시 'd1'/'off' 로 1회 마이그레이션.
const K_MAP_FRIENDS = 'poolsday.prefs.mapFriendHorizon';
const K_MAP_FRIENDS_LEGACY = 'poolsday.prefs.showMapFriendStack';
const K_MAP_PUBLIC = 'poolsday.prefs.mapPublicHorizon';
const HORIZON_VALUES: MapFriendHorizon[] = ['d1', 'h12', 'h6', 'off'];
// 신 키 — 'off'/'self'/'friends'/'public'. 구 K_LESSON_VIS('poolsday.prefs.
// lessonVisibility')에서 1회 이관: 'off'→'off', 'friends'→'friends', 'public'
// →'public'. 'self'는 신규(이관 대상 없음).
const K_MY_SCHED_VIS = 'poolsday.prefs.myScheduleVisibility';
const K_MY_SCHED_VIS_LEGACY = 'poolsday.prefs.lessonVisibility';
const MY_SCHED_VIS_VALUES: MyScheduleVisibility[] = ['off', 'self', 'friends', 'public'];
// 푸시 알림 마스터는 5 sub의 OR 집계(derived) — 별도 영속 키 없음.
// 구 K_PUSH_ON('poolsday.prefs.pushOn') 키는 폐기(2026-05-20).
const K_NOTIF_FRIEND = 'poolsday.prefs.notifFriendInvite';
const K_NOTIF_SCHED = 'poolsday.prefs.notifScheduleReminder';
const K_NOTIF_SUBMIT = 'poolsday.prefs.notifSubmissionResult';
const K_NOTIF_SVC = 'poolsday.prefs.notifServiceAnnounce';
const K_NOTIF_REPORT = 'poolsday.prefs.notifMonthlyReport';
// 마케팅 토글은 단말 단위 prefs와 별개로 동의일(ISO) = lib/terms.ts 'poolsday.terms.marketing'에 저장.
// prefs.notifMarketing은 그 timestamp의 존재 여부(boolean)를 캐시 — hydrate 시 동기화.
// 거부 시점도 별도 키로 보존(설정 화면에서 "거부일시" 표시 — 정통망법 §50
// 수신거부 이력 가시화). 동의↔거부 토글 시 둘 중 하나만 존재(상호배타).
const K_TERMS_MARKETING = 'poolsday.terms.marketing';
const K_TERMS_MARKETING_REJECTED = 'poolsday.terms.marketing.rejected';

const FRIEND_REQ_VALUES: FriendRequest[] = ['off', 'id', 'nickname', 'all'];

export const usePrefs = create<PrefsState>((set, get) => ({
  // 최초 가입자 기본값 (사용자 지정)
  othersScheduleView: 'friends', // 친구 일정만 보기
  scheduleInvite: 'on', // 초대 받기
  profileVisibility: 'friends', // 친구에게만 공개
  friendRequest: 'nickname', // 닉네임으로만 신청 받기
  mapStartPoolId: null, // 내 위치
  mapFriendHorizon: 'd1', // 1일 전부터 보기 (Figma 기본값)
  mapPublicHorizon: 'off', // 사람들 일정은 기본 OFF (profileVis=public일 때만 유효)
  myScheduleVisibility: 'friends', // profileVisibility 기본 'friends'와 동조
  pushOn: true, // 푸시 알림 기본 ON
  // 알림 유형 5개 — 가입자 기본 ON. 마케팅은 가입 시 사용자 선택(기본 false).
  notifFriendInvite: true,
  notifScheduleReminder: true,
  notifSubmissionResult: true,
  notifServiceAnnounce: true,
  notifMonthlyReport: true,
  notifMarketing: false,
  hydrated: false,

  hydrate: async () => {
    try {
      const [
        i,
        p,
        f,
        ms,
        mf,
        mfLegacy,
        mp,
        mv,
        mvLegacy,
        nFi,
        nSc,
        nSu,
        nSv,
        nMo,
        marketing,
      ] = await Promise.all([
        AsyncStorage.getItem(K_INVITE),
        AsyncStorage.getItem(K_PROFILE_VIS),
        AsyncStorage.getItem(K_FRIEND_REQ),
        AsyncStorage.getItem(K_MAP_START),
        AsyncStorage.getItem(K_MAP_FRIENDS),
        AsyncStorage.getItem(K_MAP_FRIENDS_LEGACY),
        AsyncStorage.getItem(K_MAP_PUBLIC),
        AsyncStorage.getItem(K_MY_SCHED_VIS),
        AsyncStorage.getItem(K_MY_SCHED_VIS_LEGACY),
        AsyncStorage.getItem(K_NOTIF_FRIEND),
        AsyncStorage.getItem(K_NOTIF_SCHED),
        AsyncStorage.getItem(K_NOTIF_SUBMIT),
        AsyncStorage.getItem(K_NOTIF_SVC),
        AsyncStorage.getItem(K_NOTIF_REPORT),
        AsyncStorage.getItem(K_TERMS_MARKETING),
      ]);
      const pv: ProfileVisibility = p === 'public' ? 'public' : 'friends';
      // 신 키 우선. 없으면 옛 boolean 키 → enum 마이그레이션(true→d1, false→off).
      const mapFriendHorizon: MapFriendHorizon = HORIZON_VALUES.includes(
        mf as MapFriendHorizon,
      )
        ? (mf as MapFriendHorizon)
        : mfLegacy === 'false'
        ? 'off'
        : 'd1';
      if (!mf && mfLegacy != null) {
        // 옛 키 정리 + 신 키로 1회 백필.
        AsyncStorage.setItem(K_MAP_FRIENDS, mapFriendHorizon).catch(() => {});
        AsyncStorage.removeItem(K_MAP_FRIENDS_LEGACY).catch(() => {});
      }
      // 사람들(비친구 전체공개) horizon. profileVis='friends'에선 행이 없어
      // 변경 경로가 없지만, 저장값은 보존(다시 public 전환 시 복원).
      const mapPublicHorizon: MapPublicHorizon = HORIZON_VALUES.includes(
        mp as MapPublicHorizon,
      )
        ? (mp as MapPublicHorizon)
        : 'off';
      // 내 수영 일정·레슨 가시성 — 신 키 우선, 없으면 구 lessonVisibility 키
      // 1회 이관('off'/'friends'/'public' 그대로, 'self'는 신규라 이관 대상 X).
      let myScheduleVisibility: MyScheduleVisibility = MY_SCHED_VIS_VALUES.includes(
        mv as MyScheduleVisibility,
      )
        ? (mv as MyScheduleVisibility)
        : MY_SCHED_VIS_VALUES.includes(mvLegacy as MyScheduleVisibility)
        ? (mvLegacy as MyScheduleVisibility)
        : 'friends';
      if (!mv && mvLegacy != null) {
        AsyncStorage.setItem(K_MY_SCHED_VIS, myScheduleVisibility).catch(() => {});
        AsyncStorage.removeItem(K_MY_SCHED_VIS_LEGACY).catch(() => {});
      }
      // 'public'이지만 profileVis가 'friends'면 'friends'로 강등(stale 방어).
      if (myScheduleVisibility === 'public' && pv === 'friends') {
        myScheduleVisibility = 'friends';
        AsyncStorage.setItem(K_MY_SCHED_VIS, 'friends').catch(() => {});
      }
      const friendV = nFi === 'false' ? false : true;
      const schedV = nSc === 'false' ? false : true;
      const submitV = nSu === 'false' ? false : true;
      const svcV = nSv === 'false' ? false : true;
      const reportV = nMo === 'false' ? false : true;
      set({
        // '프로필과 일정 공유' 단일 제어 — 일정 공유는 항상 프로필 공개 미러
        othersScheduleView: pv,
        scheduleInvite: i === 'off' ? 'off' : 'on',
        profileVisibility: pv,
        friendRequest: FRIEND_REQ_VALUES.includes(f as FriendRequest)
          ? (f as FriendRequest)
          : 'nickname',
        mapStartPoolId: ms || null,
        mapFriendHorizon,
        mapPublicHorizon,
        myScheduleVisibility,
        notifFriendInvite: friendV,
        notifScheduleReminder: schedV,
        notifSubmissionResult: submitV,
        notifServiceAnnounce: svcV,
        notifMonthlyReport: reportV,
        // pushOn = 5 sub의 OR (derived). 마케팅은 집계 제외.
        pushOn: friendV || schedV || submitV || svcV || reportV,
        notifMarketing: !!marketing, // timestamp 존재 = 동의 상태
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
    // 'public'→'friends' 강등 시: (a) 예정 일정 'public'→'friends'
    // (b) 내 수영 일정·레슨 가시성 'public'→'friends'
    // (c) '사람들 수영 일정' horizon은 보존(다시 public 시 복원) — 행 자체가
    // 사라지므로 노출에 영향 없음. 'public'으로 다시 전환되면 옛 값 복원.
    await AsyncStorage.setItem(K_PROFILE_VIS, v);
    await AsyncStorage.setItem(K_VIEW, v);
    if (v === 'friends') {
      const curMine = get().myScheduleVisibility;
      if (curMine === 'public') {
        await AsyncStorage.setItem(K_MY_SCHED_VIS, 'friends');
        set({
          profileVisibility: v,
          othersScheduleView: v,
          myScheduleVisibility: 'friends',
        });
      } else {
        set({ profileVisibility: v, othersScheduleView: v });
      }
      await useSwimSchedules.getState().downgradePublicToFriends();
    } else {
      set({ profileVisibility: v, othersScheduleView: v });
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

  setMapFriendHorizon: async (v) => {
    await AsyncStorage.setItem(K_MAP_FRIENDS, v);
    set({ mapFriendHorizon: v });
  },

  setMapPublicHorizon: async (v) => {
    // 'public' horizon은 profileVis='public'일 때만 UI 노출. 저장값은
    // 보존(친구공개로 잠시 전환됐다 다시 public 시 복원).
    await AsyncStorage.setItem(K_MAP_PUBLIC, v);
    set({ mapPublicHorizon: v });
  },

  setMyScheduleVisibility: async (v) => {
    // 'public'은 profileVisibility==='public'일 때만 허용 — UI에서 옵션 제거.
    // 호출자 우회 방지로 store에서도 강등(profileVis='friends'면 'friends'로).
    const pv = get().profileVisibility;
    const next: MyScheduleVisibility =
      v === 'public' && pv === 'friends' ? 'friends' : v;
    await AsyncStorage.setItem(K_MY_SCHED_VIS, next);
    set({ myScheduleVisibility: next });
  },

  // 마스터(푸시 알림) 토글 — 5 sub로 cascade. 마케팅은 정통망법 §50 별도
  // 동의라 cascade 제외(독립 토글).
  setPushOn: async (v) => {
    const s = v ? 'true' : 'false';
    await Promise.all([
      AsyncStorage.setItem(K_NOTIF_FRIEND, s),
      AsyncStorage.setItem(K_NOTIF_SCHED, s),
      AsyncStorage.setItem(K_NOTIF_SUBMIT, s),
      AsyncStorage.setItem(K_NOTIF_SVC, s),
      AsyncStorage.setItem(K_NOTIF_REPORT, s),
    ]);
    set({
      pushOn: v,
      notifFriendInvite: v,
      notifScheduleReminder: v,
      notifSubmissionResult: v,
      notifServiceAnnounce: v,
      notifMonthlyReport: v,
    });
  },

  // sub 토글 — 자기 값 저장 + pushOn 재계산(5 sub의 OR).
  setNotifFriendInvite: async (v) => {
    await AsyncStorage.setItem(K_NOTIF_FRIEND, v ? 'true' : 'false');
    set((s) => ({
      notifFriendInvite: v,
      pushOn:
        v ||
        s.notifScheduleReminder ||
        s.notifSubmissionResult ||
        s.notifServiceAnnounce ||
        s.notifMonthlyReport,
    }));
  },
  setNotifScheduleReminder: async (v) => {
    await AsyncStorage.setItem(K_NOTIF_SCHED, v ? 'true' : 'false');
    set((s) => ({
      notifScheduleReminder: v,
      pushOn:
        s.notifFriendInvite ||
        v ||
        s.notifSubmissionResult ||
        s.notifServiceAnnounce ||
        s.notifMonthlyReport,
    }));
  },
  setNotifSubmissionResult: async (v) => {
    await AsyncStorage.setItem(K_NOTIF_SUBMIT, v ? 'true' : 'false');
    set((s) => ({
      notifSubmissionResult: v,
      pushOn:
        s.notifFriendInvite ||
        s.notifScheduleReminder ||
        v ||
        s.notifServiceAnnounce ||
        s.notifMonthlyReport,
    }));
  },
  setNotifServiceAnnounce: async (v) => {
    await AsyncStorage.setItem(K_NOTIF_SVC, v ? 'true' : 'false');
    set((s) => ({
      notifServiceAnnounce: v,
      pushOn:
        s.notifFriendInvite ||
        s.notifScheduleReminder ||
        s.notifSubmissionResult ||
        v ||
        s.notifMonthlyReport,
    }));
  },
  setNotifMonthlyReport: async (v) => {
    await AsyncStorage.setItem(K_NOTIF_REPORT, v ? 'true' : 'false');
    set((s) => ({
      notifMonthlyReport: v,
      pushOn:
        s.notifFriendInvite ||
        s.notifScheduleReminder ||
        s.notifSubmissionResult ||
        s.notifServiceAnnounce ||
        v,
    }));
  },
  setNotifMarketing: async (v) => {
    // 마케팅 토글은 lib/terms.ts와 동기화 — 동의↔거부 시점을 별도 키로 보존.
    // ON: K_TERMS_MARKETING=now, rejected 키 제거.
    // OFF: K_TERMS_MARKETING 제거, K_TERMS_MARKETING_REJECTED=now.
    // 두 키는 상호배타(현재 상태 = 어느 키가 존재하느냐)지만 시점은 토글
    // 시마다 갱신 — 설정 화면에서 동의일시/거부일시로 노출.
    const now = new Date().toISOString();
    if (v) {
      await Promise.all([
        AsyncStorage.setItem(K_TERMS_MARKETING, now),
        AsyncStorage.removeItem(K_TERMS_MARKETING_REJECTED),
      ]);
    } else {
      await Promise.all([
        AsyncStorage.removeItem(K_TERMS_MARKETING),
        AsyncStorage.setItem(K_TERMS_MARKETING_REJECTED, now),
      ]);
    }
    set({ notifMarketing: v });
  },
}));
