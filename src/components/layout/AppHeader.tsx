import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { tokens } from '@/styles/tokens';

interface Props {
  title?: string;
  /** 뒤로가기 버튼 표시 — 기본 true (네비 가능 시 자동 렌더) */
  showBack?: boolean;
  rightSlot?: React.ReactNode;
}

/**
 * 화면 상단 헤더. DESIGN.md §10-1:
 * - 모바일 64px / 데스크톱 72px
 * - 좌측 로고 또는 ←
 * - 우측 액션
 * - 하단 1px line-subtle
 */
export function AppHeader({ title, showBack = true, rightSlot }: Props) {
  const navigation = useNavigation();
  const canGoBack = showBack && navigation.canGoBack();

  return (
    <View style={styles.root}>
      <View style={styles.left}>
        {canGoBack ? (
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={8}
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
            accessibilityRole="button"
            accessibilityLabel="뒤로 가기"
          >
            <ChevronLeft size={24} color={tokens.color.ink900} strokeWidth={1.5} />
          </Pressable>
        ) : null}
      </View>
      {title ? (
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      ) : (
        <View />
      )}
      <View style={styles.right}>{rightSlot}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    height: tokens.layout.headerHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: tokens.color.lineSubtle,
    backgroundColor: tokens.color.bgCream,
  },
  left: { width: 44, alignItems: 'flex-start' },
  right: { width: 44, alignItems: 'flex-end' },
  backBtn: {
    width: tokens.layout.touchTargetMin,
    height: tokens.layout.touchTargetMin,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...tokens.text.h4,
    color: tokens.color.ink900,
    flex: 1,
    textAlign: 'center',
  },
});
