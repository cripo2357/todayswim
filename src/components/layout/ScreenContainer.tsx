import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { tokens } from '@/styles/tokens';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** 가장자리 inset 적용 — 기본은 top + bottom */
  edges?: Edge[];
  /** 좌우 패딩 적용 여부. 기본 true */
  withHorizontalPadding?: boolean;
  /** 배경색 — 기본 bg-cream */
  background?: string;
}

/**
 * 모든 화면이 공통으로 두르는 컨테이너.
 * - SafeArea inset (iOS notch / Android nav bar 대응 — Figma의 가짜 home indicator는 무시 — 메모리 §feedback_no_fake_home_indicator)
 * - bg-cream 기본 배경
 * - 좌우 페이지 패딩 20px (DESIGN.md §3-3)
 */
export function ScreenContainer({
  children,
  style,
  edges = ['top', 'bottom'],
  withHorizontalPadding = true,
  background = tokens.color.bgCream,
}: Props) {
  return (
    <SafeAreaView
      edges={edges}
      style={[
        styles.root,
        { backgroundColor: background },
        withHorizontalPadding && styles.padHorizontal,
        style,
      ]}
    >
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  padHorizontal: { paddingHorizontal: tokens.layout.pagePadMobile },
});
