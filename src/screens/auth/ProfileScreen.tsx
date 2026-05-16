// Figma 117:2556 — 프로필 (설정 > 프로필 진입).
//
// 기능은 내 정보(MyInfo)의 프로필 탭과 동일 — ProfileTab을 그대로 재사용하고
// 위치만 변경(독립 화면화). 헤더는 뒤로 + "프로필" (탭/설정 아이콘 없음).

import React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '@/navigation/types';
import { useProfile } from '@/store/profile';
import type { UserProfile } from '@/store/profile';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { ProfileTab } from '@/screens/auth/MyInfoScreen';
import { tokens } from '@/styles/tokens';

export function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const profile = useProfile((s) => s.profile);
  const saveProfile = useProfile((s) => s.save);

  // profile 없으면(비정상 진입) 안전하게 뒤로.
  React.useEffect(() => {
    if (!profile) navigation.goBack();
  }, [profile, navigation]);
  if (!profile) return null;

  const patch = (p: Partial<UserProfile>) => saveProfile({ ...profile, ...p });

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ScreenHeader title="프로필" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ProfileTab profile={profile} patch={patch} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.color.bgPaper },
  flex: { flex: 1 },
});
