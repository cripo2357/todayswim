/**
 * 사용자 프로필 — Phase 1: AsyncStorage 보관. Phase 2: Supabase user_profiles 테이블 동기화.
 *
 * 가입 흐름: 약관 동의 → 프로필 등록(이 store에 저장) → MapMain.
 * 다음 진입부터 SplashScreen이 프로필 존재 확인 후 MapMain 직진.
 */
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

export interface UserProfile {
  name: string;
  gender: Gender;
  birthDate: string; // YYYY-MM-DD
  experienceYears: number; // 0~30, 30은 "30년 이상"
  strokes: Stroke[];
  photoUri?: string; // 로컬 URI / 소셜 URL / 번들 AvatarId
  bio?: string; // 내 소개 (최대 20자)
  certifications?: Certification[]; // 자격증 (복수 선택)
  im100Record?: IM100Record; // IM100 기록 (단일 선택)
  createdAt: string;
}

interface ProfileState {
  profile: UserProfile | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  save: (profile: UserProfile) => Promise<void>;
  clear: () => Promise<void>;
}

const STORAGE_KEY = 'poolsday.profile';

export const useProfile = create<ProfileState>((set) => ({
  profile: null,
  hydrated: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const profile = raw ? (JSON.parse(raw) as UserProfile) : null;
      set({ profile, hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },

  save: async (profile) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    set({ profile });
  },

  clear: async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    set({ profile: null });
  },
}));
