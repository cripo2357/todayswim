import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';

import { SplashScreen } from '@/screens/splash/SplashScreen';
import { MapScreen } from '@/screens/map/MapScreen';
import { ScheduleViewScreen } from '@/screens/schedule/ScheduleViewScreen';
import { ScheduleNicknameScreen } from '@/screens/schedule/ScheduleNicknameScreen';
import { ScheduleWriteScreen } from '@/screens/schedule/ScheduleWriteScreen';
import { ScheduleTimeScreen } from '@/screens/schedule/ScheduleTimeScreen';
import { ScheduleDoneScreen } from '@/screens/schedule/ScheduleDoneScreen';
import { PoolNameScreen } from '@/screens/pool-submit/PoolNameScreen';
import { PoolDoneScreen } from '@/screens/pool-submit/PoolDoneScreen';
import { MoreScreen } from '@/screens/more/MoreScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Pool's Day 루트 네비게이터.
 *
 * 헤더는 화면별로 옵션 다르므로 기본 hidden, 필요 시 각 화면이 자체 AppHeader 렌더.
 * (DESIGN.md §10-1: bg-cream 배경, 64/72px 헤더 — 통일된 헤더 컴포넌트로 처리)
 */
export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#FAFAF7' }, // bg-cream
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="MapMain" component={MapScreen} />

      <Stack.Screen name="ScheduleView" component={ScheduleViewScreen} />
      <Stack.Screen name="ScheduleNickname" component={ScheduleNicknameScreen} />
      <Stack.Screen name="ScheduleWrite" component={ScheduleWriteScreen} />
      <Stack.Screen
        name="ScheduleTime"
        component={ScheduleTimeScreen}
        options={{ presentation: 'transparentModal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="ScheduleDone" component={ScheduleDoneScreen} />

      <Stack.Screen name="PoolName" component={PoolNameScreen} />
      <Stack.Screen name="PoolDone" component={PoolDoneScreen} />

      <Stack.Screen
        name="More"
        component={MoreScreen}
        options={{
          presentation: 'transparentModal',
          animation: 'fade',
          // transparentModal이라도 contentStyle bg(#FAFAF7)가 깔리면 뒤가 안 비침 → 명시적으로 transparent
          contentStyle: { backgroundColor: 'transparent' },
        }}
      />
    </Stack.Navigator>
  );
}
