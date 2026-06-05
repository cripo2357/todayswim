// Figma 351:5786 — 다른 기기에서 접속 (단일 기기 정책 로그아웃 안내).
// 다른 기기에서 같은 계정으로 로그인 → 이 기기는 useSingleDeviceGuard가
// signOut 후 이 화면으로 reset. "알겠습니다" → 로그아웃 홈(MapMain)으로.

import React from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Clock, Check } from 'lucide-react-native';

import { StatusScreen } from '@/components/layout/StatusScreen';
import type { RootStackParamList } from '@/navigation/types';
import IllustOtherDevice from '@assets/illustrations/other-device.svg';

export function OtherDeviceLoginScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <StatusScreen
      illustration={<IllustOtherDevice width="100%" height="100%" />}
      badgeIcon={<Clock size={16} color="#F43F5E" strokeWidth={2} />}
      badgeText="로그인 소셜계정 보안 확인 필요"
      badgeVariant="destructive"
      heading="다른 기기에서 접속"
      body={
        '동일 계정으로 다른 기기에서 로그인되었습니다.\n이 기기에서는 로그아웃합니다.'
      }
      buttonIcon={<Check size={20} color="#000000" strokeWidth={2} />}
      buttonLabel="알겠습니다"
      buttonVariant="yellow"
      onButtonPress={() =>
        navigation.reset({ index: 0, routes: [{ name: 'MapMain' }] })
      }
    />
  );
}
