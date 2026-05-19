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
import { useProfile } from '@/store/profile';

export type SocialProvider = 'google' | 'apple' | 'kakao';

export interface AuthUser {
  id: string;
  provider: SocialProvider;
  nickname: string;
  email?: string;
  /** 소셜 프로필 사진 URL — 가입 시 ProfileImage 기본값으로 사용 */
  photoUrl?: string;
}

interface AuthState {
  user: AuthUser | null;
  hydrated: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithKakao: () => Promise<void>;
  /** Apple — [TEST MODE] 가입 프로세스 진입점 전용 mock */
  signInMock: (provider: SocialProvider) => Promise<void>;
  signOut: () => Promise<void>;
  /**
   * 회원 탈퇴 (Figma 201:8341/10281/10428).
   * P1(목업): 로컬 세션·프로필 전면 teardown = 로그아웃과 동일 효과로
   * 사용자는 즉시 로그아웃·데이터 비움 상태가 됨.
   * P2(백엔드 SSOT): 서버측 계정/데이터 영구 삭제는 service-role 권한이
   * 필요해 클라이언트에서 못 함 — Supabase Edge Function/RPC로 분리 예정
   * (여기가 그 단일 seam). project_phases 참고.
   */
  deleteAccount: () => Promise<void>;
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
    photoUrl: meta.avatar_url ?? meta.picture ?? undefined,
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
    // ⚠️ Supabase GoTrue는 Kakao에 `account_email`을 서버측에서 강제
    //   요청한다(클라 `scopes` 옵션으로 제거 불가 — 검증으로 확인됨:
    //   `scopes:'profile_nickname profile_image'`를 줘도 콜백이
    //   `Invalid scope: account_email`로 실패). 따라서 Kakao 로그인은
    //   Kakao 앱을 **비즈 앱**으로 등록해 `account_email` 동의항목이
    //   허용돼야 비로소 동작한다. (이메일=계정 key라 어차피 필요 —
    //   memory email_account_key, docs/SUPABASE_SEOUL_MIGRATION.md §8.)
    //   그때까지 카카오 로그인은 기능 불가(리전 이관과 무관한 외부 제약).
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error) throw error;
    if (!data?.url) throw new Error('Kakao OAuth URL 없음');

    const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (res.type !== 'success') return; // 취소/실패

    // PKCE: 콜백 URL의 ?code= 를 세션으로 교환.
    const cbUrl = new URL(res.url);
    const code = cbUrl.searchParams.get('code');
    if (!code) {
      // Supabase는 실패 시 code 대신 error/error_description을 붙여 돌려보냄
      // — 그 메시지를 그대로 노출(추측 대신 실제 원인).
      const detail =
        cbUrl.searchParams.get('error_description') ??
        cbUrl.searchParams.get('error') ??
        res.url;
      throw new Error(`Kakao 콜백에 code 없음 — ${detail}`);
    }
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
    // 프로필도 비움 — 로그아웃 후 맵 프로필 FAB이 '로그인'으로 동작.
    await useProfile.getState().clear();
  },

  deleteAccount: async () => {
    // TODO(P2): 서버측 계정/데이터 영구 삭제 호출 위치
    //   await supabase.functions.invoke('delete-account')  // service-role
    // 위 서버 삭제 성공 후 아래 로컬 teardown 진행하도록 확장.
    // P1(목업): signOut과 동일한 로컬 teardown — 세션/소셜/프로필 전면 비움.
    await supabase.auth.signOut();
    await AsyncStorage.removeItem(MOCK_STORAGE_KEY);
    try {
      await GoogleSignin.signOut();
    } catch {
      // Google 미로그인 상태면 무시
    }
    set({ user: null });
    await useProfile.getState().clear();
  },
}));
