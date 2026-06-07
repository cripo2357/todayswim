/**
 * 인증 상태 — Supabase Auth 기반.
 *
 *  - Google: 네이티브 SDK(@react-native-google-signin)로 idToken 받아
 *            supabase.auth.signInWithIdToken({ provider: 'google' }) 교환.
 *  - Kakao : 네이티브 SDK(@react-native-seoul/kakao-login)로 로그인(카카오톡 앱
 *            점프, 없으면 카카오계정 웹 폴백) → OIDC idToken 받아
 *            supabase.auth.signInWithIdToken({ provider: 'kakao' }) 교환.
 *            (구 방식: signInWithOAuth 웹 + PKCE — iOS 동의창에 Supabase ref
 *            노출돼 네이티브로 교체. 비즈앱·OIDC 활성 전제.)
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
import {
  login as kakaoLogin,
  logout as kakaoLogout,
} from '@react-native-seoul/kakao-login';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useProfile } from '@/store/profile';
import { resetUserScopedState } from '@/lib/resetUserState';
import { claimDevice, clearLocalDeviceId } from '@/lib/singleDevice';
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
  /** Apple (iOS 전용) — App Store 심사 4.8 필수. */
  signInWithApple: () => Promise<void>;
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

// iOS 네이티브 Google 로그인용 **iOS OAuth 클라이언트 ID**(공개값). GoogleService-
// Info.plist를 제거(Firebase 분리)했으므로, GIDSignIn이 초기화되려면 configure에
// iosClientId를 명시해야 함. 안 주면 iOS에서 로그인 시 에러. URL scheme
// (com.googleusercontent.apps.<X>)의 역순 = <X>.apps.googleusercontent.com.
// env 우선, 없으면 공개 식별자 폴백(webClientId/Naver 키와 동일 패턴).
const GOOGLE_IOS_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ??
  '790053857210-fvjcgis91j675ui8tepg00gj0ru6eq1e.apps.googleusercontent.com';

let googleConfigured = false;
function ensureGoogleConfigured() {
  if (googleConfigured) return;
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID, // iOS 전용 — Android는 무시(무해).
  });
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
          // 푸시 토큰 등록 — 새 로그인(SIGNED_IN) + 앱 콜드스타트 세션 복원
          // (INITIAL_SESSION) 둘 다. 후자가 없으면: 이미 로그인된 사용자가 푸시
          // 엔타이틀먼트 추가된 빌드로 업데이트해도 재로그인 전엔 토큰이 등록
          // 안 됨 = 푸시 안 옴. TOKEN_REFRESHED(고빈도)만 제외해 idempotent upsert.
          if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
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
      // 단일 기기 정책 — 이 기기를 활성 기기로 등록(다른 기기는 자동 로그아웃).
      await claimDevice();
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
    // 네이티브 카카오 SDK — 카카오톡 설치 시 앱으로 점프(웹 동의창 회피),
    // 없으면 SDK가 카카오계정 웹 로그인으로 자동 폴백. OIDC 활성이라 응답에
    // idToken 포함 → Supabase signInWithIdToken 으로 교환(nonce는 네이티브
    // 흐름이라 미사용 — 토큰이 redirect URL 을 안 거쳐 재전송 위험 낮음).
    // 비즈앱(account_email)·OIDC 활성 전제(둘 다 콘솔에서 ON 확인 2026-06-07).
    try {
      const token = await kakaoLogin();
      if (!token?.idToken) {
        // OIDC 미활성이면 idToken 이 비어 옴 — 콘솔 설정 누락 진단.
        throw new Error('Kakao idToken 없음 — OpenID Connect 활성화 확인 필요.');
      }
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'kakao',
        token: token.idToken,
      });
      if (error) throw error;
      set({ user: userFromSession(data.session) });
      await syncProfileFromAuth(data.session); // 0059 binding
      // 단일 기기 정책 — 이 기기를 활성 기기로 등록.
      await claimDevice();
    } catch (e) {
      // 사용자가 카카오 로그인/동의를 취소 — 조용히 무시(Google 패턴과 동일).
      const code = (e as { code?: string }).code ?? '';
      const msg = (e as { message?: string }).message ?? '';
      if (code === 'E_CANCELLED_OPERATION' || /cancel/i.test(`${code}${msg}`)) {
        return;
      }
      throw e;
    }
  },

  // Apple (iOS 전용) — expo-apple-authentication 네이티브 자격증명 →
  // supabase.auth.signInWithIdToken({ provider:'apple' }). 리플레이 방지 nonce:
  // 원본을 SHA256 해시해 Apple에 전달, 원본은 Supabase에 전달(서버가 해시 비교).
  // Apple은 이름/이메일을 최초 1회만 credential로 내려줌 — 이름이 있으면 닉네임
  // 자동채움용으로 user에 보완(이메일은 Supabase 세션이 처리).
  signInWithApple: async () => {
    try {
      const rawNonce = Crypto.randomUUID();
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        rawNonce,
      );
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });
      const idToken = credential.identityToken;
      if (!idToken) throw new Error('Apple identityToken 없음');

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: idToken,
        nonce: rawNonce,
      });
      if (error) throw error;

      let user = userFromSession(data.session);
      if (user && !user.nickname && credential.fullName) {
        const { givenName, familyName } = credential.fullName;
        // 공백 포함돼도 ProfileSetup sanitizeNickname이 제거 — 자동채움 힌트용.
        const name = [familyName, givenName].filter(Boolean).join(' ').trim();
        if (name) user = { ...user, nickname: name };
      }
      set({ user });
      await syncProfileFromAuth(data.session); // 0059 binding
      // 단일 기기 정책 — 이 기기를 활성 기기로 등록(다른 기기는 자동 로그아웃).
      await claimDevice();
    } catch (e) {
      // 사용자가 시트 닫음/취소 — 조용히 무시.
      if ((e as { code?: string }).code === 'ERR_REQUEST_CANCELED') return;
      throw e;
    }
  },

  signOut: async () => {
    // 푸시 토큰 정리는 fire-and-forget — getExpoPushTokenAsync 가 Expo
    // 서버 round-trip 이라 await 시 로그아웃 체감이 수초 멈춤. 함수 자체가
    // try/catch best-effort 라 실패해도 stale row 만 남고 다음 등록 때 갱신.
    void unregisterCurrentDevice();
    void clearLocalDeviceId(); // 단일 기기 — 로컬 기기-세션 id 제거.
    // scope:'local' — 디바이스 세션만 즉시 무효화(서버 round-trip 없음).
    // 다른 디바이스 세션은 살려둠 — 본인 로그아웃 UX 최우선.
    await supabase.auth.signOut({ scope: 'local' });
    try {
      await GoogleSignin.signOut();
    } catch {
      // Google 미로그인 상태면 무시
    }
    try {
      await kakaoLogout();
    } catch {
      // Kakao 미로그인 상태면 무시
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
