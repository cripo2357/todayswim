// Figma: 5:18464 (수영장 등록/수정 요청 완료)
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { AppHeader } from '@/components/layout/AppHeader';
import { RequestComplete } from '@/components/feedback/RequestComplete';
import type { RootStackParamList } from '@/navigation/types';

export function PoolDoneScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <ScreenContainer withHorizontalPadding={false}>
      <AppHeader showBack={false} />
      <RequestComplete
        title="수영장 등록/수정 요청 완료"
        description="등록/수정을 요청해주신 수영장을 관리자가 확인 후 등록할 예정입니다."
        ctaLabel="완료"
        onCtaPress={() => navigation.popToTop()}
      />
    </ScreenContainer>
  );
}
