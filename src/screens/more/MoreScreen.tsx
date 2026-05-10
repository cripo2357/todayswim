// Figma: 5:2287 (부가 기능)
//
// dark backdrop + centered card + 일러스트 + "무엇을 도와드릴까요?" + 4개 outline 버튼.

import React from 'react';
import { View, Text, StyleSheet, Linking, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ModalCard } from '@/components/layout/ModalCard';
import { Button } from '@/components/ui/Button';
import type { RootStackParamList } from '@/navigation/types';
import { tokens } from '@/styles/tokens';
import MoreIllust from '@assets/illustrations/more.svg';

const FEEDBACK_EMAIL = 'cripo2357@gmail.com';

export function MoreScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const sendMail = (subject: string) => {
    const url = `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(subject)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('메일 앱을 열 수 없어요', `직접 ${FEEDBACK_EMAIL} 로 보내주세요.`);
    });
  };

  return (
    <ModalCard
      onBackdropPress={() => navigation.goBack()}
      withCardPadding={false}
    >
      <View style={styles.body}>
        <View style={styles.illustWrap}>
          <MoreIllust width={220} height={175} />
        </View>

        <Text style={styles.heading}>무엇을 도와드릴까요?</Text>

        <View style={styles.actions}>
          <Button
            label="수영장 추가 요청"
            variant="outline"
            size="lg"
            fullWidth
            onPress={() => navigation.replace('PoolName', { mode: 'create' })}
          />
          <Button
            label="수영장 정보 수정 요청"
            variant="outline"
            size="lg"
            fullWidth
            onPress={() => navigation.replace('PoolName', { mode: 'edit' })}
          />
          <Button
            label="운영자에게 의견 전달"
            variant="outline"
            size="lg"
            fullWidth
            onPress={() => sendMail("[Pool's Day] 의견 전달")}
          />
          <Button
            label="서비스에 광고 제안"
            variant="outline"
            size="lg"
            fullWidth
            onPress={() => sendMail("[Pool's Day] 광고 제안")}
          />
        </View>
      </View>
    </ModalCard>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: tokens.space[6],
    paddingTop: tokens.space[8],
    paddingBottom: tokens.space[6],
    alignItems: 'center',
  },
  illustWrap: {
    width: 220,
    height: 175,
  },
  heading: {
    fontSize: 22,
    lineHeight: 30,
    letterSpacing: -1,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.ink900,
    textAlign: 'center',
    marginTop: tokens.space[6],
  },
  actions: {
    alignSelf: 'stretch',
    marginTop: tokens.space[6],
    gap: tokens.space[2],
  },
});
