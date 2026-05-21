import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
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
import { useFonts } from '@/hooks/useFonts';
import { usePoolFilter } from '@/store/poolFilter';
import { useSelection } from '@/store/selection';
import { useAuth } from '@/store/auth';
import { useProfile } from '@/store/profile';
import { useSwimSchedules } from '@/store/swimSchedule';
import { usePrefs } from '@/store/prefs';
import { useFavorites } from '@/store/favorites';
import { tokens } from '@/styles/tokens';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, retry: 1 } },
});

// Sentry — DSN(EXPO_PUBLIC_SENTRY_DSN) 있을 때만 활성. 없으면 no-op.
// app.config plugins 에 '@sentry/react-native/expo' 등록됐고, JS 에러는
// init 직후부터 보고. 네이티브 크래시는 다음 EAS 빌드 후 동작.
initSentry();

// Deep link 게이트. 매칭되는 경로가 없으면 ErrorNotFound 로 fallback.
// 현재 매칭 스크린 없음 — poolsday://... 들어오면 무조건 404 라우트로 처리.
// 신규 deep link 추가 시 config.screens 에 매칭 규칙 등록.
const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['poolsday://'],
  config: { screens: {} },
  getStateFromPath: (path, options) => {
    const state = getStateFromPath(path, options);
    if (!state || state.routes.length === 0) {
      return { routes: [{ name: 'ErrorNotFound' }] };
    }
    return state;
  },
};

export default function App() {
  const [fontsLoaded, fontError] = useFonts();

  // 앱 (재)시동 시 필터·선택 상태 초기화 + 인증 세션 복원.
  React.useEffect(() => {
    usePoolFilter.getState().clearAll();
    useSelection.getState().select(null);
    // AsyncStorage에 저장된 mock 세션 복원 — Splash에서 분기 처리.
    useAuth.getState().hydrate();
    useProfile.getState().hydrate();
    useSwimSchedules.getState().hydrate();
    usePrefs.getState().hydrate();
    useFavorites.getState().hydrate();
    // P2: mock 친구 61명을 서버 profiles에 한 번만 시드(best-effort, silent).
    // mockData.ts 변경 시 seedMockProfiles의 SEED_KEY versioning으로 재시드.
    void import('@/lib/seedMockProfiles').then((m) => m.seedMockProfilesOnce());
  }, []);

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
          <NavigationContainer ref={navigationRef} linking={linking}>
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
