/**
 * 인증 상태 — Supabase Auth 기반.
 *
 *  - Google: 네이티브 SDK(@react-native-google-signin)로 idToken 받아
 *            supabase.auth.signInWithIdToken({ provider: 'google' }) 교환.
 *  - Kakao : supabase.auth.signInWithOAuth({ provider: 'kakao' }) +
 *            expo-web-browser 인앱 브라우저 + PKCE code 교환.
 *  - Apple : 미지원(향후 iOS 도입 예정). 약관에도 "현재 미운영"으로 명시.
 *
 * 세션은 supabase-js가 AsyncStorage에 영속(persistSession) — 앱 재시작 복원/자동 갱신.
 * user 상태는 supabase 세션에서 파생하며 onAuthStateChange로 추적한다.
 */
import { create } from 'zustand';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useProfile } from '@/store/profile';
import { resetUserScopedState } from '@/lib/resetUserState';
import { tryFetchProfileByAuthUid } from '@/lib/profileSync';
import { setSentryUser } from '@/lib/sentry';
import {
  registerForPush,
  unregisterCurrentDevice,
} from '@/lib/pushNotifications';

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
  signOut: () => Promise<void>;
  /**
   * 회원 탈퇴 (Figma 201:8341/10281/10428).
   *
   * P3 구현: Edge Function `delete-account` 호출로 서버측 영구 삭제 후
   * 로컬 teardown. service_role 권한이 필요한 부분(auth.users / profiles /
   * Storage 정리) 은 함수 안에서 처리된다.
   *
   * 즉시 삭제: auth.users / profiles (CASCADE → donations) / avatars Storage
   * 보존(90일 후 별도 cron): notifications / profile_nicknames
   * 회계 보존(5년): donation_payments (FK SET NULL)
   *
   * Edge Function 호출 실패 시 로컬 teardown 도 진행 안 함 — 사용자에게
   * 실패 노출하고 재시도 유도(이미 일부 데이터만 사라지는 부분 실패 회피).
   */
  deleteAccount: () => Promise<void>;
  hydrate: () => Promise<void>;
}

// Google idToken 발급용 — Google Cloud "웹 애플리케이션" OAuth 클라이언트 ID.
// (Android/iOS 클라이언트가 아니라 웹 클라이언트 ID여야 supabase가 검증 가능.)
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

let googleConfigured = false;
function ensureGoogleConfigured() {
  if (googleConfigured) return;
  GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID });
  googleConfigured = true;
}

/** 소셜 프로필 이미지 URL 정규화 — 평문 http → https 승격(Android cleartext
 *  차단 회피). 카카오 기본 이미지(http://k.kakaocdn.net/...) 대응. 빈 값은 undefined. */
function normalizePhotoUrl(url: unknown): string | undefined {
  if (typeof url !== 'string' || !url) return undefined;
  return url.startsWith('http://') ? 'https://' + url.slice('http://'.length) : url;
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
    // 카카오 프로필 이미지는 http://k.kakaocdn.net/... (평문)로 오는데 Android는
    // cleartext 차단이라 로드 실패 → https 로 승격(k.kakaocdn은 https 지원).
    photoUrl: normalizePhotoUrl(meta.avatar_url ?? meta.picture),
  };
}

/**
 * auth 세션이 들어왔을 때 본인 profile 자동 복구(0059 binding).
 *
 * 호출 시점: hydrate 직후 / SIGNED_IN 이벤트 / signInWithGoogle·Kakao 성공 직후.
 * - 서버 profiles에서 auth_uid 일치 row → useProfile에 setState → 다음 가드(MapMain)
 *   가 자동 통과(기존 사용자 = 즉시 로그인).
 * - 없으면 신규 가입자 — useProfile 비워둠(가입 가드가 ProfileSetup으로 분기).
 * - 로컬 AsyncStorage profile은 useProfile.save가 별도로 처리 — 이 helper는
 *   서버 fetch 결과만 적재(없으면 비움).
 */
