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
      description={'자유수영 시간표를 관리자가 확인 후\n업데이트할 예정입니다.'}
      ctaLabel="알겠습니다"
      onCtaPress={() => navigation.popToTop()}
    />
  );
}
