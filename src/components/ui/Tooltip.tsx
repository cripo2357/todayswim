// 공통 툴팁 — 위툴팁 1종 (Figma 172:8039). 아래툴팁 없음.
// 흰 버블(px8 py6, r8, Bold 10/14 -0.04 #1F2937, drop-shadow) 위에 떠서
// 버블 하단의 16x8 삼각형이 대상을 가리킴.
//
// 렌더 순서 [버블, 꼬리] — 꼬리가 마지막(윗층)이라 불투명 흰 삼각형이
// 버블 그림자 이음새를 덮어 깨끗. drop-shadow는 Figma 정확값.
// 위치(position:absolute)+width는 호출부 style prop(좁은 부모서 폭
// 수렴해 라벨 truncate되지 않도록 width 필수).

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { tokens } from '@/styles/tokens';

// Figma 172:8039 drop-shadow 정확값. 버블+꼬리 동일 적용.
const TOOLTIP_SHADOW =
  '0px 12px 8px rgba(15, 23, 42, 0.08), 0px 4px 3px rgba(15, 23, 42, 0.03)';

export function Tooltip({
  label,
  style,
}: {
  label: string;
  /** 위치 지정 (position:absolute + width 필수) */
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.wrap, style]} pointerEvents="none">
      {/* 1·2: 버블 그림자 → 버블 */}
      <View style={styles.bubble}>
        <Text style={styles.text} numberOfLines={1}>
          {label}
        </Text>
      </View>
      {/* 3·4: 꼬리 그림자 → 꼬리 (맨 마지막=윗층, 버블 그림자 이음새 덮음) */}
      <View style={styles.arrow} />
    </View>
  );
}

const styles = StyleSheet.create({
  // 호출부 style이 position:absolute + width 부여. 버블이 width 안에
  // 가운데 정렬(꼬리도 같은 가운데).
  wrap: { alignItems: 'center' },
  // Figma 172:8040 — 흰 버블 r8 px8 py6 + drop-shadow
  bubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    boxShadow: TOOLTIP_SHADOW,
  },
  // Figma 172:8042 — Bold 10/14 tracking -0.04 #1F2937 center
  text: {
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: -0.04,
    fontFamily: tokens.font.sansBold,
    color: '#1F2937',
    textAlign: 'center',
  },
  // Figma 172:8047 — 16x8 아래로 향한 삼각형, 버블 바로 아래
  arrow: {
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
});
