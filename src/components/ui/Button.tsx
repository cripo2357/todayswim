import React from 'react';
import { Pressable, Text, View, StyleSheet, ActivityIndicator, StyleProp, ViewStyle } from 'react-native';
import { tokens } from '@/styles/tokens';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface Props {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  /** 좌측 아이콘 (lucide 컴포넌트 등) */
  iconLeft?: React.ReactNode;
  /** 우측 아이콘 */
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Button.
 * DESIGN.md §4-1:
 * - 3가지 variant: primary (pool-500 bg) / secondary (pool-100 bg) / ghost (transparent)
 * - 3가지 size: sm 32px / md 40px / lg 48px
 * - 터치 타겟 최소 40×40
 * - 모서리 radius-md(10)
 *
 * Disabled primary 정책 (메모리 §feedback_disabled_button_policy 응용):
 * - 회색 X. Brand bg + 톤다운 text 로 처리.
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  iconLeft,
  iconRight,
  fullWidth,
  style,
}: Props) {
  const sizeStyles = SIZE[size];
  const variantStyles = VARIANT[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        sizeStyles.container,
        variantStyles.container,
        isDisabled && variantStyles.disabledContainer,
        fullWidth && styles.fullWidth,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variantStyles.label.color} />
      ) : (
        <View style={styles.row}>
          {iconLeft}
          <Text style={[sizeStyles.label, variantStyles.label, isDisabled && variantStyles.disabledLabel]}>
            {label}
          </Text>
          {iconRight}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: tokens.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: { alignSelf: 'stretch' },
  pressed: { opacity: 0.85 },
  row: { flexDirection: 'row', alignItems: 'center', gap: tokens.space[2] },
});

const SIZE = {
  sm: StyleSheet.create({
    container: { height: 32, paddingHorizontal: 12, minWidth: 64 },
    label: { ...tokens.text.bodySm, fontFamily: tokens.font.sansSemibold },
  }),
  md: StyleSheet.create({
    container: { height: 40, paddingHorizontal: 16 },
    label: { ...tokens.text.body, fontFamily: tokens.font.sansSemibold },
  }),
  lg: StyleSheet.create({
    container: { height: 48, paddingHorizontal: 20 },
    label: { ...tokens.text.body, fontFamily: tokens.font.sansSemibold, fontSize: 17 },
  }),
};

const VARIANT = {
  primary: StyleSheet.create({
    container: { backgroundColor: tokens.color.brandBlue },
    disabledContainer: { backgroundColor: tokens.color.pool100 },
    label: { color: tokens.color.white },
    disabledLabel: { color: tokens.color.pool300 },
  }),
  secondary: StyleSheet.create({
    container: { backgroundColor: '#EFF6FF' }, // Brand/5
    disabledContainer: { backgroundColor: tokens.color.bgSubtle },
    label: { color: tokens.color.brandBlue },
    disabledLabel: { color: tokens.color.ink400 },
  }),
  ghost: StyleSheet.create({
    container: { backgroundColor: tokens.color.transparent },
    disabledContainer: {},
    label: { color: tokens.color.ink700 },
    disabledLabel: { color: tokens.color.ink400 },
  }),
  outline: StyleSheet.create({
    container: {
      backgroundColor: tokens.color.bgPaper,
      borderWidth: 1,
      borderColor: tokens.color.brandBlue,
    },
    disabledContainer: {
      backgroundColor: tokens.color.bgPaper,
      borderColor: tokens.color.lineDefault,
    },
    label: { color: tokens.color.brandBlue },
    disabledLabel: { color: tokens.color.ink400 },
  }),
};
