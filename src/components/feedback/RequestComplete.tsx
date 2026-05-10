// Figma 5:19712 (시간표 등록 요청 완료) / 5:18464 (수영장 추가 요청 완료) / 38:766 (수영장 정보 수정 요청 완료)
// dark backdrop + centered white card + illustration + title + desc + primary 버튼.

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
    <ModalCard withCardPadding={false}>
      <View style={styles.inner}>
        <View style={styles.illustWrap}>
          <RequestCompleteIllust width={240} height={163} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.desc}>{description}</Text>
        <Button
          label={ctaLabel}
          onPress={onCtaPress}
          size="lg"
          fullWidth
          style={styles.cta}
          iconRight={<Check size={18} color={tokens.color.white} strokeWidth={2.4} />}
        />
      </View>
    </ModalCard>
  );
}

const styles = StyleSheet.create({
  inner: {
    paddingHorizontal: tokens.space[6],
    paddingTop: tokens.space[8],
    paddingBottom: tokens.space[6],
    alignItems: 'center',
  },
  illustWrap: {
    width: 240,
    height: 163,
    marginBottom: tokens.space[6],
  },
  title: {
    ...tokens.text.h3,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.ink900,
    textAlign: 'center',
  },
  desc: {
    ...tokens.text.bodySm,
    color: tokens.color.ink500,
    textAlign: 'center',
    marginTop: tokens.space[3],
    lineHeight: 22,
  },
  cta: {
    marginTop: tokens.space[6],
  },
});
