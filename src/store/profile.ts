/**
 * 사용자 프로필.
 *
 * Phase 1: AsyncStorage 보관 (권위).
 * Phase 2 진입(2026-05-20): Supabase `public.profiles`(migration 0047) 양방향 동기.
 *   - hydrate: 로컬 우선 + 로컬 없을 때만 서버에서 복구(재설치/기기변경).
 *   - save / regenerateId: 로컬 + 서버 best-effort upsert(실패 silent).
 *   - 다중 기기 동기화는 실 auth 진입 후 — 그 전엔 로컬이 권위.
 *
 * 가입 흐름: 약관 동의 → 프로필 등록(이 store에 저장) → MapMain.
 * 다음 진입부터 SplashScreen이 프로필 존재 확인 후 MapMain 직진.
 */
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DayOfWeek } from '@/types/schedule';
import {
  tryFetchProfileById,
  tryUpsertProfile,
  tryRenameProfileId,
} from '@/lib/profileSync';

export type Gender = 'male' | 'female' | 'other';
export type Stroke = '자유형' | '배영' | '접영' | '평영';

// 내 정보 - 프로필 탭 (Figma 117:2556)
export type Certification =
  | '없음'
  | '생활스포츠지도사 2급'
  | '생활스포츠지도사 1급'
  | '수상구조사'
  | '대한적십자사 인명구조요원'
  | 'YMCA 인명구조원';
export const ALL_CERTIFICATIONS: Certification[] = [
  '없음',
  '생활스포츠지도사 2급',
  '생활스포츠지도사 1급',
  '수상구조사',
  '대한적십자사 인명구조요원',
  'YMCA 인명구조원',
];

export type IM100Record =
  | '기록 없음'
  | '1분 30초 이내'
  | '2분 이내'
  | '3분 이내'
  | '4분 이내'
  | '4분 이상';
export const ALL_IM100_RECORDS: IM100Record[] = [
  '기록 없음',
  '1분 30초 이내',
  '2분 이내',
  '3분 이내',
  '4분 이내',
  '4분 이상',
];

/**
 * 친구 추가용 계정 ID — 닉네임은 노출이 쉬워, 어렵게 추가하고 싶은 사용자를 위해
 * 별도 발급. 계정 생성 시 자동 발급, 사용자가 변경 가능.
 * 혼동 문자(0/O/1/I/L) 제외 6자리. 단일 출처 = lib/friendCode.
 */
export { genProfileId } from '@/lib/friendCode';
import { genProfileId } from '@/lib/friendCode';

/**
 * 수영 수업 시간 — 친구가 프로필을 보고 초대 시 참고용(정보 전용).
 * 일정 초대 차단/캘린더 노출 같은 시스템 연동은 의도적으로 안 함.
 * 한 요일에 여러 개 가능. start/end는 "HH:MM"(24h).
 */
export interface SwimClass {
  id: string;
  day: DayOfWeek;
  start: string; // "HH:MM"
  end: string; // "HH:MM"
}

export interface UserProfile {
  id: string; // 친구 추가용 계정 ID (계정 생성 시 발급, 변경 가능)
  name: string;
  gender: Gender;
  birthDate: string; // YYYY-MM-DD
  experienceYears: number; // 0~30, 30은 "30년 이상"
  strokes: Stroke[];
  photoUri?: string; // 로컬 URI / 소셜 URL / 번들 AvatarId
  // 소형 노출용 64px 썸네일 URL(avatar_thumb.jpg). 지도 스택 등 다수
  // 소형 렌더 시 512px 디코드 회피용. 없으면 photoUri 폴백.
  photoThumbUri?: string;
  bio?: string; // 내 소개 (최대 20자)
  certifications?: Certification[]; // 자격증 (복수 선택)
  im100Record?: IM100Record; // IM100 기록 (단일 선택)
  // 수영 레슨 (Figma 90:6622) — 레슨 받는 수영장 1곳 + 시간 슬롯 여러 개.
  // 모델 변경: 과거 정보전용 → 이제 풀 연결 + 공개 시 지도 stack 노출.
  swimClasses?: SwimClass[]; // 레슨 시간 슬롯 [{요일,시작,종료}]
  lessonPoolId?: string; // 레슨 받는 수영장 id (없으면 레슨 미설정)
  lessonPoolName?: string; // 표시용 풀명 캐시(풀 fetch 없이 프로필 표기)
  // 항목별 공개여부 (Figma 117:2556). undefined=기본값으로 해석:
  // 기간/영법/IM100/레슨=공개, 자격증=비공개. 공개일 때만 다른 사용자
  // 프로필에 노출 + (레슨) 나·친구 지도 stack 표시.
  showServiceYears?: boolean;
  showStrokes?: boolean;
  showCerts?: boolean;
  showIm100?: boolean;
  showSwimClasses?: boolean;
  createdAt: string;
}

