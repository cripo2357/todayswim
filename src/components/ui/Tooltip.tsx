// Pool's day 공통 툴팁 (Figma 172:8039).
//
// 흰 둥근 사각형(r8, px8 py6, Bold 10/14 -0.04 #1F2937) + 16×8 꼬리 + Shadow/lg.
//
// **그림자 = 풀카드·일정카드와 동일한 `tokens.shadow.lg`(RN 네이티브 boxShadow)**.
// SVG 필터로 따로 그리면 렌더 엔진이 달라 카드 그림자와 톤이 안 맞아 어색함.
// 꼬리 자체에는 별도 그림자를 두지 않음 — 버블 boxShadow가 offset 12 + blur 16
// = ~28px 아래까지 확장되어 8px짜리 꼬리 영역을 자연스럽게 감쌈.
//
// 꼬리는 react-native-svg <Path>로 벡터 삼각형(흰색 fill). marginTop:-1로 버블
// 하단과 1px 겹쳐서 이음새 숨김.

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { tokens } from '@/styles/tokens';

const TAIL_W = 16;
const TAIL_H = 8;

export function Tooltip({
  label,
  style,
}: {
  label: string;
  /** 위치 지정 (position:absolute + width/left/right 호출부에서 부여) */
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.wrap, style]} pointerEvents="none">
      <View style={styles.bubble}>
        <Text style={styles.text} numberOfLines={1}>
          {label}
        </Text>
      </View>
      <Svg
        width={TAIL_W}
        height={TAIL_H}
        viewBox={`0 0 ${TAIL_W} ${TAIL_H}`}
        style={styles.tail}
      >
        <Path
          d={`M0 0 L${TAIL_W / 2} ${TAIL_H} L${TAIL_W} 0 Z`}
          fill="#FFFFFF"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  // 호출부 style이 position:absolute + width 부여. 버블·꼬리 가운데 정렬.
  wrap: { alignItems: 'center' },
  // Figma 172:8040 — 흰 버블 r8 px8 py6 + Figma Shadow/lg(tokens.shadow.lg).
  // 버블이 텍스트 폭에 맞춰 자동으로 줄어들도록 wrap 안에서 자연 크기로 둠.
  bubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    ...tokens.shadow.lg,
  },
  // Figma 172:8042 — Plus Jakarta Bold 10/14 -0.04 #1F2937 center
  text: {
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: -0.04,
    fontFamily: tokens.font.sansBold,
    color: '#1F2937',
    textAlign: 'center',
  },
  // Figma 172:8047 — 16×8 꼬리. 흰색 fill만(그림자는 버블 boxShadow가 커버).
  tail: {
    marginTop: -1, // 버블 하단과 1px 겹쳐 이음새 숨김
  },
});
