/**
 * 인증 상태 — Phase 1: 로컬 mock. Phase 2: Supabase Auth(`auth.users` + JWT)로 교체.
 *
 * Phase 1 흐름:
 *   LoginScreen → social 버튼 탭 → setUser({ id, provider, nickname }) → TermsAgreement or Main
 *   App.tsx에서 AsyncStorage로 세션 복원 (재시작 시 로그인 상태 유지)
 *
 * Phase 2 교체 포인트:
 *   - useAuth() hook이 supabase.auth.onAuthStateChange로 세션 추적
 *   - signInWithProvider는 native OAuth SDK로 id_token 받아 supabase.auth.signInWithIdToken 호출
 */
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SocialProvider = 'google' | 'apple' | 'kakao';

export interface AuthUser {
  id: string;
  provider: SocialProvider;
  nickname: string;
  email?: string;
}

interface AuthState {
  user: AuthUser | null;
  hydrated: boolean; // AsyncStorage 복원 완료
  signInMock: (provider: SocialProvider) => Promise<void>;
  signOut: () => Promise<void>;
  hydrate: () => Promise<void>;
}

const STORAGE_KEY = 'poolsday.auth.user';

export const useAuth = create<AuthState>((set) => ({
  user: null,
  hydrated: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const user = raw ? (JSON.parse(raw) as AuthUser) : null;
      set({ user, hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },

  signInMock: async (provider) => {
    // TODO Phase 2: 실제 OAuth — provider별 native SDK로 id_token 받고
    // supabase.auth.signInWithIdToken({ provider, token })로 교환.
    const mockUser: AuthUser = {
      id: `mock-${provider}-${Date.now()}`,
      provider,
      nickname:
        provider === 'google' ? '구글유저'
        : provider === 'apple' ? '애플유저'
        : '카카오유저',
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
    set({ user: mockUser });
  },

  signOut: async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    set({ user: null });
  },
}));
