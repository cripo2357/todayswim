// 공통 툴팁 — 딱 2종 (Figma 171:6758 위툴팁 / 171:6779 아래툴팁).
//   placement='top'(기본) = 위툴팁: 버블이 대상 위, 꼬리는 버블 하단(아래로).
//   placement='bottom' = 아래툴팁: 버블이 대상 아래, 꼬리는 버블 상단(위로).
// 버블/꼬리 시각 동일, 꼬리 방향(위치)만 반대.
//
// ★ 렌더 순서 항상 [버블, 꼬리] 고정 → 꼬리가 항상 마지막에 그려짐(윗층).
//   그래야 꼬리(불투명 흰 삼각형)가 버블 그림자 이음새를 덮어 위/아래
//   모두 깨끗. 꼬리는 position:absolute라 순서와 무관하게 placement대로
//   버블 위/아래에 배치(flex 순서가 위치를 안 정하게 분리).
// 위치(position:absolute)+width는 호출부 style prop(좁은 부모서 폭 수렴
//   해 라벨 truncate되지 않도록 width 필수).

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { tokens } from '@/styles/tokens';

type Placement = 'top' | 'bottom';

// 무방향(offset 0 + blur) 그림자 — 버블+꼬리 동일. 방향 offset이면
// 꼬리 쪽으로 그림자가 쏠려 위/아래툴팁이 달라 보임. 흰 카드 위 윤곽도 잡힘.
const TOOLTIP_SHADOW =
  '0px 0px 8px rgba(15, 23, 42, 0.16), 0px 0px 2px rgba(15, 23, 42, 0.12)';

export function Tooltip({
  label,
  style,
  placement = 'top',
}: {
  label: string;
  /** 위치 지정 (position:absolute + width 필수) */
  style?: StyleProp<ViewStyle>;
  /** 'top'=위툴팁(기본) / 'bottom'=아래툴팁 */
  placement?: Placement;
}) {
  return (
    <View style={[styles.wrap, style]} pointerEvents="none">
      {/* 항상 버블 먼저 → 버블+그림자(1,2단계) */}
      <View style={styles.bubble}>
        <Text style={styles.text} numberOfLines={1}>
          {label}
        </Text>
      </View>
      {/* 항상 꼬리 마지막 → 꼬리 그림자+꼬리(3,4단계)=윗층. 위치는
          absolute로 placement대로(위툴팁=버블 아래 / 아래툴팁=버블 위) */}
      <View
        style={[
          styles.arrow,
          placement === 'top' ? styles.arrowTop : styles.arrowBottom,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // 호출부 style이 position:absolute + width 부여. 버블이 width 안에
  // 가운데 정렬 → 꼬리 left:'50%'가 버블 중앙과 일치.
  wrap: { alignItems: 'center' },
  // Figma I171:6758;1270:15177 — 흰 버블 r8 px8 py6 + 그림자
  bubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    boxShadow: TOOLTIP_SHADOW,
  },
  // Figma I171:6758;1270:15179 — Bold 10/14 tracking -0.04 #1F2937 center
  text: {
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: -0.04,
    fontFamily: tokens.font.sansBold,
    color: '#1F2937',
    textAlign: 'center',
  },
  // 꼬리 공통 — 16x8 삼각형, absolute(버블 기준 가운데), 항상 맨 위층
  arrow: {
    position: 'absolute',
    left: '50%',
    marginLeft: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    boxShadow: TOOLTIP_SHADOW,
  },
  // 위툴팁 — 아래로 향한 삼각형, 버블 하단 바깥
  arrowTop: {
    bottom: -8,
    borderTopWidth: 8,
    borderTopColor: '#FFFFFF',
  },
  // 아래툴팁 — 위로 향한 삼각형, 버블 상단 바깥
  arrowBottom: {
    top: -8,
    borderBottomWidth: 8,
    borderBottomColor: '#FFFFFF',
  },
});
