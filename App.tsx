import React from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
import {
  NavigationContainer,
  getStateFromPath,
  type LinkingOptions,
} from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { RootNavigator } from '@/navigation/RootNavigator';
import { navigationRef } from '@/navigation/navigationRef';
import type { RootStackParamList } from '@/navigation/types';
import { GlobalAddScheduleSheet } from '@/components/calendar/GlobalAddScheduleSheet';
import { OfflineGate } from '@/components/network/OfflineGate';
import { RuntimeStatusGate } from '@/components/status/RuntimeStatusGate';
import { initSentry, SentryErrorBoundary } from '@/lib/sentry';
import { initAnalytics, logScreen } from '@/lib/analytics';
import { maybeSendMonthlySummary } from '@/lib/monthlySummary';
import { setupPushNotificationRouting } from '@/lib/pushNotifications';
import { useNotificationsRealtime } from '@/hooks/useNotifications';
import { useSingleDeviceGuard } from '@/hooks/useSingleDeviceGuard';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from '@/hooks/useFonts';
import { usePoolFilter } from '@/store/poolFilter';
import { useSelection } from '@/store/selection';
import { useAuth } from '@/store/auth';
import { useProfile } from '@/store/profile';
import { useSwimSchedules } from '@/store/swimSchedule';
import { useFriends } from '@/store/friends';
import { usePrefs } from '@/store/prefs';
import { useFavorites } from '@/store/favorites';
import { resetUserScopedState } from '@/lib/resetUserState';
import { allBundleAvatarUrls } from '@/lib/avatars';
import { tokens } from '@/styles/tokens';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, retry: 1 } },
});

// Sentry — DSN(EXPO_PUBLIC_SENTRY_DSN) 있을 때만 활성. 없으면 no-op.
// app.config plugins 에 '@sentry/react-native/expo' 등록됐고, JS 에러는
// init 직후부터 보고. 네이티브 크래시는 다음 EAS 빌드 후 동작.
initSentry();

// Firebase Analytics — 익명 통계. GoogleService-Info.plist /
// google-services.json + @react-native-firebase/* 패키지 모두 갖춰진
// EAS 빌드에서만 활성화, 그 외(Expo Go·미배치 상태)는 silent no-op.
initAnalytics();

// 네이티브 스플래시 (JS 로드 전) — 폰트 로드 완료까지 가시 유지. 자동 hide
// 막아두고 fontsLoaded 시점에 명시적 hideAsync 호출 → JS SplashScreen 인계.
// 실패는 silent(개발 환경·EAS 빌드 안 된 dev 클라이언트 등에서 native module
// 부재 시).
void SplashScreen.preventAutoHideAsync().catch(() => {});

// Deep link 게이트. 매칭되는 경로가 없으면 ErrorNotFound 로 fallback.
// 현재 매칭 스크린 없음 — poolsday://... 들어오면 무조건 404 라우트로 처리.
// 신규 deep link 추가 시 config.screens 에 매칭 규칙 등록.
//
// 예외: `auth/callback` (OAuth deep link) — signInWithKakao 의
// openAuthSessionAsync 가 in-app browser close detection 으로 직접 처리.
// 하지만 OS 가 race condition 으로 같은 deep link 를 NavigationContainer
// 에도 보낼 수 있어 (Android Chrome Custom Tab + ASWebAuthenticationSession).
// 그 경우 ErrorNotFound 깜빡임 → undefined 반환으로 navigation 자체를
// 무시(현재 화면 유지) → OAuth 흐름은 코드 레벨에서 계속 진행.
const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['poolsday://'],
  config: { screens: {} },
  getStateFromPath: (path, options) => {
    if (path.startsWith('auth/callback')) {
      return undefined; // OAuth callback — navigation 무시, 현재 state 유지
    }
    const state = getStateFromPath(path, options);
    if (!state || state.routes.length === 0) {
      return { routes: [{ name: 'ErrorNotFound' }] };
    }
    return state;
  },
};

// notifications realtime 구독 — useQueryClient 의존이라 QueryClientProvider
// 컨텍스트 안에서 호출돼야 함. App 함수 자체는 Provider 밖이라 별도 자식
// 컴포넌트로 분리. (P3 후속 2026-05-22)
function NotificationsRealtimeBridge() {
  useNotificationsRealtime();
  return null;
}

