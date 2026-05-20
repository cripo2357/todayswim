// Figma 110:4218 — 가입완료 웰컴 (프로필 등록 후 첫 진입).
// 스플래시와 동일한 떠오르는 쉼표(droplet) 애니메이션 + pd-mint bg + 워드마크 + CTA.

import React from 'react';
import {
  View, Text, StyleSheet, Pressable, Dimensions, Animated, Easing,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BrandWordmark from '@assets/illustrations/wordmark-poolsday.svg';
import DropletComma from '@assets/illustrations/droplet-comma.svg';
import IconLifeBuoy from '@assets/icons/life-buoy.svg';
import type { RootStackParamList } from '@/navigation/types';
import { tokens } from '@/styles/tokens';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 스플래시와 동일 파라미터
const DROPLET_COUNT = 8;
const RISE_DURATION = 2400;
const WORDMARK_WIDTH = 256;
const WORDMARK_HEIGHT = 152;
// 워드마크 viewBox 872x518, apostrophe 중심 ≈ (670, 51) → 워드마크 중심에서 우측 0.269*W, 상단 0.099*H 지점.
const APOSTROPHE_CENTER_X = SCREEN_WIDTH / 2 + Math.round(WORDMARK_WIDTH * 0.269);
const APOSTROPHE_Y_BASE = SCREEN_HEIGHT / 2 - 200 + Math.round(WORDMARK_HEIGHT * 0.099);
const RISE_TO = -30;
const DROPLET_W = 16;
const DROPLET_H = 24;

interface Droplet {
  id: number;
  delay: number;
  y: Animated.Value;
  opacity: Animated.Value;
}

function createDroplets(): Droplet[] {
  const interval = RISE_DURATION / DROPLET_COUNT;
  return Array.from({ length: DROPLET_COUNT }, (_, i) => ({
    id: i,
    delay: Math.round(interval * i),
    y: new Animated.Value(APOSTROPHE_Y_BASE),
    opacity: new Animated.Value(0),
  }));
}

export function WelcomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dropletsRef = React.useRef<Droplet[]>(createDroplets());
  const droplets = dropletsRef.current;

  React.useEffect(() => {
    const animations = droplets.map((d) => {
      const rise = Animated.parallel([
        Animated.timing(d.y, {
          toValue: RISE_TO,
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
          toValue: APOSTROPHE_Y_BASE,
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
  }, [droplets]);

  const onStart = () => {
    navigation.replace('MapMain');
  };

  return (
    <View style={styles.root}>
      {/* 떠오르는 쉼표 — 스플래시와 동일 */}
      {droplets.map((d) => (
        <Animated.View
          key={d.id}
          pointerEvents="none"
          style={[
            styles.droplet,
            { opacity: d.opacity, transform: [{ translateY: d.y }] },
          ]}
        >
          <DropletComma width={DROPLET_W} height={DROPLET_H} color="#FFFFFF" />
        </Animated.View>
      ))}

      {/* 중앙 워드마크 + 카피 + CTA */}
      <View style={styles.center} pointerEvents="box-none">
        <BrandWordmark width={WORDMARK_WIDTH} height={WORDMARK_HEIGHT} />

        <View style={styles.copyBlock}>
          <Text style={styles.title}>풀스데이</Text>
          <Text style={styles.subtitle}>혼자든 같이든, 수영장에서 만나요</Text>
        </View>

        <Pressable
          onPress={onStart}
          style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}
          accessibilityRole="button"
          accessibilityLabel="풀스데이 시작"
        >
          <Text style={styles.ctaLabel}>풀스데이 시작</Text>
          <IconLifeBuoy width={20} height={20} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    // Figma 110:4218 — bg pd-mint
    backgroundColor: tokens.color.pdMint,
  },
  center: {
    position: 'absolute',
    top: SCREEN_HEIGHT / 2 - 200,
    left: 16,
    right: 16,
    alignItems: 'center',
    gap: 40,
    zIndex: 2,
  },
  copyBlock: { width: '100%', alignItems: 'center', gap: 16 },
  title: {
    fontSize: 30,
    lineHeight: 38,
    letterSpacing: -0.39,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.white,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 26, // ~1.6
    fontFamily: tokens.font.sans,
    color: tokens.color.white,
    textAlign: 'center',
  },
  cta: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 48,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: tokens.color.pdByellow,
  },
  ctaLabel: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.black,
  },
  droplet: {
    position: 'absolute',
    left: APOSTROPHE_CENTER_X - DROPLET_W / 2,
    width: DROPLET_W,
    height: DROPLET_H,
    zIndex: 1,
  },
});
