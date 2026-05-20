// Figma 77:1462 — 서비스 점검 중.
// 일러스트 + 빨강 배지(시계) "{재오픈 시각}" + 헤딩/바디 + "서비스 종료" 버튼.
// 점검 정보(reopenLabel)는 호출자가 navigation.navigate('Maintenance', { reopenLabel })로 주입.

import React from 'react';
import { BackHandler, Platform } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { Clock, LogOut } from 'lucide-react-native';

import { StatusScreen } from '@/components/layout/StatusScreen';
import type { RootStackParamList } from '@/navigation/types';
import IllustMaintenance from '@assets/illustrations/maintenance.svg';

const DESTRUCTIVE = '#F43F5E';

export function MaintenanceScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'Maintenance'>>();
  const reopenLabel = route.params?.reopenLabel ?? '잠시 후 다시 오세요';

  // iOS는 앱 종료 API가 없어 사용자가 수동으로 닫도록 안내. Android는 BackHandler.exitApp 가능.
  const onClose = () => {
    if (Platform.OS === 'android') {
      BackHandler.exitApp();
    }
  };

  return (
    <StatusScreen
      illustration={<IllustMaintenance width="100%" height="100%" />}
      badgeIcon={<Clock size={16} color={DESTRUCTIVE} strokeWidth={2} />}
      badgeText={reopenLabel}
      heading="서비스 점검 중"
      body={'지금은 서비스 점검 시간입니다.\n나중에 다시 시도하세요.'}
      buttonIcon={<LogOut size={20} color="#FFFFFF" strokeWidth={2} />}
      buttonLabel="서비스 종료"
      onButtonPress={onClose}
    />
  );
}
