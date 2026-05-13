// Figma 77:1388 — 인터넷 연결 없음.
// 일러스트 + 빨강 배지(wifi-off) "연결해 주세요" + 헤딩/바디 + "새로 고침" 버튼.
// "새로 고침" → 이전 화면으로 돌아가 재시도 (이전 화면이 마운트되며 재fetch).

import React from 'react';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { WifiOff, RefreshCw } from 'lucide-react-native';

import { StatusScreen } from '@/components/layout/StatusScreen';
import type { RootStackParamList } from '@/navigation/types';

const DESTRUCTIVE = '#F43F5E';

export function ErrorNoInternetScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const onRetry = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.reset({ index: 0, routes: [{ name: 'MapMain' }] });
    }
  };

  return (
    <StatusScreen
      // TODO: assets/illustrations/error-internet.svg export 후 import
      badgeIcon={<WifiOff size={16} color={DESTRUCTIVE} strokeWidth={2} />}
      badgeText="연결해 주세요"
      heading="인터넷 연결 없음"
      body="인터넷에 연결되었는지 확인하세요."
      buttonIcon={<RefreshCw size={20} color="#FFFFFF" strokeWidth={2} />}
      buttonLabel="새로 고침"
      onButtonPress={onRetry}
    />
  );
}
