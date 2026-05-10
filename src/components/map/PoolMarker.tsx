import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { tokens } from '@/styles/tokens';
import MarkerBig from '@assets/markers/marker-big.svg';
import MarkerSmall from '@assets/markers/marker-small.svg';
import MarkerBigPreview from '@assets/markers/marker-big-preview.svg';
import MarkerSmallPreview from '@assets/markers/marker-small-preview.svg';

type Variant = 'big' | 'small' | 'parking';

interface Props {
  variant: Variant;
  name?: string;
  preview?: boolean;
  selected?: boolean;
}

// Figma 38:1173 (big = 64) / 38:1146 (small = 52). 사이즈는 풀 사이즈에 고정 — 선택 상태로 안 바뀌니
// 비트맵 캡처 transition 글리치 없음.
const SIZE_BIG = 64;
const SIZE_SMALL = 52;
// Shadow 표시용 컨테이너 padding (offset + spread 수용)
const SHADOW_PAD = 8;
const WRAP_WIDTH = 168;

/**
 * 지도 마커. Figma 38:1146 / 38:1173.
 * - big (50m+): 64px 노랑+파란보더, blue solid drop shadow
 * - small (≤25m): 52px 파랑+파란보더, blue tinted shadow with spread
 * - preview: 회색 SVG variant (사이즈는 동일)
 */
export function PoolMarker({ variant, name, preview }: Props) {
  if (variant === 'parking') return <ParkingMarker />;

  const isBig = variant === 'big';
  const size = isBig ? SIZE_BIG : SIZE_SMALL;
  const totalSize = size + SHADOW_PAD * 2;

  // Figma shadow spec
  // big: 0px 4px 4px 0px #007AFF — solid blue, blur 4, spread 0
  // small: 2px 2px 3px 4px rgba(0,122,255,0.15) — translucent blue, blur 3, spread 4
  // RN에 blur 없으니 다층 동심원으로 근사 (가운데 진하고 바깥 옅게)
  const shadowOffsetX = isBig ? 0 : 2;
  const shadowOffsetY = isBig ? 4 : 2;
  const shadowSpread = isBig ? 0 : 4;
  const shadowColor = isBig ? tokens.color.brandBlue : 'rgba(0, 122, 255, 1)';
  // extra: shadowSpread + blur 영역 안에서 분포. opacity는 Figma color 알파에 비례.
  const shadowLayers = isBig
    ? [
        { extra: 0, opacity: 1 }, // 중심 (full)
        { extra: 2, opacity: 0.5 },
        { extra: 4, opacity: 0.18 },
      ]
    : [
        { extra: 0, opacity: 0.15 }, // small은 base alpha 0.15
        { extra: 1.5, opacity: 0.1 },
        { extra: 3, opacity: 0.05 },
      ];

  const Marker = preview
    ? isBig
      ? MarkerBigPreview
      : MarkerSmallPreview
    : isBig
      ? MarkerBig
      : MarkerSmall;

  return (
    <View style={styles.wrap}>
      <View style={[styles.iconBox, { width: totalSize, height: totalSize }]}>
        {!preview && shadowLayers.map((l, idx) => {
          const layerSize = size + (shadowSpread + l.extra) * 2;
          return (
            <View
              key={idx}
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: SHADOW_PAD + shadowOffsetX - (layerSize - size) / 2,
                top: SHADOW_PAD + shadowOffsetY - (layerSize - size) / 2,
                width: layerSize,
                height: layerSize,
                borderRadius: layerSize / 2,
                backgroundColor: shadowColor,
                opacity: l.opacity,
              }}
            />
          );
        })}
        <View
          style={{
            position: 'absolute',
            left: SHADOW_PAD,
            top: SHADOW_PAD,
            width: size,
            height: size,
          }}
        >
          <Marker width={size} height={size} />
        </View>
      </View>

      {name ? (
        <View style={[styles.labelPill, preview && styles.labelPreview]}>
          <Text style={styles.labelText} numberOfLines={1} ellipsizeMode="tail">
            {name}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function ParkingMarker() {
  const size = 36;
  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.parking,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
      >
        <Text style={styles.parkingLabel}>P</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: WRAP_WIDTH,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  iconBox: {
    position: 'relative',
  },
  // Figma label: bg white, padding 12/6, radius 16, shadow combo, gap 6px from marker
  labelPill: {
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: tokens.color.white,
    borderRadius: 16,
    maxWidth: WRAP_WIDTH,
    shadowColor: tokens.color.ink900,
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  labelText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.ink900,
    letterSpacing: -0.6,
    textAlign: 'center',
  },
  labelPreview: {
    opacity: 0.55,
  },
  parking: {
    backgroundColor: tokens.color.white,
    borderWidth: 2,
    borderColor: tokens.color.brandBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  parkingLabel: {
    ...tokens.text.h4,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.brandBlue,
  },
});
