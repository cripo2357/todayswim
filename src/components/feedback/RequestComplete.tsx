import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '@/components/ui/Button';
import { tokens } from '@/styles/tokens';
// SVG는 metro.config.js의 react-native-svg-transformer로 컴포넌트 import
import RequestCompleteIllust from '@assets/illustrations/request-complete.svg';

interface Props {
  title: string;
  description: string;
  ctaLabel: string;
  onCtaPress: () => void;
}

/**
 * 요청 완료 화면 공통 레이아웃.
 * Figma 5:19712 (시간표 등록 요청 완료) + 5:18464 (수영장 등록/수정 요청 완료) 공유.
 *
 * 일러스트(request-complete.svg) + 제목 + 설명 + 1버튼.
 */
export function RequestComplete({ title, description, ctaLabel, onCtaPress }: Props) {
  return (
    <View style={styles.root}>
      <View style={styles.illustWrap}>
        <RequestCompleteIllust width={311} height={211} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.desc}>{description}</Text>
      <View style={styles.spacer} />
      <Button label={ctaLabel} onPress={onCtaPress} size="lg" fullWidth />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: 162, // Figma 데이터: Frame y=178, container y=16
    paddingBottom: tokens.space[6],
    alignItems: 'center',
  },
  illustWrap: {
    width: 311,
    height: 211,
    marginBottom: tokens.space[8],
  },
  title: {
    ...tokens.text.h2,
    color: tokens.color.ink900,
    textAlign: 'center',
  },
  desc: {
    ...tokens.text.body,
    color: tokens.color.ink500,
    textAlign: 'center',
    marginTop: tokens.space[3],
    paddingHorizontal: tokens.space[4],
  },
  spacer: { flex: 1 },
});
