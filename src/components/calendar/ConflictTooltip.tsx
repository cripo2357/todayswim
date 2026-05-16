// 충돌 슬롯 안내 툴팁 — Figma 147:5763. 흰 버블(Bold 10/14 #1F2937,
// rounded 8, Shadow/lg) + 아래쪽 화살표. 슬롯 위에 absolute로 띄워 사용.
// pointerEvents none — 아래 슬롯 탭을 가리지 않음.

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { tokens } from '@/styles/tokens';

export function ConflictTooltip({
  label,
  style,
}: {
  label: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.wrap, style]} pointerEvents="none">
      <View style={styles.bubble}>
        <Text style={styles.text}>{label}</Text>
      </View>
      <View style={styles.arrow} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  bubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    ...tokens.shadow.lg,
  },
  text: {
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: -0.04,
    fontFamily: tokens.font.sansBold,
    color: '#1F2937',
    textAlign: 'center',
  },
  // 아래로 향하는 16x8 흰 삼각형 (Figma I147:5763;5567:11060 화살표 대체)
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFFFFF',
  },
});
