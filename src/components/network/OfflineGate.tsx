// 네트워크 오프라인 감지 → ErrorNoInternet 화면으로 navigation.reset.
//
// UI는 ErrorNoInternetScreen이 단일 소스로 그림 (이전 인라인 중복 제거).
// expo-network의 useNetworkState로 OS 이벤트 구독, navigationRef로 컨테이너 바깥에서 reset.
// 복귀(온라인 전환)는 사용자가 ErrorNoInternet의 "새로 고침" 버튼으로 트리거 — 자동 복귀 X.
// (자동 복귀 시 진행 중이던 화면 상태가 사라져서 혼란).

import React from 'react';
import * as Network from 'expo-network';
import { navigationRef } from '@/navigation/navigationRef';

// 게이트가 가로채지 않아야 하는 화면 — Splash 초기/이미 ErrorNoInternet/점검/업데이트 게이트 위에선
// 중복 reset 금지.
const PASSTHROUGH_ROUTES = new Set([
  'Splash',
  'ErrorNoInternet',
  'Maintenance',
  'AppUpdateRequired',
]);

export function OfflineGate() {
  const state = Network.useNetworkState();

  const isOffline =
    state.isConnected === false ||
    (state.isConnected === true && state.isInternetReachable === false);

  React.useEffect(() => {
    if (!isOffline) return;
    if (!navigationRef.isReady()) return;
    const current = navigationRef.getCurrentRoute()?.name;
    if (current && PASSTHROUGH_ROUTES.has(current)) return;
    navigationRef.reset({ index: 0, routes: [{ name: 'ErrorNoInternet' }] });
  }, [isOffline]);

  return null;
}
