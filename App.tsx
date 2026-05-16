import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { RootNavigator } from '@/navigation/RootNavigator';
import { navigationRef } from '@/navigation/navigationRef';
import { GlobalAddScheduleSheet } from '@/components/calendar/GlobalAddScheduleSheet';
// import { OfflineGate } from '@/components/network/OfflineGate';
//   ↑ expo-network 네이티브 모듈 — EAS dev 빌드 새로 한 후에 활성화. 그 전엔 runtime not ready 에러.
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
  }, []);

  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={tokens.color.pool500} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer ref={navigationRef}>
          <RootNavigator />
        </NavigationContainer>
        {/* 시간표 더블탭 → 그 자리에서 바로 일정 등록 시트(화면 이동 없음) */}
        <GlobalAddScheduleSheet />
        <StatusBar style="dark" />
      </QueryClientProvider>
    </SafeAreaProvider>
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
