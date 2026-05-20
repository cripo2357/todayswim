// Figma 77:1064 — 404 페이지를 찾을 수 없음.
// 좌상단 백 화살표(404만), 일러스트 + 빨강 배지 "상태 코드: 404" + 헤딩/바디 + "홈으로 이동" 버튼.

import React from 'react';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { AlertCircle, Home } from 'lucide-react-native';

import { StatusScreen } from '@/components/layout/StatusScreen';
import type { RootStackParamList } from '@/navigation/types';
import Illust404 from '@assets/illustrations/error-404.svg';

const DESTRUCTIVE = '#F43F5E';

export function ErrorNotFoundScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const goHome = () => {
    navigation.reset({ index: 0, routes: [{ name: 'MapMain' }] });
  };

  return (
    <StatusScreen
      illustration={<Illust404 width="100%" height="100%" />}
      badgeIcon={<AlertCircle size={16} color={DESTRUCTIVE} strokeWidth={2} />}
      badgeText="상태 코드: 404"
      heading="페이지 찾을 수 없음"
      body={'이 페이지를 찾을 수 없습니다.\n나중에 다시 시도하세요.'}
      buttonIcon={<Home size={20} color="#FFFFFF" strokeWidth={2} />}
      buttonLabel="홈으로 이동"
      onButtonPress={goHome}
      showBack
    />
  );
}
