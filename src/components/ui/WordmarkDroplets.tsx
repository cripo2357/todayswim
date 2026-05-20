// wordmark-poolsday-light의 apostrophe 위치에서 노란 쉼표 물방울이 일정 간격으로
// 솟아오르는 애니메이션 레이어. 워드마크와 같은 부모 컨테이너 안에 형제로 두고
// 사용 — 부모 width/height을 그대로 받아 apostrophe 위치를 비율로 계산한다.
// 사용처: SettingsScreen 푸터, TermsDetailScreen 상단.
// (스플래시는 화면 절대좌표 기준 stream이라 컴포넌트화하지 않음 — SplashScreen 직속.)

import React from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import DropletComma from '@assets/illustrations/droplet-comma.svg';
import { tokens } from '@/styles/tokens';

interface Props {
  width: number;
  height: number;
  color?: string;
}

// light 워드마크 viewBox 343x153, apostrophe path(#EAFF00) 영역 x:255~299 y:19~68
// → 중심 (277, 44). 비율 좌표로 환산해 어떤 표시 폭에도 맞도록.
const APOSTROPHE_X_RATIO = 277 / 343;
const APOSTROPHE_Y_RATIO = 44 / 153;

// 스플래시와 동일 크기/타이밍. apostrophe 자체 표시 크기에 비해 작아 stream 느낌.
const DROPLET_W = 14;
const DROPLET_H = 21;
const DROPLET_COUNT = 8;
const RISE_DURATION = 2400;

interface Droplet {
  id: number;
  delay: number;
  y: Animated.Value;
  opacity: Animated.Value;
}

export function WordmarkDroplets({
  width,
  height,
  color = tokens.color.pdByellow,
}: Props) {
  const xCenter = width * APOSTROPHE_X_RATIO;
  const yStart = height * APOSTROPHE_Y_RATIO;
  // 워드마크 wrap 상단 살짝 위로 사라짐. 너무 멀리 솟구치면 부모 다른 형제와 겹침.
  const yEnd = -24;

  const dropletsRef = React.useRef<Droplet[]>(
    Array.from({ length: DROPLET_COUNT }, (_, i) => ({
      id: i,
      delay: Math.round((RISE_DURATION / DROPLET_COUNT) * i),
      y: new Animated.Value(yStart),
      opacity: new Animated.Value(0),
    })),
  );
  const droplets = dropletsRef.current;

  React.useEffect(() => {
    const animations = droplets.map((d) => {
      const rise = Animated.parallel([
        Animated.timing(d.y, {
          toValue: yEnd,
          duration: RISE_DURATION,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(d.opacity, {
            toValue: 0.95,
            duration: RISE_DURATION * 0.2,
            useNativeDriver: true,
          }),
          Animated.timing(d.opacity, {
            toValue: 0.95,
            duration: RISE_DURATION * 0.5,
            useNativeDriver: true,
          }),
          Animated.timing(d.opacity, {
            toValue: 0,
            duration: RISE_DURATION * 0.3,
            useNativeDriver: true,
          }),
        ]),
      ]);
      const reset = Animated.parallel([
        Animated.timing(d.y, {
          toValue: yStart,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.timing(d.opacity, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]);
      return Animated.loop(
        Animated.sequence([Animated.delay(d.delay), rise, reset]),
      );
    });
    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  }, [droplets, yStart, yEnd]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {droplets.map((d) => (
        <Animated.View
          key={d.id}
          style={[
            styles.droplet,
            {
              left: xCenter - DROPLET_W / 2,
              opacity: d.opacity,
              transform: [{ translateY: d.y }],
            },
          ]}
        >
          <DropletComma width={DROPLET_W} height={DROPLET_H} color={color} />
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  droplet: {
    position: 'absolute',
    top: 0,
    width: DROPLET_W,
    height: DROPLET_H,
  },
});
