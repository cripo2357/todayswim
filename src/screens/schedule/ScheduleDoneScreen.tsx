// Figma: 5:19712 (자유수영 시간표 등록 요청 완료)
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RequestComplete } from '@/components/feedback/RequestComplete';
import type { RootStackParamList } from '@/navigation/types';

export function ScheduleDoneScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <RequestComplete
      title="자유수영 시간표 등록 요청 완료"
      description={'시간표를 작성해주셔서 감사합니다.\n관리자가 확인 후 등록할 예정입니다.'}
      ctaLabel="알겠습니다"
      onCtaPress={() => navigation.popToTop()}
    />
  );
}
