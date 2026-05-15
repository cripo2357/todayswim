// Figma: 5:18464 (수영장 추가 요청 완료) / 38:766 (수영장 정보 수정 요청 완료)
import React from 'react';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RequestComplete } from '@/components/feedback/RequestComplete';
import type { RootStackParamList } from '@/navigation/types';

export function PoolDoneScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'PoolDone'>>();
  const isEdit = route.params?.mode === 'edit';

  const title = isEdit ? '수영장 정보 수정 요청 완료' : '수영장 추가 요청 완료';
  // Figma 90:6703 / 90:6914
  const description = isEdit
    ? '수정 요청을 관리자가 확인 후\n업데이트할 예정입니다.'
    : '추가 요청을 관리자가 확인 후\n업데이트할 예정입니다.';

  return (
    <RequestComplete
      title={title}
      description={description}
      ctaLabel="알겠습니다"
      // popToTop은 Splash로 가버리므로 MapMain으로 navigate.
      onCtaPress={() => navigation.navigate('MapMain')}
    />
  );
}
