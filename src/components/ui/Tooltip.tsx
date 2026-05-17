// 공통 툴팁 — 위툴팁 1종 (Figma 172:8039). 아래툴팁 없음.
// 흰 버블(px8 py6, r8, Bold 10/14 -0.04 #1F2937) + 버블 하단 꼬리.
//
// 꼬리는 Figma에서 drop-shadow 베이크된 PNG(assets/icons/tooltip-tail.png,
// 96x16 캔버스 안 16x8 삼각형 + 그림자). CSS 보더 삼각형은 boxShadow가
// 사각형으로 깔려 실루엣이 안 맞으므로 폐기 — 베이크 PNG로 정확한
// 삼각형 그림자. (지도 마커와 동일한 "effects 베이크 PNG" 방식)
// 버블은 진짜 둥근 사각형이라 boxShadow가 모양대로 정확.
// 렌더 순서 [버블, 꼬리] — 꼬리(불투명)가 마지막=윗층.
// 위치(position:absolute)+width는 호출부 style prop.

import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { tokens } from '@/styles/tokens';

// 16x8 삼각형 + drop-shadow 베이크, 96x16 투명 캔버스 (Figma 172:8039 꼬리)
const TAIL = require('@assets/icons/tooltip-tail.png');

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
      <View style={styles.bubble}>
        <Text style={styles.text} numberOfLines={1}>
          {label}
        </Text>
      </View>
      <Image source={TAIL} style={styles.tail} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  // 호출부 style이 position:absolute + width 부여. 버블·꼬리 가운데 정렬.
  wrap: { alignItems: 'center' },
  // Figma 172:8040 — 흰 버블 r8 px8 py6 + drop-shadow(둥근 사각형이라
  // boxShadow가 모양대로 정확). Figma 정확값.
  bubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    boxShadow:
      '0px 12px 8px rgba(15, 23, 42, 0.08), 0px 4px 3px rgba(15, 23, 42, 0.03)',
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
  // Figma 172:8047 — 16x8 삼각형(그림자 베이크). 네이티브 96x16,
  // 버블 바로 아래(삼각형은 캔버스 상단, 그림자는 하단으로 베이크됨).
  tail: { width: 96, height: 16 },
});
