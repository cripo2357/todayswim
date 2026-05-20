// Pool's day 공통 툴팁 (Figma 172:8039 — 2026-05-20 재구현).
//
// 흰 둥근 사각형(r8, px8 py6, Bold 10/14 -0.04 #1F2937) + 16×8 꼬리 + Shadow/lg
// drop-shadow. 단일 react-native-svg <Path>로 버블+꼬리를 통합 도형으로 그리고
// 같은 path에 2-layer drop-shadow 필터를 걸어 버블/꼬리 이음새가 보이지 않도록
// 함. (이전 PNG 꼬리 + boxShadow 버블 2조각 방식은 폐기 — 그림자가 끊김.)
//
// Figma Shadow/lg 정확값:
//   layer 1: offset(0,4)  blur 6  spread -2  #0F172A08(α 0.031)
//   layer 2: offset(0,12) blur 16 spread -4  #0F172A14(α 0.078)
// CSS blur ≈ SVG stdDeviation × 2. spread는 시각 차이 미미하여 생략.
//
// 너비는 텍스트 길이에 맞춰 onLayout으로 1회 측정 후 SVG 너비 확정.
// 첫 프레임은 측정용 숨김 텍스트만 마운트 → 측정 완료 후 본 도형 렌더(깜빡임 X).

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Svg, {
  Path,
  Defs,
  Filter,
  FeGaussianBlur,
  FeOffset,
  FeFlood,
  FeComposite,
  FeMerge,
  FeMergeNode,
} from 'react-native-svg';
import { tokens } from '@/styles/tokens';

const RADIUS = 8;
const PX = 8;             // 가로 padding
const PY = 6;             // 세로 padding
const TEXT_LH = 14;
const BUBBLE_H = TEXT_LH + PY * 2; // 14 + 12 = 26
const TAIL_W = 16;
const TAIL_H = 8;
const TOTAL_H = BUBBLE_H + TAIL_H; // 34

// SVG 캔버스 외곽 여유 — 그림자 최대 extent(layer2: offset 12 + blur 16 = 28) 커버.
const SHADOW_PAD = 32;

// 둥근 사각형 + 아래쪽 꼬리를 하나의 path로 합친 d 문자열.
function bubblePath(W: number): string {
  const r = RADIUS;
  const H = BUBBLE_H;
  const cx = W / 2;
  const tx1 = cx - TAIL_W / 2;
  const tx2 = cx + TAIL_W / 2;
  return [
    `M ${r} 0`,
    `H ${W - r}`,
    `A ${r} ${r} 0 0 1 ${W} ${r}`,
    `V ${H - r}`,
    `A ${r} ${r} 0 0 1 ${W - r} ${H}`,
    `H ${tx2}`,
    `L ${cx} ${H + TAIL_H}`,
    `L ${tx1} ${H}`,
    `H ${r}`,
    `A ${r} ${r} 0 0 1 0 ${H - r}`,
    `V ${r}`,
    `A ${r} ${r} 0 0 1 ${r} 0`,
    `Z`,
  ].join(' ');
}

export function Tooltip({
  label,
  style,
}: {
  label: string;
  /** 위치 지정 (position:absolute + width/left/right 호출부에서 부여) */
  style?: StyleProp<ViewStyle>;
}) {
  const [textW, setTextW] = React.useState(0);
  // 버블 너비 = 텍스트 + 좌우 padding. 최소: 꼬리(16) + 라운드코너 2×(8) = 32.
  const w = Math.max(textW + PX * 2, TAIL_W + RADIUS * 2);

  return (
    <View style={[styles.wrap, style]} pointerEvents="none">
      {/* 측정용 숨김 텍스트 — onLayout 1회 트리거 후 본 도형이 마운트됨 */}
      <Text
        style={[styles.text, styles.measure]}
        numberOfLines={1}
        onLayout={(e) => {
          const next = Math.ceil(e.nativeEvent.layout.width);
          if (next !== textW) setTextW(next);
        }}
      >
        {label}
      </Text>

      {textW > 0 ? (
        <View style={[styles.stack, { width: w, height: TOTAL_H }]}>
          {/* SVG 도형 + 그림자 — stack 영역보다 SHADOW_PAD만큼 크게, 음수 좌표로 오프셋 */}
          <Svg
            width={w + SHADOW_PAD * 2}
            height={TOTAL_H + SHADOW_PAD * 2}
            viewBox={`${-SHADOW_PAD} ${-SHADOW_PAD} ${w + SHADOW_PAD * 2} ${TOTAL_H + SHADOW_PAD * 2}`}
            style={[
              styles.svg,
              {
                width: w + SHADOW_PAD * 2,
                height: TOTAL_H + SHADOW_PAD * 2,
              },
            ]}
          >
            <Defs>
              {/* Figma Shadow/lg 2-layer. filterUnits=userSpaceOnUse + viewBox 좌표계 */}
              <Filter
                id="tipShadow"
                x={-SHADOW_PAD}
                y={-SHADOW_PAD}
                width={w + SHADOW_PAD * 2}
                height={TOTAL_H + SHADOW_PAD * 2}
                filterUnits="userSpaceOnUse"
              >
                {/* Layer 1: offset(0,4) blur 6 #0F172A α0.031 */}
                <FeGaussianBlur in="SourceAlpha" stdDeviation="3" result="b1" />
                <FeOffset in="b1" dy="4" result="o1" />
                <FeFlood floodColor="#0F172A" floodOpacity={0.031} result="f1" />
                <FeComposite in="f1" in2="o1" operator="in" result="s1" />

                {/* Layer 2: offset(0,12) blur 16 #0F172A α0.078 */}
                <FeGaussianBlur in="SourceAlpha" stdDeviation="8" result="b2" />
                <FeOffset in="b2" dy="12" result="o2" />
                <FeFlood floodColor="#0F172A" floodOpacity={0.078} result="f2" />
                <FeComposite in="f2" in2="o2" operator="in" result="s2" />

                <FeMerge>
                  <FeMergeNode in="s2" />
                  <FeMergeNode in="s1" />
                  <FeMergeNode in="SourceGraphic" />
                </FeMerge>
              </Filter>
            </Defs>
            <Path d={bubblePath(w)} fill="#FFFFFF" filter="url(#tipShadow)" />
          </Svg>

          {/* 텍스트 — SVG 위에 겹쳐 그리기 (버블 영역에 정렬) */}
          <View style={styles.textWrap}>
            <Text style={styles.text} numberOfLines={1}>
              {label}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  stack: { position: 'relative' },
  // 측정용 — 레이아웃에 영향 X
  measure: { position: 'absolute', opacity: 0, alignSelf: 'flex-start' },
  // SVG 캔버스는 stack 영역 좌상단을 기준으로 SHADOW_PAD만큼 바깥쪽으로 확장
  svg: {
    position: 'absolute',
    left: -SHADOW_PAD,
    top: -SHADOW_PAD,
  },
  // 텍스트 박스 — 버블 영역(상단 BUBBLE_H)에 중앙 정렬
  textWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: BUBBLE_H,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: PX,
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
});
