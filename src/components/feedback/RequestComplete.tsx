// Figma 90:6703 (수영장 추가 요청 완료) / 90:6914 (수영장 정보 수정 요청 완료)
// dark backdrop + centered white card(r32, p16, gap32) + 일러스트 + 제목/설명 + primary 버튼.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { ModalCard } from '@/components/layout/ModalCard';
import { tokens } from '@/styles/tokens';
import RequestCompleteIllust from '@assets/illustrations/request-complete.svg';

interface Props {
  title: string;
  description: string;
  ctaLabel: string;
  onCtaPress: () => void;
}

export function RequestComplete({ title, description, ctaLabel, onCtaPress }: Props) {
  return (
    <ModalCard withCardPadding={false} cardStyle={styles.card}>
      <View style={styles.inner}>
        {/* Figma 90:6916 — h-210, 카드 내부 가로 꽉 (311 on 343 card) */}
        <View style={styles.illustWrap}>
          <RequestCompleteIllust width="100%" height="100%" />
        </View>
        {/* Figma 90:7116 — gap-12, center */}
        <View style={styles.textGroup}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.desc}>{description}</Text>
        </View>
        <Button
          label={ctaLabel}
          onPress={onCtaPress}
          size="lg"
          variant="pdYellow"
          fullWidth
          iconRight={<Check size={20} color={tokens.color.black} strokeWidth={2.4} />}
        />
      </View>
    </ModalCard>
  );
}

const styles = StyleSheet.create({
  // Figma 90:6915 — radius 32 (ModalCard 기본 폭 343 유지)
  card: {
    borderRadius: 32,
  },
  // Figma 90:6915 — p-16, gap-32, column
  inner: {
    padding: 16,
    gap: 32,
  },
  // Figma 90:6916 — h-210, w-full. SVG 원본 311x211 비율 유지.
  illustWrap: {
    width: '100%',
    aspectRatio: 311 / 211,
  },
  // Figma 90:7116 — gap-12, items-center, text-center
  textGroup: {
    gap: 12,
    alignItems: 'center',
  },
  // Figma 90:7117 — Bold 24/32 -0.288 #1F2937
  title: {
    fontFamily: tokens.font.sansBold,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.288,
    color: '#1F2937',
    textAlign: 'center',
  },
  // Figma 90:7118 — Regular 18, lineHeight 1.6 (≈29) #4B5563
  desc: {
    fontFamily: tokens.font.sans,
    fontSize: 18,
    lineHeight: 29,
    color: '#4B5563',
    textAlign: 'center',
  },
});
