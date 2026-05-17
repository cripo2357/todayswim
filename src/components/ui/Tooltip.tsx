// 공통 툴팁 디자인시스템 — Figma 147:5763 / 168:5708·5641·5662·5673 / 169:5827.
// 흰 버블(Bold 10/14 #1F2937, rounded 8, Shadow/lg) + 꼬리(삼각형).
// 4방향 placement (대상 기준 툴팁 위치) — 꼬리는 항상 대상을 향함:
//   top    = 대상 위  (꼬리 버블 아래·아래로)   ← 기본
//   bottom = 대상 아래 (꼬리 버블 위·위로)
//   right  = 대상 오른쪽 (꼬리 버블 왼쪽·왼쪽으로)
//   left   = 대상 왼쪽 (꼬리 버블 오른쪽·오른쪽으로)
//
// 구조: 바깥 wrap(호출부 style로 position:absolute + width 부여) →
//   bubbleWrap(콘텐츠 크기, 꼬리의 기준) → 꼬리 + 버블.
// ※ 호출부 style에 width 필수: absolute+left 가 좁은 부모(아이콘 20px)
//   안에서 폭이 수렴 → 라벨이 truncate되어 안 보임. width로 폭 확보.
//   top/bottom은 마름모 정렬 위해 alignItems center+marginLeft -width/2,
//   left/right는 alignItems:'flex-start'로 버블을 대상 옆에 붙임.
// 꼬리는 "버블과 같은 흰색+shadow 의 45° 회전 정사각형"을 버블이 절반
// 가리는 기법(버블보다 먼저 렌더). pointerEvents none.
//
// 사용: <Tooltip label="..." placement="right" style={styles.포지셔닝} />

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

// 꼬리 위치 — bubbleWrap(=버블 박스) 기준 absolute
const ARROW_BY_PLACEMENT: Record<Placement, ViewStyle> = {
  top: { bottom: -6, left: '50%', marginLeft: -6 }, // 버블 아래 가운데(아래로)
  bottom: { top: -6, left: '50%', marginLeft: -6 }, // 버블 위 가운데(위로)
  left: { right: -6, top: '50%', marginTop: -6 }, // 버블 오른쪽 가운데(오른쪽으로)
  right: { left: -6, top: '50%', marginTop: -6 }, // 버블 왼쪽 가운데(왼쪽으로)
};

export function Tooltip({
  label,
  style,
  placement = 'top',
}: {
  label: string;
  /** 위치 지정 등 래퍼 추가 스타일 (position:absolute + width 필수) */
  style?: StyleProp<ViewStyle>;
  /** 대상 기준 툴팁 위치 (꼬리는 대상을 향함). 기본 'top' */
  placement?: Placement;
}) {
  return (
    <View style={[styles.wrap, style]} pointerEvents="none">
      <View style={styles.bubbleWrap}>
        {/* 꼬리: 버블보다 먼저(뒤) 렌더 → 불투명 버블이 안쪽 절반을 가림 */}
        <View style={[styles.arrow, ARROW_BY_PLACEMENT[placement]]} />
        <View style={styles.bubble}>
          {/* 한 줄 고정(Figma whitespace-nowrap) */}
          <Text style={styles.text} numberOfLines={1}>
            {label}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // 바깥 — 호출부 style이 position:absolute + width + alignItems 부여.
  // 기본 alignItems center(top/bottom 가운데 정렬용).
  wrap: { position: 'relative', alignItems: 'center' },
  // 콘텐츠 크기 = 버블 박스. 꼬리(absolute)의 기준 → 폭/정렬 무관하게
  // 꼬리가 항상 버블에 붙음.
  bubbleWrap: { position: 'relative' },
  // Figma I147:5763;1270:15177 — 흰 버블 r8 px8 py6 + Shadow/lg.
  // flexShrink 0(Figma shrink-0) → 행 배치에서 찌그러짐 방지.
  bubble: {
    flexShrink: 0,
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
  // 45° 회전 흰 정사각형 — 버블과 같은 배경/그림자. 절반은 버블에 가려
  // 깔끔한 삼각형 꼬리(≈16x8). 위치는 ARROW_BY_PLACEMENT.
  arrow: {
    position: 'absolute',
    width: 12,
    height: 12,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
    ...tokens.shadow.lg,
  },
});
