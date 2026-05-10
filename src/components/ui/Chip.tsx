import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { tokens } from '@/styles/tokens';

interface Props {
  label: string;
  active?: boolean;
  onPress?: () => void;
}

/**
 * Chip (필터·요일 등).
 * DESIGN.md §4-4:
 * - 활성: pool-100 bg + pool-700 text + pool-300 border
 * - 비활성: 흰 bg + ink-700 text + line-default border
 * - radius pill, height 32
 */
export function Chip({ label, active, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        active ? styles.active : styles.inactive,
        pressed && { opacity: 0.85 },
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      <Text style={[styles.label, active ? styles.activeLabel : styles.inactiveLabel]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: tokens.radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  active: {
    backgroundColor: '#EFF6FF', // Brand/5 from Figma
    borderColor: tokens.color.brandBlue,
  },
  inactive: {
    backgroundColor: tokens.color.bgPaper,
    borderColor: tokens.color.lineDefault,
  },
  label: { ...tokens.text.bodySm, fontFamily: tokens.font.sansSemibold },
  activeLabel: { color: tokens.color.brandBlue },
  inactiveLabel: { color: tokens.color.ink700 },
});
