import React, { useState } from 'react';
import {
  TextInput, View, Text, StyleSheet, TextInputProps, StyleProp, ViewStyle,
} from 'react-native';
import { tokens } from '@/styles/tokens';

type Variant = 'default' | 'jumbo';

interface Props extends TextInputProps {
  /** 라벨 (윗줄에 표시) */
  label?: string;
  /** 잠보 = 큰 입력 (Figma "Input Text Jumbo") */
  variant?: Variant;
  /** 에러 메시지 */
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

/**
 * Input.
 * DESIGN.md §4-3:
 * - 높이 44px (default) / 64px (jumbo)
 * - border 1px line-default → focus 2px pool-500 + pool-100 bg
 * - placeholder ink-400
 *
 * KeyboardAvoidingView은 화면 단에서 처리 (메모리 §feedback_keyboard_avoidance).
 */
export function Input({
  label, variant = 'default', error, containerStyle, onFocus, onBlur, style, ...rest
}: Props) {
  const [focused, setFocused] = useState(false);
  const isJumbo = variant === 'jumbo';

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          isJumbo ? styles.boxJumbo : styles.boxDefault,
          focused && (isJumbo ? styles.boxJumboFocused : styles.boxDefaultFocused),
          error && styles.boxError,
        ]}
      >
        <TextInput
          {...rest}
          placeholderTextColor={tokens.color.ink400}
          style={[isJumbo ? styles.inputJumbo : styles.inputDefault, style]}
          onFocus={(e) => { setFocused(true); onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); onBlur?.(e); }}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: tokens.space[2] },
  label: { ...tokens.text.label, color: tokens.color.ink700, textTransform: 'uppercase' },

  boxDefault: {
    height: 44,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    borderColor: tokens.color.lineDefault,
    backgroundColor: tokens.color.bgPaper,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  boxDefaultFocused: {
    borderWidth: 2,
    borderColor: tokens.color.pool500,
    backgroundColor: tokens.color.pool50,
  },
  boxJumbo: {
    height: 64,
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: tokens.color.lineDefault,
    backgroundColor: tokens.color.bgPaper,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  boxJumboFocused: {
    borderWidth: 2,
    borderColor: tokens.color.pool500,
    backgroundColor: tokens.color.pool50,
  },
  boxError: {
    borderColor: tokens.color.warmCoral,
  },
  inputDefault: {
    ...tokens.text.body,
    color: tokens.color.ink900,
    padding: 0, // RN 안드로이드 기본 padding 제거
  },
  inputJumbo: {
    fontFamily: tokens.font.sansSemibold,
    fontSize: 22,
    lineHeight: 28,
    color: tokens.color.ink900,
    padding: 0,
  },
  errorText: {
    ...tokens.text.caption,
    color: tokens.color.warmCoral,
  },
});
