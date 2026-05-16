// Figma TopNav (129:5247 / 117:2558) — 뒤로 / 중앙 타이틀 / 우측 슬롯(기본 빈 24).
// 설정·프로필 등 풀스크린 푸시 화면 공용 헤더.

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { tokens } from '@/styles/tokens';

interface Props {
  title: string;
  onBack?: () => void;
  /** 우측 24x24 슬롯. 없으면 빈 공간(타이틀 중앙 정렬 균형용). */
  right?: React.ReactNode;
}

export function ScreenHeader({ title, onBack, right }: Props) {
  return (
    <View style={styles.nav}>
      <Pressable onPress={onBack} hitSlop={8} accessibilityLabel="뒤로">
        <ChevronLeft size={24} color={tokens.color.ink900} strokeWidth={1.5} />
      </Pressable>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansSemibold,
    color: '#1F2937',
  },
  right: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
});
