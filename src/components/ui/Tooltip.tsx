// 공통 툴팁 디자인시스템 — Figma 147:5763.
// 흰 버블(Bold 10/14 #1F2937, rounded 8, Shadow/lg) + 아래쪽 16x8 화살표.
// 대상 위에 띄워 사용 — 위치(position:absolute 등)는 호출부에서 style prop으로.
// pointerEvents none → 아래 요소 탭을 가리지 않음.
//
// 사용: <Tooltip label="..." style={styles.포지셔닝} />
// 풀 카드 stat/chip 라벨, 일정 충돌 안내 등 "어디서든 말풍선" 시 재사용.

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { tokens } from '@/styles/tokens';

export function Tooltip({
  label,
  style,
  placement = 'top',
}: {
  label: string;
  /** 위치 지정 등 래퍼 추가 스타일 (보통 position:absolute) */
  style?: StyleProp<ViewStyle>;
  /** 'top'=대상 위(아래 화살표, 기본) / 'bottom'=대상 아래(위 화살표) */
  placement?: 'top' | 'bottom';
}) {
  return (
    <View style={[styles.wrap, style]} pointerEvents="none">
      {placement === 'bottom' ? <View style={styles.arrowUp} /> : null}
      <View style={styles.bubble}>
        <Text style={styles.text}>{label}</Text>
      </View>
      {placement === 'top' ? <View style={styles.arrow} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  // Figma I147:5763;1270:15177 — 흰 버블 r8 px8 py6 + Shadow/lg
  bubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    ...tokens.shadow.lg,
  },
  // Figma I147:5763;1270:15179 — Bold 10/14 tracking -0.04 #1F2937 center
  text: {
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: -0.04,
    fontFamily: tokens.font.sansBold,
    color: '#1F2937',
    textAlign: 'center',
  },
  // Figma I147:5763;5567:11060 — 아래로 향하는 16x8 흰 삼각형(대상 위에 뜰 때)
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
  // 위로 향하는 삼각형(대상 아래에 뜰 때 — 버블 위에 위치)
  arrowUp: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FFFFFF',
  },
});
