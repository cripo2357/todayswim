// 네트워크 오프라인 감지 → ErrorNoInternet 화면으로 navigation.reset.
//
// UI는 ErrorNoInternetScreen이 단일 소스로 그림 (이전 인라인 중복 제거).
// 복귀(온라인 전환)는 사용자가 ErrorNoInternet의 "새로 고침" 버튼으로 트리거 — 자동 복귀 X.
// (자동 복귀 시 진행 중이던 화면 상태가 사라져서 혼란).
//
// ⚠️ expo-network는 네이티브 모듈 — dev 클라이언트가 그 모듈 없는 빌드면 호출 시 throw.
// memory pending_native_batch / expo-clipboard 동일 패턴: top-level import 금지,
// useEffect 내부 dynamic import + try/catch 로 격리.

import React from 'react';
import { navigationRef } from '@/navigation/navigationRef';

// 게이트가 가로채지 않아야 하는 화면 — Splash 초기 / 이미 ErrorNoInternet / 점검 / 업데이트 게이트 위에선
// 중복 reset 금지.
const PASSTHROUGH_ROUTES = new Set([
  'Splash',
  'ErrorNoInternet',
  'Maintenance',
  'AppUpdateRequired',
]);

interface NetworkState {
  isConnected?: boolean | null;
  isInternetReachable?: boolean | null;
}

function isOfflineState(s: NetworkState): boolean {
  return (
    s.isConnected === false ||
    (s.isConnected === true && s.isInternetReachable === false)
  );
}

export function OfflineGate() {
  const [isOffline, setIsOffline] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    let subscription: { remove?: () => void } | null = null;

    (async () => {
      try {
        const Network = await import('expo-network');
        // 초기 1회 상태 확인
        const initial = await Network.getNetworkStateAsync();
        if (!mounted) return;
        setIsOffline(isOfflineState(initial));
        // 이후 변경 구독
        subscription = Network.addNetworkStateListener((s) => {
          if (!mounted) return;
          setIsOffline(isOfflineState(s));
        });
      } catch {
        // expo-network 네이티브 모듈이 dev 클라이언트에 없을 때 — 조용히 비활성.
        // 다음 EAS dev 빌드에 포함되면 자동으로 활성화.
      }
    })();

    return () => {
      mounted = false;
      subscription?.remove?.();
    };
  }, []);

  React.useEffect(() => {
    if (!isOffline) return;
    if (!navigationRef.isReady()) return;
    const current = navigationRef.getCurrentRoute()?.name;
    if (current && PASSTHROUGH_ROUTES.has(current)) return;
    navigationRef.reset({ index: 0, routes: [{ name: 'ErrorNoInternet' }] });
  }, [isOffline]);

  return null;
}
