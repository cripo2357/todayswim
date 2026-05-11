import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import DropShadow from 'react-native-drop-shadow';
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

/**
 * Figma map 화면(5:11479/5:19049/5:12919) 기준 — 사용자가 40/36 사이즈로 재export 한 SVG 자연 좌표.
 *   big           (38:1184): viewBox 51×51, circle 40 @ (5.374, 1.535)
 *   small         (38:1157): viewBox 53×53, circle 36 @ (6.374, 6.544)
 *   big-preview   (38:1119): viewBox 51×51, circle 40 @ (5.374, 1.535)
 *   small-preview (38:1138): viewBox 44×44, circle 36 @ (4, 0)
 *
 * SVG 내부에 <filter> drop-shadow 정의되어 있지만 react-native-svg가 안정 렌더 못 함
 * (특히 Android feGaussianBlur 무시). 따라서 backing View를 원 좌표에 정렬하여
 * RN 네이티브 shadowProps + elevation 으로 별도 캐스팅.
 *
 * Figma shadow spec:
 *  big     (38:1184): [0 4 4 0 #007AFF]                   solid blue
 *  small   (38:1157): [2 2 3 4 rgba(0,122,255,0.15)]      translucent + spread 4
 *  preview (38:1119/1138): [0 4 4 0 rgba(0,122,255,0.15)] translucent
 */
type Geom = { svg: number; circle: number; x: number; y: number };
const GEOM: Record<'big' | 'small' | 'bigPreview' | 'smallPreview', Geom> = {
  big:          { svg: 51, circle: 40, x: 5.374, y: 1.535 },
  small:        { svg: 53, circle: 36, x: 6.374, y: 6.544 },
  bigPreview:   { svg: 51, circle: 40, x: 5.374, y: 1.535 },
  smallPreview: { svg: 44, circle: 36, x: 4,     y: 0 },
};

const WRAP_WIDTH = 168;

/**
 * react-native-drop-shadow에 넘길 shadow style.
 * SVG의 alpha 채널 기준으로 실제 Gaussian blur shadow를 OS-native API로 캐스팅.
 * (RN의 shadowProps는 backgroundColor 있는 View에서만 동작하지만 DropShadow는 SVG도 OK)
 */
function shadowFor(isBig: boolean) {
  return isBig
    ? {
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 4,
      }
    : {
        // RN shadowProps에 spread 없음 → radius 4(spread) + 3(blur) 흡수해서 7
        shadowColor: '#007AFF',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 7,
      };
}

/**
 * 지도 마커. Figma 38:1173 (big) / 38:1146 (small).
 * SVG는 export 원본 그대로 viewBox 크기로 렌더. 그 아래에 backing View(circle bounding box에 맞춤)가
 * 네이티브 shadow 캐스팅. SVG가 위에서 덮어서 backing 색은 안 보이고 shadow만 SVG 원 주위로 깔림.
 */
export function PoolMarker({ variant, name, preview }: Props) {
  if (variant === 'parking') return <ParkingMarker />;

  const isBig = variant === 'big';
  const kind = preview ? (isBig ? 'bigPreview' : 'smallPreview') : isBig ? 'big' : 'small';
  const g = GEOM[kind];

  // Figma 6px gap 정확히 맞추기: SVG viewBox 하단 padding(shadow 여유) 흡수해서 라벨 끌어올림.
  // 결과: 라벨 top = 원 bottom + 6 (실제 시각 간격 6px).
  const labelMargin = 6 - (g.svg - g.y - g.circle);

  const Marker = preview
    ? isBig
      ? MarkerBigPreview
      : MarkerSmallPreview
    : isBig
      ? MarkerBig
      : MarkerSmall;

  // preview는 그림자 없으니 SVG만 자연 크기로.
  if (preview) {
    return (
      <View style={styles.wrap}>
        <View style={{ width: g.svg, height: g.svg }}>
          <Marker width={g.svg} height={g.svg} />
        </View>
        {name ? (
          <View style={[styles.labelPill, styles.labelPreview, { marginTop: labelMargin }]}>
            <Text style={styles.labelText} numberOfLines={1} ellipsizeMode="tail">
              {name}
            </Text>
          </View>
        ) : null}
      </View>
    );
  }

  /**
   * non-preview: DropShadow(react-native-drop-shadow)가 SVG의 alpha 채널 기준으로
   * 실제 Gaussian blur shadow를 OS-native API로 캐스팅. iOS + Android 모두 일관된 결과.
   */
  return (
    <View style={styles.wrap}>
      <DropShadow style={shadowFor(isBig)}>
        <Marker width={g.svg} height={g.svg} />
      </DropShadow>

      {name ? (
        <View style={[styles.labelPill, { marginTop: labelMargin }]}>
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
  // Figma label: bg white, padding 12/6, radius 16, shadow combo. marginTop은 변종별 동적 계산 (SVG shadow padding 흡수).
  labelPill: {
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
