// Figma 129:3779 — 수영 초대장 보내기 완료 (dim 모달, 가운데 카드).
// 공통 RequestComplete는 다른 완료 화면(시간표/수영장/정보수정)도 쓰므로
// 건드리지 않고, 이 화면만 129:3779 스펙에 정확히 맞춰 전용 구현.

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CalendarCheck } from 'lucide-react-native';

import { ModalCard } from '@/components/layout/ModalCard';
import type { RootStackParamList } from '@/navigation/types';
import { tokens } from '@/styles/tokens';
import RequestCompleteIllust from '@assets/illustrations/request-complete.svg';

export function InviteDoneScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'InviteDone'>>();
  const count = route.params?.count ?? 0;

  return (
    <ModalCard withCardPadding={false} cardStyle={styles.card}>
      {/* Figma 129:4085 — 일러스트 프레임 h216, 전체폭 */}
      <View style={styles.illustWrap}>
        <RequestCompleteIllust width={279} height={216} />
      </View>

      {/* Figma 129:4063 — 타이틀/본문 gap16, 가운데 */}
      <View style={styles.textBlock}>
        <Text style={styles.title}>수영 초대장 보내기 완료</Text>
        <Text style={styles.desc}>
          {count}명의 친구에게 초대장을 보냈습니다.
        </Text>
      </View>

      {/* Figma 129:4066 — pd-byellow r14 minH48, 라벨 + calendar-check */}
      <Pressable
        onPress={() => navigation.goBack()}
        style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}
        accessibilityRole="button"
      >
        <Text style={styles.ctaLabel}>알겠습니다</Text>
        <CalendarCheck size={20} color={tokens.color.black} strokeWidth={2} />
      </Pressable>
    </ModalCard>
  );
}

const styles = StyleSheet.create({
  // Figma 129:3780 — 흰 카드 w343 r32 p16, 섹션 gap 32, 가운데
  card: {
    maxWidth: 343,
    backgroundColor: tokens.color.white,
    borderRadius: 32,
    padding: 16,
    gap: 32,
    alignItems: 'center',
    overflow: 'hidden',
  },
  illustWrap: {
    width: '100%',
    height: 216,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: { width: '100%', gap: 16, alignItems: 'center' },
  // Figma 129:4064 — Bold 24/32 -0.288 #1F2937
  title: {
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.288,
    fontFamily: tokens.font.sansBold,
    color: '#1F2937',
    textAlign: 'center',
  },
  // Figma 129:4065 — Regular 16/1.6 #4B5563
  desc: {
    fontSize: 16,
    lineHeight: 26,
    fontFamily: tokens.font.sans,
    color: '#4B5563',
    textAlign: 'center',
  },
  // Figma 129:4066 — pd-byellow r14 minH48 px20 py12 gap10, 전체폭
  cta: {
    flexDirection: 'row',
    width: '100%',
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: tokens.color.pdByellow,
  },
  // Figma I129:4066;5588:18178 — SemiBold 16/22 -0.112 black
  ctaLabel: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.black,
  },
});
