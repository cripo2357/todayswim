// 공통 툴팁 디자인시스템 — Figma 147:5763 / 168:5708·5641·5662·5673.
// 흰 버블(Bold 10/14 #1F2937, rounded 8, Shadow/lg) + 16x8 화살표.
// 4방향 placement (대상 기준 툴팁 위치) — 화살표는 항상 대상을 향함:
//   top    = 대상 위  (아래 화살표, 버블 아래)   ← 기본
//   bottom = 대상 아래 (위 화살표, 버블 위)
//   right  = 대상 오른쪽 (왼 화살표, 버블 왼쪽)
//   left   = 대상 왼쪽 (오른 화살표, 버블 오른쪽)
// 위치(position:absolute 등)는 호출부에서 style prop으로.
// pointerEvents none → 아래 요소 탭을 가리지 않음.
//
// 사용: <Tooltip label="..." placement="right" style={styles.포지셔닝} />
// 풀 카드 stat/chip 라벨, 즐겨찾기, 일정 충돌 안내 등 "어디서든 말풍선".

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { tokens } from '@/styles/tokens';

type Placement = 'top' | 'bottom' | 'left' | 'right';

export function Tooltip({
  label,
  style,
  placement = 'top',
}: {
  label: string;
  /** 위치 지정 등 래퍼 추가 스타일 (보통 position:absolute) */
  style?: StyleProp<ViewStyle>;
  /** 대상 기준 툴팁 위치 (화살표는 대상을 향함). 기본 'top' */
  placement?: Placement;
}) {
  const horizontal = placement === 'left' || placement === 'right';
  return (
    <View
      style={[styles.wrap, horizontal && styles.wrapRow, style]}
      pointerEvents="none"
    >
      {placement === 'bottom' ? <View style={styles.arrowUp} /> : null}
      {placement === 'right' ? <View style={styles.arrowLeft} /> : null}
      <View style={styles.bubble}>
        <Text style={styles.text}>{label}</Text>
      </View>
      {placement === 'top' ? <View style={styles.arrow} /> : null}
      {placement === 'left' ? <View style={styles.arrowRight} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  // left/right 일 때 버블+화살표 가로 배치
  wrapRow: { flexDirection: 'row' },
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
  // Figma I147:5763;5567:11060 — 아래로 향하는 16x8 흰 삼각형(대상 위에 뜰 때).
  // Figma는 drop-shadow가 버블+꼬리 전체에 적용 → 꼬리에도 shadow.lg 부여
  // (없으면 흰 꼬리가 흰 배경에 묻혀 안 보이고 여백만 떠 보임).
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFFFFF',
    ...tokens.shadow.lg,
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
    ...tokens.shadow.lg,
  },
  // 왼쪽으로 향하는 8x16 삼각형 (placement='right' — 대상이 버블 왼쪽)
  arrowLeft: {
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderRightWidth: 8,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: '#FFFFFF',
    ...tokens.shadow.lg,
  },
  // 오른쪽으로 향하는 8x16 삼각형 (placement='left' — 대상이 버블 오른쪽)
  arrowRight: {
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderLeftWidth: 8,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#FFFFFF',
    ...tokens.shadow.lg,
  },
});
