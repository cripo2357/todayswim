import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Waves } from 'lucide-react-native';
import { tokens } from '@/styles/tokens';

type Variant =
  | 'default'    // 일반 풀 — 파랑 fill + 흰 아이콘
  | 'favorite'   // 찜한 풀 — 노랑 fill + 어두운 아이콘
  | 'preview'    // 비선택 (초안) — 흰 fill + 회색 아이콘 + 회색 보더
  | 'parking';   // 주차장 — 흰 fill + 파랑 P + 파랑 보더

interface Props {
  variant?: Variant;
  selected?: boolean; // 선택 시 크기 키우고 그림자 강조
}

/**
 * 지도 마커.
 * Figma 5:12241 / 12919 / 11479 / 19049 / 12241 의 4종 마커:
 * - 파랑 채움 (일반)
 * - 노랑 채움 (찜)
 * - 회색 외곽선 (preview)
 * - P 외곽선 (주차장)
 */
export function PoolMarker({ variant = 'default', selected }: Props) {
  const size = selected ? 56 : 40;
  const iconSize = selected ? 28 : 22;
  const v = VARIANT[variant];

  return (
    <View
      style={[
        styles.outer,
        { width: size, height: size, borderRadius: size / 2 },
        v.outer,
        selected && tokens.shadow.lg,
      ]}
    >
      <View
        style={[
          styles.inner,
          { width: size - 6, height: size - 6, borderRadius: (size - 6) / 2 },
          v.inner,
        ]}
      >
        <Waves size={iconSize} color={v.iconColor} strokeWidth={2.2} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { alignItems: 'center', justifyContent: 'center' },
  inner: { alignItems: 'center', justifyContent: 'center' },
});

const VARIANT: Record<Variant, { outer: any; inner: any; iconColor: string }> = {
  default: {
    outer: { backgroundColor: tokens.color.white },
    inner: { backgroundColor: tokens.color.pool500 },
    iconColor: tokens.color.white,
  },
  favorite: {
    outer: { backgroundColor: tokens.color.white },
    inner: { backgroundColor: tokens.color.foolYellow },
    iconColor: tokens.color.ink900,
  },
  preview: {
    outer: { backgroundColor: tokens.color.white, borderWidth: 1.5, borderColor: tokens.color.lineDefault },
    inner: { backgroundColor: tokens.color.bgPaper },
    iconColor: tokens.color.ink400,
  },
  parking: {
    outer: { backgroundColor: tokens.color.white, borderWidth: 1.5, borderColor: tokens.color.pool500 },
    inner: { backgroundColor: tokens.color.bgPaper },
    iconColor: tokens.color.pool500,
  },
};
