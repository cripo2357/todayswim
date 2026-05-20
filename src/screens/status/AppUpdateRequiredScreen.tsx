// Figma 77:1636 — 앱 업데이트 필요 (강제).
// 일러스트 + 브랜드(파랑 outline) 배지 "{버전 안내}" + 헤딩/바디 + "앱 업데이트" 버튼.
// 스토어 URL은 호출자가 navigation.navigate('AppUpdateRequired', { iosUrl, androidUrl, versionLabel })로 주입.

import React from 'react';
import { Linking, Platform, Alert } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { Smartphone, Download } from 'lucide-react-native';

import { StatusScreen } from '@/components/layout/StatusScreen';
import type { RootStackParamList } from '@/navigation/types';
import IllustAppUpdate from '@assets/illustrations/app-update.svg';

const BRAND = '#2563EB';

export function AppUpdateRequiredScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'AppUpdateRequired'>>();
  const versionLabel = route.params?.versionLabel ?? '새 버전이 있어요';
  const iosUrl = route.params?.iosUrl;
  const androidUrl = route.params?.androidUrl;

  const onUpdate = () => {
    const url = Platform.OS === 'ios' ? iosUrl : androidUrl;
    if (!url) {
      Alert.alert('스토어 정보가 없어요', '잠시 후 다시 시도해주세요.');
      return;
    }
    Linking.openURL(url).catch(() => {
      Alert.alert('스토어를 열 수 없어요', url);
    });
  };

  return (
    <StatusScreen
      illustration={<IllustAppUpdate width="100%" height="100%" />}
      badgeIcon={<Smartphone size={16} color={BRAND} strokeWidth={2} />}
      badgeText={versionLabel}
      badgeVariant="brand"
      heading="앱 업데이트 필요"
      body="서비스 이용을 위해 앱 업데이트가 필요합니다."
      buttonIcon={<Download size={20} color="#FFFFFF" strokeWidth={2} />}
      buttonLabel="앱 업데이트"
      onButtonPress={onUpdate}
    />
  );
}