/** 항목별 공개여부 기본값 (undefined 해석 — Figma 117:2556) */
export const PROFILE_VIS_DEFAULT = {
  showServiceYears: true,
  showStrokes: true,
  showCerts: false,
  showIm100: true,
  showSwimClasses: true,
} as const;

interface ProfileState {
  profile: UserProfile | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  save: (profile: UserProfile) => Promise<void>;
  clear: () => Promise<void>;
  /** 계정 ID 재발급 — 새 ID 반환 */
  regenerateId: () => Promise<string>;
}

const STORAGE_KEY = 'poolsday.profile';

export const useProfile = create<ProfileState>((set, get) => ({
  profile: null,
  hydrated: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      let profile = raw ? (JSON.parse(raw) as UserProfile) : null;
      // 구버전 프로필(ID 없음) 백필 — ID는 항상 존재해야 함.
      if (profile && !profile.id) {
        profile = { ...profile, id: genProfileId() };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      }
      set({ profile, hydrated: true });
      // P2 백그라운드 동기: 로컬 존재 시 서버 upsert(저장된 적 없는 기기·미적용
      // 마이그레이션 케이스에서 서버 빈 행 보장). 로컬 없으면 패스 — 가입
      // 전이라 서버에 둘 친구코드도 없음(다중기기 복구는 실 auth 진입 후).
      if (profile) {
        void tryUpsertProfile(profile);
      }
    } catch {
      set({ hydrated: true });
    }
  },

  save: async (profile) => {
    // 생성 시 ID 미지정이면 자동 발급(계정 생성 시 발급 보장).
    const withId = profile.id ? profile : { ...profile, id: genProfileId() };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(withId));
    set({ profile: withId });
    // 서버 best-effort upsert — 실패 silent, 로컬이 권위.
    void tryUpsertProfile(withId);
  },

  clear: async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    set({ profile: null });
    // 서버 row delete는 P2 후속(friends/notifications 외부 참조 정리와 함께).
    // 지금 지우면 옛 친구코드로 검색·초대했던 사람의 화면이 깨짐.
  },

  regenerateId: async () => {
    const cur = get().profile;
    const newId = genProfileId();
    if (cur) {
      const prevId = cur.id;
      const next = { ...cur, id: newId };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      set({ profile: next });
      // 서버에 새 PK row 삽입(옛 row는 보존 — profileSync 주석 참고).
      void tryRenameProfileId(next, prevId);
    }
    return newId;
  },
}));

/** 재설치·기기변경 복구용 — SplashScreen 등에서 친구코드 알려진 경우만.
 *  로컬에 프로필이 없고 서버에 row가 있을 때 끌어와 useProfile에 채움.
 *  P2 첫 단계는 호출처 없음(친구코드 입력 UX 없음). 실 auth 진입 후
 *  signIn 직후 auth.uid→profile 매핑이 잡힌 시점에 사용. */
export async function recoverProfileFromServer(id: string): Promise<boolean> {
  const fetched = await tryFetchProfileById(id);
  if (!fetched) return false;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(fetched));
  useProfile.setState({ profile: fetched });
  return true;
}
