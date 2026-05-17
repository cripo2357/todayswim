// 공통 툴팁 — 딱 2종 (Figma 171:6758 위툴팁 / 171:6779 아래툴팁).
//   placement='top'(기본) = 위툴팁: 버블이 대상 위, 삼각형은 버블 하단에서
//     아래로(대상을 가리킴). 대부분의 툴팁(stat/chip·ID복사·일정충돌).
//   placement='bottom' = 아래툴팁: 버블이 대상 아래, 삼각형은 버블 상단에서
//     위로. 즐겨찾기 등록/해제 전용.
// 버블/삼각형 시각은 동일, 위치만 반대. drop-shadow는 Figma 정확값
// (음수 spread 없는 값이라 흰 카드 위에서도 윤곽 잡힘).
// 위치(position:absolute)+width는 호출부 style prop — 좁은 부모(아이콘
// 20px) 안에서 폭이 수렴해 라벨이 truncate되지 않도록 width 필수.

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

// Figma drop-shadow 정확값. 버블+꼬리 동일 적용 → Figma처럼 위/아래툴팁이
// 꼬리 방향만 다르고 그림자는 같게(꼬리에 없으면 흰 배경서 떠 보임).
const TOOLTIP_SHADOW =
  '0px 12px 8px rgba(15, 23, 42, 0.08), 0px 4px 3px rgba(15, 23, 42, 0.03)';

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
      {placement === 'bottom' ? <View style={styles.arrowUp} /> : null}
      <View style={styles.bubble}>
        <Text style={styles.text} numberOfLines={1}>
          {label}
        </Text>
      </View>
      {placement === 'top' ? <View style={styles.arrowDown} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  // Figma I171:6758;1270:15177 — 흰 버블 r8 px8 py6 + Shadow/lg(드롭섀도 정확값)
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
  // 16x8 아래로 향한 삼각형 — 위툴팁(버블 아래, 대상은 그 아래)
  arrowDown: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFFFFF',
    boxShadow: TOOLTIP_SHADOW,
  },
  // 16x8 위로 향한 삼각형 — 아래툴팁(버블 위, 대상은 그 위)
  arrowUp: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FFFFFF',
    boxShadow: TOOLTIP_SHADOW,
  },
});
