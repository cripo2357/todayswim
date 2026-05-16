import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';

import { SplashScreen } from '@/screens/splash/SplashScreen';
import { MapScreen } from '@/screens/map/MapScreen';
import { ScheduleViewScreen } from '@/screens/schedule/ScheduleViewScreen';
import { PoolNameScreen } from '@/screens/pool-submit/PoolNameScreen';
import { PoolDoneScreen } from '@/screens/pool-submit/PoolDoneScreen';
import { MoreScreen } from '@/screens/more/MoreScreen';
import { AnnouncementsScreen } from '@/screens/announcement/AnnouncementsScreen';
import { PoolFilterScreen } from '@/screens/filter/PoolFilterScreen';
import { PoolListScreen } from '@/screens/pool-list/PoolListScreen';
import { LoginScreen } from '@/screens/auth/LoginScreen';
import { TermsAgreementScreen } from '@/screens/auth/TermsAgreementScreen';
import { TermsServiceScreen } from '@/screens/auth/TermsServiceScreen';
import { TermsPrivacyScreen } from '@/screens/auth/TermsPrivacyScreen';
import { ProfileSetupScreen } from '@/screens/auth/ProfileSetupScreen';
import { ProfileImageScreen } from '@/screens/auth/ProfileImageScreen';
import { MyInfoScreen } from '@/screens/auth/MyInfoScreen';
import { SettingsScreen } from '@/screens/settings/SettingsScreen';
import { ProfileScreen } from '@/screens/auth/ProfileScreen';
import { InviteFriendsScreen } from '@/screens/invite/InviteFriendsScreen';
import { InviteDoneScreen } from '@/screens/invite/InviteDoneScreen';
import { WelcomeScreen } from '@/screens/auth/WelcomeScreen';
import { ErrorNotFoundScreen } from '@/screens/status/ErrorNotFoundScreen';
import { ErrorNoInternetScreen } from '@/screens/status/ErrorNoInternetScreen';
import { MaintenanceScreen } from '@/screens/status/MaintenanceScreen';
import { AppUpdateRequiredScreen } from '@/screens/status/AppUpdateRequiredScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Dim 모달 표시 옵션. 뒤 화면이 비치게 transparent presentation + contentStyle bg 투명.
 * ModalCard 컴포넌트는 자체적으로 반투명 dim 백드롭을 그림.
 */
const DIM_MODAL_OPTIONS = {
  presentation: 'transparentModal',
  animation: 'fade',
  contentStyle: { backgroundColor: 'transparent' },
} as const;

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
      {/* Splash → MapMain은 제자리 페이드. 두 화면 모두 animation 'fade'로 설정해서
       *  Splash가 왼쪽으로 슬라이드해 사라지지 않고, Map도 오른쪽에서 슬라이드해 등장하지 않도록 한다. */}
      <Stack.Screen
        name="Splash"
        component={SplashScreen}
        options={{ animation: 'fade' }}
      />
      <Stack.Screen
        name="MapMain"
        component={MapScreen}
        options={{ animation: 'fade' }}
      />

      {/* Dim 모달 오버레이 — 뒤 화면이 비치게 transparentModal + contentStyle transparent */}
      <Stack.Screen
        name="ScheduleView"
        component={ScheduleViewScreen}
        options={DIM_MODAL_OPTIONS}
      />

      <Stack.Screen name="PoolName" component={PoolNameScreen} />
      <Stack.Screen
        name="PoolDone"
        component={PoolDoneScreen}
        options={DIM_MODAL_OPTIONS}
      />

      <Stack.Screen
        name="More"
        component={MoreScreen}
        options={DIM_MODAL_OPTIONS}
      />
      <Stack.Screen name="Announcements" component={AnnouncementsScreen} />

      <Stack.Screen name="PoolFilter" component={PoolFilterScreen} />

      <Stack.Screen name="PoolList" component={PoolListScreen} />

      {/* 인증 / 약관 */}
      <Stack.Screen name="Login" component={LoginScreen} options={{ animation: 'fade' }} />
      <Stack.Screen name="TermsAgreement" component={TermsAgreementScreen} />
      <Stack.Screen name="TermsService" component={TermsServiceScreen} />
      <Stack.Screen name="TermsPrivacy" component={TermsPrivacyScreen} />
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      <Stack.Screen name="ProfileImage" component={ProfileImageScreen} />
      <Stack.Screen name="MyInfo" component={MyInfoScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen
        name="InviteFriends"
        component={InviteFriendsScreen}
        options={DIM_MODAL_OPTIONS}
      />
      <Stack.Screen
        name="InviteDone"
        component={InviteDoneScreen}
        options={DIM_MODAL_OPTIONS}
      />
      <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ animation: 'fade' }} />

      {/* 상태/오류/점검/강제 업데이트 — gestureEnabled 차단(블로킹 화면) */}
      <Stack.Screen name="ErrorNotFound" component={ErrorNotFoundScreen} />
      <Stack.Screen
        name="ErrorNoInternet"
        component={ErrorNoInternetScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="Maintenance"
        component={MaintenanceScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="AppUpdateRequired"
        component={AppUpdateRequiredScreen}
        options={{ gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
}
