// 공통 검색 입력 디자인시스템 — Figma 122:7490 / 147:5413.
// 알약 컨테이너 + 검색어 입력 + clear(X). 수영 일정 추가 시트 수영장 검색에서
// 일반화 — "어디서든 검색 입력" 시 재사용.
//
// RN Android는 TextInput placeholder에 커스텀 폰트가 안 먹어 빈 값일 때
// Text 오버레이로 placeholder를 고정한다. ref는 내부 TextInput으로 전달
// (열릴 때 외부에서 .focus() 호출 가능).

import React from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { XCircle } from 'lucide-react-native';
import { tokens } from '@/styles/tokens';

interface SearchInputProps {
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  autoFocus?: boolean;
}

export const SearchInput = React.forwardRef<TextInput, SearchInputProps>(
  function SearchInput({ value, onChangeText, placeholder, autoFocus }, ref) {
    return (
      <View style={styles.box}>
        <View style={styles.inputWrap}>
          <TextInput
            ref={ref}
            autoFocus={autoFocus}
            value={value}
            onChangeText={onChangeText}
            style={styles.input}
          />
          {value.length === 0 ? (
            <Text style={styles.placeholder} pointerEvents="none">
              {placeholder}
            </Text>
          ) : null}
        </View>
        {/* Figma 147:5413 — 입력값 있을 때만 clear 노출 */}
        {value.length > 0 ? (
          <Pressable
            onPress={() => onChangeText('')}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="검색어 지우기"
          >
            <XCircle size={20} color="#94A3B8" strokeWidth={2} />
          </Pressable>
        ) : null}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  // 알약 컨테이너 — flex row, gap8, minH40, p8, #F8FAFC
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 40,
    padding: 8,
    borderRadius: 9999,
    backgroundColor: '#F8FAFC',
  },
  inputWrap: { flex: 1, justifyContent: 'center' },
  // Figma 5626:21974 — Medium 16/22 -0.112 #4B5563
  input: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansMedium,
    color: '#4B5563',
    padding: 0,
  },
  // RN Android 커스텀 폰트 placeholder 회피 — 빈 값 시 Text 오버레이.
  placeholder: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    textAlignVertical: 'center',
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansMedium,
    color: '#4B5563',
    includeFontPadding: false,
  },
});