// 단일 기기 정책 — 다른 기기 로그인 시 이 기기 자동 로그아웃. 세션 동안 활성.
function SingleDeviceGuardBridge() {
  useSingleDeviceGuard();
  return null;
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts();

  // user_schedules + friends 서버 sync — profile.id 가 생기는 시점(가입
  // 직후 / 재시동 로그인 복구)에 서버 fetch 로 로컬 교체. 다기기 동기·재설치
  // 복구. (A.2 / A.1 P3 후속, 2026-05-22)
  const profileId = useProfile((s) => s.profile?.id);
  React.useEffect(() => {
    if (profileId) {
      void (async () => {
        await useSwimSchedules.getState().serverSync();
        await useFriends.getState().serverSync();
        // 일정 동기 후 — 새 달이면 지난달 결산 1회 발송(멱등).
        void maybeSendMonthlySummary();
      })();
    }
  }, [profileId]);

  // 푸시 탭 라우팅 + 포그라운드 표시 셋업(1회) + 콜드스타트 처리.
  React.useEffect(() => {
    void setupPushNotificationRouting();
  }, []);

  // 번들 아바타(Storage 호스팅) 디스크 캐시 워밍(1회, best-effort) — 첫 렌더
  // 깜빡임 + 지도 마커 비트맵 굽기 전 미로드 방지. 받으면 디스크 캐시라 이후
  // 무네트워크. ~248KB(thumb+md 24장) 첫 실행 1회.
  React.useEffect(() => {
    for (const url of allBundleAvatarUrls()) {
      void Image.prefetch(url).catch(() => {});
    }
  }, []);

  // 앱 (재)시동 시 필터·선택 상태 초기화 + 인증 세션 복원.
  React.useEffect(() => {
    usePoolFilter.getState().clearAll();
    useSelection.getState().select(null);
    (async () => {
      // 인증 세션 복원 먼저 — 로그인 여부로 "사용자 스코프" hydrate 를 분기.
      await useAuth.getState().hydrate();
      if (useAuth.getState().user) {
        // 로그인(실세션/Apple mock) — 계정 데이터·설정 로컬 복원.
        void useProfile.getState().hydrate();
        void useSwimSchedules.getState().hydrate();
        void usePrefs.getState().hydrate();
        void useFavorites.getState().hydrate();
      } else {
        // 게스트(비로그인/세션 만료) — 이전 사용자 잔존 데이터·설정 전면 제거.
        // 명시적 로그아웃 없이 세션이 만료된 경우의 누수까지 차단.
        await resetUserScopedState();
      }
    })();
    // (P3 prod, 2026-06-02): mock 친구 서버 시드 제거 — 실 사용자 데이터만 적재.
  }, []);

  // 폰트 로드 완료(또는 에러) 시점에 네이티브 스플래시 hide → JS SplashScreen 인계.
  // 두 효과가 매끄럽게 연결되도록 동기·idempotent 호출(SplashScreen.hideAsync 는
  // 이미 hide 된 상태에서도 무해).
  React.useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={tokens.color.pool500} />
      </View>
    );
  }

  return (
    // Sentry ErrorBoundary — React 렌더 트리에서 throw 되는 에러를 잡아
    // captureException 으로 보고 + fallback UI(아무것도 안 보여줌, navigation
    // 그대로). DSN 없으면 ErrorBoundary 는 그냥 children 만 렌더.
    <SentryErrorBoundary fallback={<View />}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <NotificationsRealtimeBridge />
          <SingleDeviceGuardBridge />
          <NavigationContainer
            ref={navigationRef}
            linking={linking}
            onStateChange={() => {
              const route = navigationRef.current?.getCurrentRoute();
              if (route?.name) void logScreen(route.name);
            }}
          >
            <RootNavigator />
          </NavigationContainer>
          {/* 시간표 더블탭 → 그 자리에서 바로 일정 등록 시트(화면 이동 없음) */}
          <GlobalAddScheduleSheet />
          {/* 오프라인 감지 → ErrorNoInternet 으로 navigation.reset (side-effect only) */}
          <OfflineGate />
          {/* 런타임 점검·강제업데이트 게이트 — Splash 부팅 게이트 보완.
           *  5분 폴링 + AppState 'active' 시 즉시 재조회 → 변화 감지 시 reset. */}
          <RuntimeStatusGate />
          <StatusBar style="dark" />
        </QueryClientProvider>
      </SafeAreaProvider>
    </SentryErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: tokens.color.bgCream,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
