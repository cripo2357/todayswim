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
      <View style={styles.right}>
        {rightSlot ?? (
          // Figma 75:1538 — 우측에 빈 24x24 spacer를 둬서 title이 시각적으로 가운데 정렬되게 함.
          // (좌측 back button과 대칭 — backBtn width 40 + marginLeft -8 = rightSpacer 같은 dim)
          title && canGoBack ? <View style={styles.spacer} /> : null
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Figma top nav (38:612/55:1298 등): min-h-48, no bottom border, px-16 (outer frame 기준)
  root: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 16,
    backgroundColor: tokens.color.bgCream,
  },
  // 백 버튼 영역 — width 0 면 시각상 백 화살표만, 더 큰 tap target 위해 40 padding (negative margin으로 16 padding 안에 정렬)
  left: { alignItems: 'flex-start', justifyContent: 'center' },
  // 우측 슬롯: 컨텐츠가 길어질 수 있게 가변 너비 + 우측 정렬. title 없을 때 비대칭 OK.
  right: { paddingRight: 16, alignItems: 'flex-end', justifyContent: 'center' },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8, // icon 24가 padding 16 안에 깔끔히 정렬되도록 tap area를 좌측으로 살짝
  },
  // backBtn 미러 — title 가운데 정렬용 (rightSlot 없을 때만 렌더)
  spacer: {
    width: 40,
    height: 40,
    marginRight: -8,
  },
  title: {
    ...tokens.text.h4,
    color: tokens.color.ink900,
    flex: 1,
    textAlign: 'center',
  },
});
