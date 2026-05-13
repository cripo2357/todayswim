// 네트워크 오프라인 감지 → ErrorNoInternetScreen 자동 오버레이.
//
// Naver Maps SDK 호출과 Supabase fetch가 모두 인터넷 필요 → 오프라인이면 빈 지도/데이터.
// 사용자 혼란 방지 위해 전체 화면을 ErrorNoInternet으로 가림.
// 네트워크 복구 시 자동으로 가림 해제 (children 다시 노출).

import React from 'react';
import { View, Text, Pressable, StyleSheet, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Network from 'expo-network';
import { useQueryClient } from '@tanstack/react-query';
import { WifiOff, RefreshCw } from 'lucide-react-native';
import { tokens } from '@/styles/tokens';

const DESTRUCTIVE = '#F43F5E';

interface Props {
  children: React.ReactNode;
}

export function OfflineGate({ children }: Props) {
  const state = Network.useNetworkState();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();

  // 초기 undefined 상태에선 자식 그대로 렌더 (false positive 방지).
  // 명시적으로 isConnected === false 또는 isInternetReachable === false 일 때만 오프라인.
  const isOffline =
    state.isConnected === false ||
    (state.isConnected === true && state.isInternetReachable === false);

  if (!isOffline) return <>{children}</>;

  const onRetry = () => {
    // 캐시 invalidate — 네트워크 복구 시 자동으로 다시 fetch 시도.
    // 네트워크 상태 자체는 useNetworkState가 OS event로 자동 업데이트됨.
    queryClient.invalidateQueries();
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.center, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.content}>
          {/* TODO: assets/illustrations/error-internet.svg export 후 일러스트 위에 추가 */}
          <View style={styles.illustPlaceholder} />

          <View style={styles.textBlock}>
            <View style={styles.badge}>
              <WifiOff size={16} color={DESTRUCTIVE} strokeWidth={2} />
              <Text style={styles.badgeText}>연결해 주세요</Text>
            </View>

            <View style={styles.headingBlock}>
              <Text style={styles.heading}>인터넷 연결 없음</Text>
              <Text style={styles.body}>인터넷에 연결되었는지 확인하세요.</Text>
            </View>

            <Pressable
              onPress={onRetry}
              style={({ pressed }) => [styles.button, pressed && { opacity: 0.85 }]}
              accessibilityRole="button"
              accessibilityLabel="새로 고침"
            >
              <RefreshCw size={20} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.buttonLabel}>새로 고침</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const CONTENT_W = 343;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: tokens.color.white,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  content: {
    width: CONTENT_W,
    maxWidth: '100%',
    gap: 32,
  },
  illustPlaceholder: {
    width: '100%',
    height: 280,
    backgroundColor: tokens.color.bgSubtle,
    borderRadius: 16,
  },
  textBlock: {
    gap: 24,
    alignItems: 'center',
    width: '100%',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#FFF1F2',
  },
  badgeText: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansMedium,
    color: DESTRUCTIVE,
    textAlign: 'center',
  },
  headingBlock: {
    gap: 12,
    alignItems: 'center',
    width: '100%',
  },
  heading: {
    fontSize: 30,
    lineHeight: 38,
    letterSpacing: -0.39,
    fontFamily: tokens.font.sansBold,
    color: '#1F2937',
    textAlign: 'center',
    width: '100%',
  },
  body: {
    fontSize: 16,
    lineHeight: 26,
    fontFamily: tokens.font.sans,
    color: '#4B5563',
    textAlign: 'center',
    width: '100%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    minHeight: 48,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: tokens.color.brandBlue,
  },
  buttonLabel: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.white,
  },
});
