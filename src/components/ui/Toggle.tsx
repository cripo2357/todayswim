// 공통 토글 스위치 — Figma 172:11019 / 11023 / 11027 / 11031.
// track 36x20 pill(p2, overflow clip): OFF=pd-bgray(#EBEBEB)·노브 좌 /
// ON=pd-mint(#63CBE8)·노브 우. knob 16 흰 원 + Shadow/md.
// 선택적 라벨(Medium 14/20 -0.084 #1F2937), 라벨 좌/우 선택. row 전체 탭.

import React from 'react';
import {
  Animated,
  Pressable,
  Text,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { tokens } from '@/styles/tokens';

export function Toggle({
  value,
  onValueChange,
  label,
  labelPosition = 'right',
  disabled = false,
  style,
}: {
  value: boolean;
  onValueChange: (next: boolean) => void;
  /** 선택적 라벨 (Figma "Main Text") */
  label?: string;
  /** 라벨 위치 — 'right'(토글 다음, 기본) / 'left'(토글 앞) */
  labelPosition?: 'left' | 'right';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const anim = React.useRef(new Animated.Value(value ? 1 : 0)).current;
  React.useEffect(() => {
    Animated.timing(anim, {
      toValue: value ? 1 : 0,
      duration: 160,
      useNativeDriver: false, // backgroundColor/translateX(layout) 보간
    }).start();
  }, [value, anim]);

  const trackColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [tokens.color.pdBgray, tokens.color.pdMint],
  });
  // track 36 - padding 2*2 - knob 16 = 16px 이동
  const knobX = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 16] });

  const toggle = (
    <Animated.View style={[styles.track, { backgroundColor: trackColor }]}>
      <Animated.View
        style={[styles.knob, { transform: [{ translateX: knobX }] }]}
      />
    </Animated.View>
  );
  const text = label ? <Text style={styles.label}>{label}</Text> : null;

  return (
    <Pressable
      onPress={() => !disabled && onValueChange(!value)}
      disabled={disabled}
      hitSlop={8}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      accessibilityLabel={label}
      style={[styles.row, disabled && styles.disabled, style]}
    >
      {labelPosition === 'left' ? text : null}
      {toggle}
      {labelPosition === 'right' ? text : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Figma 172:11031 — flex gap8 items-center
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  disabled: { opacity: 0.5 },
  // Figma 172:11032 — 36x20 pill, padding 2, overflow clip. 노브는 padding
  // 기준 좌측 시작 → translateX 0(OFF)~16(ON)로 좌우 이동.
  track: {
    width: 36,
    height: 20,
    borderRadius: 999,
    padding: 2,
    overflow: 'hidden',
  },
  // Figma I172:11032;5550:11627 — 16 흰 원 + Shadow/md
  knob: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    boxShadow:
      '0px 8px 16px rgba(15, 23, 42, 0.02), 0px 4px 8px rgba(15, 23, 42, 0.03)',
  },
  // Figma 172:11033 — Medium 14/20 tracking -0.084 #1F2937
  label: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansMedium,
    color: '#1F2937',
  },
});
