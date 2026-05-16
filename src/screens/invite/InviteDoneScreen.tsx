// Figma 129:3779 — 수영 초대장 보내기 완료 (dim 모달).
// RequestComplete 공통 컴포넌트 재사용 (일러스트는 공통 request-complete).

import React from 'react';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RequestComplete } from '@/components/feedback/RequestComplete';
import type { RootStackParamList } from '@/navigation/types';

export function InviteDoneScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'InviteDone'>>();
  const count = route.params?.count ?? 0;

  return (
    <RequestComplete
      title="수영 초대장 보내기 완료"
      description={`${count}명의 친구에게 초대장을 보냈습니다.`}
      ctaLabel="알겠습니다"
      onCtaPress={() => navigation.navigate('MyInfo')}
    />
  );
}