async function syncProfileFromAuth(session: Session | null): Promise<void> {
  const uid = session?.user?.id;
  if (!uid) return; // 비로그인 세션 — 그대로
  const fetched = await tryFetchProfileByAuthUid(uid);
  if (fetched) {
    // setState는 AsyncStorage save 안 거치고 메모리만 갱신 — 다음 useProfile.save
    // 호출 시 자동으로 영속화(서버는 이미 권위).
    useProfile.setState({ profile: fetched, hydrated: true });
  }
  // 없으면 그대로 두기 — 신규 가입자라 ProfileSetup 흐름 진입.
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  hydrated: false,

  hydrate: async () => {
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        set({ user: userFromSession(data.session), hydrated: true });
        // 0059 binding — 세션이 있으면 본인 profile 자동 복구(있을 때만).
        await syncProfileFromAuth(data.session);
      } else {
        // Supabase 세션 없음 — 비로그인(게스트).
        set({ user: null, hydrated: true });
      }
      // 이후 세션 변화(자동 갱신/로그아웃) 추적.
      supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
          set({ user: userFromSession(session) });
          // Sentry 사용자 식별 — auth.uid 만 박아 크래시 보고에 묶임(PII 미전송).
          setSentryUser(session.user.id);
          // SIGNED_IN/TOKEN_REFRESHED 어떤 경우든 binding 복구 시도.
          void syncProfileFromAuth(session);
          // 푸시 토큰 등록 — SIGNED_IN 이벤트일 때만(TOKEN_REFRESHED 매번 X).
          if (event === 'SIGNED_IN') {
            void registerForPush(session.user.id);
          }
        } else {
          setSentryUser(null);
        }
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
      await syncProfileFromAuth(data.session); // 0059 binding
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
    await syncProfileFromAuth(sess.session); // 0059 binding
  },

  signOut: async () => {
    // 푸시 토큰 정리는 fire-and-forget — getExpoPushTokenAsync 가 Expo
    // 서버 round-trip 이라 await 시 로그아웃 체감이 수초 멈춤. 함수 자체가
    // try/catch best-effort 라 실패해도 stale row 만 남고 다음 등록 때 갱신.
    void unregisterCurrentDevice();
    // scope:'local' — 디바이스 세션만 즉시 무효화(서버 round-trip 없음).
    // 다른 디바이스 세션은 살려둠 — 본인 로그아웃 UX 최우선.
    await supabase.auth.signOut({ scope: 'local' });
    try {
      await GoogleSignin.signOut();
    } catch {
      // Google 미로그인 상태면 무시
    }
    set({ user: null });
    // 계정 스코프 로컬 상태 전면 초기화 — 프로필·즐겨찾기·내 일정·친구·설정·
    // 동의까지(다음 사용자/게스트에게 잔존 방지). 맵 프로필 FAB도 '로그인'으로.
    await resetUserScopedState();
  },

  deleteAccount: async () => {
    // P3: 서버 영구 삭제 → 로컬 teardown.
    //
    // Edge Function 이 service_role 로 (auth.users · profiles CASCADE
    // donations · Storage avatars/{uid}/) 일괄 삭제. JWT 는 supabase-js 가
    // 현재 세션의 access_token 을 functions.invoke 호출 시 자동 첨부.
    // 세션이 없으면(이미 만료 등) 서버 호출 없이 로컬 teardown 만 진행.
    const { data: sess } = await supabase.auth.getSession();
    if (sess.session) {
      const { data, error } = await supabase.functions.invoke(
        'delete-account',
      );
      if (error) {
        // 서버 삭제 실패 — 로컬은 그대로 두고 사용자에게 노출.
        // 부분 삭제 회피: auth.users 가 살아있는데 profiles 만 사라지는
        // 식의 불일치 방지.
        throw new Error(
          `회원 탈퇴 서버 처리 실패 — ${error.message ?? String(error)}`,
        );
      }
      // 응답 본문에서 deleted=false 면 핵심 단계 실패 — 동일하게 throw.
      const payload = data as { deleted?: boolean; errors?: unknown[] } | null;
      if (payload && payload.deleted === false) {
        throw new Error(
          `회원 탈퇴 서버 처리 실패 — ${JSON.stringify(payload.errors ?? [])}`,
        );
      }
    }
    // 로컬 teardown — 세션/소셜/프로필 전면 비움.
    await supabase.auth.signOut();
    try {
      await GoogleSignin.signOut();
    } catch {
      // Google 미로그인 상태면 무시
    }
    set({ user: null });
    // 탈퇴는 계정 파괴 — 약관 동의(로컬)까지 비워 재가입 시 완전 신규로
    // 약관을 다시 받게 한다(서버 동의는 계정과 함께 사라짐).
    await resetUserScopedState({ clearConsent: true });
  },
}));
