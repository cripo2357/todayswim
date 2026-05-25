// C클럽 — 모임/클럽 메인 화면. MapMain 우상단 FAB('C') 진입(로그인 한정).
//
// 첫 단계는 헤더만 — 모임 기능 본 스펙·디자인은 별도 트랙. 향후 모임 리스트
// (내가 만든 모임 / 가입한 모임 / 추천 모임 등) 가 본문에 채워질 자리.
//
// 색 규약: FAB·헤더 강조 색은 ink900(#0F172A) bg + pdByellow(#EAFF00) 'C'
// (Figma 노드 정합). 본 화면 UI 자체는 디자인 미정이라 표준 ScreenHeader 사용.

import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { tokens } from '@/styles/tokens';

export function ClubMainScreen() {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ScreenHeader title="C클럽" onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.placeholder} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: tokens.color.bgCream,
  },
  body: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  placeholder: {
    flex: 1,
  },
});
