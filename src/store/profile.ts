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

export interface UserProfile {
  name: string;
  gender: Gender;
  birthDate: string; // YYYY-MM-DD
  experienceYears: number; // 0~30, 30은 "30년 이상"
  strokes: Stroke[];
  photoUri?: string; // 로컬 URI 또는 Supabase Storage URL
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
