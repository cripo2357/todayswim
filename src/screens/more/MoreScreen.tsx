// Figma: 5:2287 (부가 기능)
//
// dark backdrop + centered card + 일러스트 + 5개 outline 버튼 (공지 사항 + 2×2 그리드).
// "무엇을 도와드릴까요?" 헤딩 제거 (디자인 변경) — 일러스트 → 공지 사항 → 4개 그리드 → copyright.

import React from 'react';
import { View, Text, StyleSheet, Linking, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ModalCard } from '@/components/layout/ModalCard';
import { Button } from '@/components/ui/Button';
import type { RootStackParamList } from '@/navigation/types';
import { tokens } from '@/styles/tokens';
import MoreIllust from '@assets/illustrations/more.svg';
import IconMegaphone from '@assets/icons/megaphone.svg';

const FEEDBACK_EMAIL = 'cripo2357@gmail.com';

export function MoreScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const sendMail = (subject: string) => {
    const url = `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(subject)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('메일 앱을 열 수 없어요', `직접 ${FEEDBACK_EMAIL} 로 보내주세요.`);
    });
  };

  const onAnnouncements = () => {
    navigation.replace('Announcements');
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

        {/* Figma 77:993 — 일러스트 ↔ 버튼 사이 브랜드 블록. gap-12 column items-center text-center */}
        <View style={styles.brandBlock}>
          <Text style={styles.brandTitle}>Pool’ Day</Text>
          <Text style={styles.brandTagline}>수영 바보들의 수영장 지도</Text>
        </View>

        <View style={styles.actions}>
          {/* Figma 77:722 — 공지 사항 (full width, 맨 위) — 메가폰 SVG + 텍스트 한 그룹으로 가운데 */}
          <Button
            label="공지 사항"
            variant="outline"
            size="lg"
            fullWidth
            onPress={onAnnouncements}
            iconLeft={<IconMegaphone width={20} height={20} />}
          />

          {/* Figma 74:1049 / 74:1003 — 수영장 추가 요청 / 정보 수정 요청 (2열, flex 1) */}
          <View style={styles.row}>
            <Button
              label="수영장 추가 요청"
              variant="outline"
              size="lg"
              style={styles.gridBtn}
              onPress={() => navigation.replace('PoolName', { mode: 'create' })}
            />
            <Button
              label="정보 수정 요청"
              variant="outline"
              size="lg"
              style={styles.gridBtn}
              onPress={() => navigation.replace('PoolName', { mode: 'edit' })}
            />
          </View>

          {/* Figma 74:1175 — 운영자에게 의견 / 광고 제안 (2열, flex 1) */}
          <View style={styles.row}>
            <Button
              label="운영자에게 의견"
              variant="outline"
              size="lg"
              style={styles.gridBtn}
              onPress={() => sendMail("[Pool's Day] 의견 전달")}
            />
            <Button
              label="광고 제안"
              variant="outline"
              size="lg"
              style={styles.gridBtn}
              onPress={() => sendMail("[Pool's Day] 광고 제안")}
            />
          </View>
        </View>

        {/* Figma 47:1105 — © 2026 CRIPO. Regular 14/20 tracking -0.084 black center */}
        <Text style={styles.copyright}>© 2026 CRIPO. All right reserved</Text>
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
  // Figma 77:993 — 일러스트 ↔ 버튼 사이. marginTop 24로 일러스트와 분리.
  brandBlock: {
    alignSelf: 'stretch',
    marginTop: tokens.space[6], // 24
    alignItems: 'center',
    gap: 12,
  },
  // Figma 77:994 — Plus Jakarta Bold 24/32 -0.288 #1F2937 center
  brandTitle: {
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.288,
    fontFamily: tokens.font.sansBold,
    color: '#1F2937',
    textAlign: 'center',
  },
  // Figma 77:995 — Regular 18, lineHeight 1.6 (≈29) #4B5563 center
  brandTagline: {
    fontSize: 18,
    lineHeight: 29,
    fontFamily: tokens.font.sans,
    color: '#4B5563',
    textAlign: 'center',
  },
  actions: {
    alignSelf: 'stretch',
    marginTop: tokens.space[6],
    gap: tokens.space[2], // 10px (gap-2.5)
  },
  // Figma 74:1049 / 74:1175 — 2열 row, gap 10
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  // Figma 74:1003 — flex-[1_0_0]; padding/font/border 등 모두 Button lg + outline 기본값 사용
  gridBtn: { flex: 1, minWidth: 0 },
  // Figma 47:1105 — Regular 14/20 -0.084 black center
  copyright: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sans,
    color: tokens.color.black,
    textAlign: 'center',
    marginTop: 24,
  },
});
