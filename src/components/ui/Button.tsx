import React from 'react';
import { Pressable, Text, View, StyleSheet, ActivityIndicator, StyleProp, ViewStyle } from 'react-native';
import { tokens } from '@/styles/tokens';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'pdYellow';
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
  const hasIcon = !!iconLeft || !!iconRight;

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
        // 아이콘 있을 때: row content-sized로 아이콘+텍스트가 한 그룹으로 가운데 정렬 (Figma 77:722 패턴).
        // 아이콘 없을 때: row flex:1로 stretch + label flex:1 textAlign center로 폭 가득 채움 (Figma 5:15636 패턴).
        <View style={[styles.row, !hasIcon && styles.rowStretch]}>
          {iconLeft}
          <Text
            style={[
              sizeStyles.label,
              variantStyles.label,
              !hasIcon && styles.labelStretch,
              isDisabled && variantStyles.disabledLabel,
            ]}
          >
            {label}
          </Text>
          {iconRight}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Figma CTA 표준: radius 14, label↔icon gap 10
  base: {
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: { alignSelf: 'stretch' },
  pressed: { opacity: 0.85 },
  // 기본 row: content-sized — 아이콘+라벨이 한 그룹으로 Pressable의 justify-center에 의해 중앙 배치
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  // 아이콘 없을 때만: row가 가로로 stretch — Pressable에 너비 제약(fullWidth/flex:1) 있을 때 폭 가득
  rowStretch: { flex: 1 },
  // 아이콘 없을 때만: label이 row를 가득 채우면서 textAlign center
  labelStretch: { flex: 1 },
});

const SIZE = {
  sm: StyleSheet.create({
    container: { height: 32, paddingHorizontal: 12, minWidth: 64 },
    label: { ...tokens.text.bodySm, fontFamily: tokens.font.sansSemibold, textAlign: 'center' },
  }),
  md: StyleSheet.create({
    container: { height: 40, paddingHorizontal: 16 },
    label: { ...tokens.text.body, fontFamily: tokens.font.sansSemibold, textAlign: 'center' },
  }),
  lg: StyleSheet.create({
    // Figma 74:1003 / 5:15636 (text-only, 0 padding) / 77:722 (icon+text, px-20 py-12).
    // height 48 고정. 패딩은 아이콘 유무와 무관하게 둘 다 시각적 동일하므로 기본 0.
    container: { height: 48 },
    // Figma "Text md SemiBold" — 16/22 tracking -0.112. flex:1은 아이콘 없을 때만 적용 (row 참고).
    label: {
      fontFamily: tokens.font.sansSemibold,
      fontSize: 16,
      lineHeight: 22,
      letterSpacing: -0.112,
      textAlign: 'center',
    },
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
  // 새 브랜드 lime yellow CTA — PoolBottomCard "자유수영 시간표 보기" (Figma 93:10597)
  pdYellow: StyleSheet.create({
    container: { backgroundColor: tokens.color.pdByellow },
    disabledContainer: { backgroundColor: tokens.color.bgSubtle },
    label: { color: tokens.color.ink900 },
    disabledLabel: { color: tokens.color.ink400 },
  }),
};
