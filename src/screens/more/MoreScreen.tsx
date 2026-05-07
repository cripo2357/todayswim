// Figma: 5:2287 (부가 기능)
//
// more.svg 일러스트 + "무엇을 도와드릴까요?" + 2개 버튼.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { AppHeader } from '@/components/layout/AppHeader';
import { Button } from '@/components/ui/Button';
import type { RootStackParamList } from '@/navigation/types';
import { tokens } from '@/styles/tokens';
import MoreIllust from '@assets/illustrations/more.svg';

export function MoreScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <ScreenContainer withHorizontalPadding={false}>
      <AppHeader title="부가 기능" />
      <View style={styles.body}>
        <View style={styles.illustWrap}>
          <MoreIllust width={311} height={247} />
        </View>

        <Text style={styles.heading}>무엇을 도와드릴까요?</Text>

        <View style={styles.spacer} />

        <View style={styles.actions}>
          <Button
            label="수영장 등록 요청"
            size="lg"
            fullWidth
            onPress={() => navigation.navigate('PoolName', { mode: 'create' })}
          />
          <Button
            label="수영장 정보 수정 요청"
            size="lg"
            variant="secondary"
            fullWidth
            onPress={() => navigation.navigate('PoolName', { mode: 'edit' })}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingHorizontal: tokens.layout.pagePadMobile,
    paddingTop: tokens.space[8],
    paddingBottom: tokens.space[6],
    alignItems: 'center',
  },
  illustWrap: { width: 311, height: 247 },
  heading: {
    ...tokens.text.h3,
    color: tokens.color.ink900,
    textAlign: 'center',
    marginTop: tokens.space[6],
  },
  spacer: { flex: 1 },
  actions: { alignSelf: 'stretch', gap: tokens.space[2] },
});
