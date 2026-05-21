// 런타임 점검·강제업데이트 게이트.
//
// Splash 부팅 게이트(SplashScreen)는 cold-start 시 1회만 동작 — 세션 중
// 운영자가 maintenance ON 또는 min_app_version 상향 시 사용자는 앱을 재시작
// 할 때까지 알 수 없음.
//
// 본 컴포넌트는 NavigationContainer 안의 사이드이펙트 가드로,
//   1) useAppStatus 의 5분 폴링 결과를 구독
//   2) AppState 'active' (백그라운드 → 포그라운드) 전환 시 강제 invalidate
// 두 트리거로 변화를 감지 → 조건 충족 시 navigation.reset 으로 Maintenance /
// AppUpdateRequired 화면 진입.
//
// 가드(중복 reset 방지): 이미 게이트 화면 위에 있거나, Splash 진행 중이면 skip.
//
// references: SplashScreen 부팅 게이트, OfflineGate(동일 패턴), 0046 app_status.

import React from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import Constants from 'expo-constants';
import { navigationRef } from '@/navigation/navigationRef';
import { useAppStatus } from '@/hooks/useAppStatus';
import { isAppBelow } from '@/lib/version';

// 자기 자신 위에 reset 하지 않도록 — 이미 게이트 화면이면 통과.
const PASSTHROUGH_ROUTES = new Set([
  'Splash',
  'Maintenance',
  'AppUpdateRequired',
  'ErrorNoInternet',
]);

export function RuntimeStatusGate() {
  const { data: status } = useAppStatus();
  const qc = useQueryClient();

  // 포그라운드 복귀 시 status 즉시 재조회 — 백그라운드 동안 운영자 변경 반영.
  React.useEffect(() => {
    const sub = AppState.addEventListener('change', (s: AppStateStatus) => {
      if (s === 'active') {
        void qc.invalidateQueries({ queryKey: ['app_status'] });
      }
    });
    return () => sub.remove();
  }, [qc]);

  // status 변화 → 게이트 화면 reset.
  React.useEffect(() => {
    if (!status) return;
    if (!navigationRef.isReady()) return;
    const current = navigationRef.getCurrentRoute()?.name;
    if (current && PASSTHROUGH_ROUTES.has(current)) return;

    if (status.maintenanceActive) {
      navigationRef.reset({
        index: 0,
        routes: [
          {
            name: 'Maintenance',
            params: status.maintenanceLabel
              ? { reopenLabel: status.maintenanceLabel }
              : undefined,
          },
        ],
      });
      return;
    }

    const currentVersion = Constants.expoConfig?.version ?? '0.0.0';
    if (
      status.minAppVersion &&
      isAppBelow(currentVersion, status.minAppVersion)
    ) {
      navigationRef.reset({
        index: 0,
        routes: [
          {
            name: 'AppUpdateRequired',
            params: {
              versionLabel: `최소 ${status.minAppVersion} 이상`,
              iosUrl: status.iosStoreUrl ?? undefined,
              androidUrl: status.androidStoreUrl ?? undefined,
            },
          },
        ],
      });
    }
  }, [status]);

  return null;
}
