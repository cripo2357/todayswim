/**
 * 인증 상태 — Supabase Auth 기반.
 *
 *  - Google: 네이티브 SDK(@react-native-google-signin)로 idToken 받아
 *            supabase.auth.signInWithIdToken({ provider: 'google' }) 교환.
 *  - Kakao : supabase.auth.signInWithOAuth({ provider: 'kakao' }) +
 *            expo-web-browser 인앱 브라우저 + PKCE code 교환.
 *  - Apple : 아직 mock (LoginScreen [TEST MODE] 가입 프로세스 진입점 전용).
 *
 * 세션은 supabase-js가 AsyncStorage에 영속(persistSession) — 앱 재시작 복원/자동 갱신.
 * user 상태는 supabase 세션에서 파생하며 onAuthStateChange로 추적한다.
 */
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export type SocialProvider = 'google' | 'apple' | 'kakao';

export interface AuthUser {
  id: string;
  provider: SocialProvider;
  nickname: string;
  email?: string;
}

interface AuthState {
  user: AuthUser | null;
  hydrated: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithKakao: () => Promise<void>;
  /** Apple — [TEST MODE] 가입 프로세스 진입점 전용 mock */
  signInMock: (provider: SocialProvider) => Promise<void>;
  signOut: () => Promise<void>;
  hydrate: () => Promise<void>;
}

const MOCK_STORAGE_KEY = 'poolsday.auth.mockUser';

// Google idToken 발급용 — Google Cloud "웹 애플리케이션" OAuth 클라이언트 ID.
// (Android/iOS 클라이언트가 아니라 웹 클라이언트 ID여야 supabase가 검증 가능.)
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

let googleConfigured = false;
function ensureGoogleConfigured() {
  if (googleConfigured) return;
  GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID });
  googleConfigured = true;
}

function userFromSession(session: Session | null): AuthUser | null {
  if (!session?.user) return null;
  const u = session.user;
  const provider = (u.app_metadata?.provider as SocialProvider) ?? 'google';
  const meta = u.user_metadata ?? {};
  return {
    id: u.id,
    provider,
    nickname: meta.name ?? meta.full_name ?? meta.nickname ?? '',
    email: u.email ?? undefined,
  };
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  hydrated: false,

  hydrate: async () => {
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        set({ user: userFromSession(data.session), hydrated: true });
      } else {
        // Supabase 세션 없으면 Apple TEST MODE mock 세션 복원 시도.
        const raw = await AsyncStorage.getItem(MOCK_STORAGE_KEY);
        set({
          user: raw ? (JSON.parse(raw) as AuthUser) : null,
          hydrated: true,
        });
      }
      // 이후 세션 변화(자동 갱신/로그아웃) 추적.
      supabase.auth.onAuthStateChange((_event, session) => {
        if (session) set({ user: userFromSession(session) });
      });
    } catch {
      set({ hydrated: true });
    }
  },

  signInWithGoogle: async () => {
    ensureGoogleConfigured();
    await GoogleSignin.hasPlayServices();
    try {
      const result = await GoogleSignin.signIn();
      // v13+ 응답은 { type, data }, 구버전은 { idToken } — 양쪽 호환.
      const idToken =
        (result as { data?: { idToken?: string } }).data?.idToken ??
        (result as { idToken?: string }).idToken;
      if (!idToken) throw new Error('Google idToken 없음');

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });
      if (error) throw error;
      set({ user: userFromSession(data.session) });
    } catch (e) {
      const code = (e as { code?: string }).code;
      if (
        code === statusCodes.SIGN_IN_CANCELLED ||
        code === statusCodes.IN_PROGRESS
      ) {
        return; // 사용자가 취소 — 조용히 무시
      }
      throw e;
    }
  },

  signInWithKakao: async () => {
    const redirectTo = Linking.createURL('auth/callback');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error) throw error;
    if (!data?.url) throw new Error('Kakao OAuth URL 없음');

    const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (res.type !== 'success') return; // 취소/실패

    // PKCE: 콜백 URL의 ?code= 를 세션으로 교환.
    const code = new URL(res.url).searchParams.get('code');
    if (!code) throw new Error('Kakao 콜백에 code 없음');
    const { data: sess, error: exErr } =
      await supabase.auth.exchangeCodeForSession(code);
    if (exErr) throw exErr;
    set({ user: userFromSession(sess.session) });
  },

  signInMock: async (provider) => {
    const mockUser: AuthUser = {
      id: `mock-${provider}-${Date.now()}`,
      provider,
      nickname:
        provider === 'google' ? '구글유저'
        : provider === 'apple' ? '애플유저'
        : '카카오유저',
    };
    await AsyncStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(mockUser));
    set({ user: mockUser });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    await AsyncStorage.removeItem(MOCK_STORAGE_KEY);
    try {
      await GoogleSignin.signOut();
    } catch {
      // Google 미로그인 상태면 무시
    }
    set({ user: null });
  },
}));
