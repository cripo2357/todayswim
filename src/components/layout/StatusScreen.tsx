// 4종 status/error 화면 공통 레이아웃 (Figma 77:1064/77:1388/77:1462/77:1636).
// 일러스트(280h) → 배지 → 헤딩+바디 → primary 버튼. 중앙 수직 정렬, w-343.

import React from 'react';
import { View, Text, Pressable, StyleSheet, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { tokens } from '@/styles/tokens';

export type BadgeVariant = 'destructive' | 'brand';
/** primary CTA 색 — 기존 상태화면=파랑, 일부(다기기 로그아웃 등)=브랜드 노랑. */
export type ButtonVariant = 'blue' | 'yellow';

export interface StatusScreenProps {
  /** 280h x 343w 영역에 들어갈 일러스트. 미지정 시 placeholder. */
  illustration?: React.ReactNode;
  badgeIcon?: React.ReactNode;
  badgeText: string;
  badgeVariant?: BadgeVariant;
  heading: string;
  body: string;
  buttonIcon?: React.ReactNode;
  buttonLabel: string;
  onButtonPress: () => void;
  /** CTA 색 — 기본 'blue'(흰 글씨) / 'yellow'(pdByellow + 검정 글씨). */
  buttonVariant?: ButtonVariant;
  /** 좌상단 백 화살표 표시 (404만). 기본 false (블로킹 화면). */
  showBack?: boolean;
}

export function StatusScreen({
  illustration,
  badgeIcon,
  badgeText,
  badgeVariant = 'destructive',
  heading,
  body,
  buttonIcon,
  buttonLabel,
  onButtonPress,
  buttonVariant = 'blue',
  showBack = false,
}: StatusScreenProps) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const badgeStyle = badgeVariant === 'destructive' ? styles.badgeDestructive : styles.badgeBrand;
  const badgeTextStyle = badgeVariant === 'destructive' ? styles.badgeTextDestructive : styles.badgeTextBrand;
  const isYellow = buttonVariant === 'yellow';

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      {showBack && navigation.canGoBack() ? (
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={8}
          style={[styles.backBtn, { top: insets.top + 8 }]}
          accessibilityRole="button"
          accessibilityLabel="뒤로 가기"
        >
          <ChevronLeft size={24} color={tokens.color.ink900} strokeWidth={1.5} />
        </Pressable>
      ) : null}

      {/* 중앙 정렬된 컨텐츠 그룹 — Figma 77:1065 등: w-343, gap-32 */}
      <View style={styles.center}>
        <View style={styles.content}>
          <View style={styles.illustWrap}>
            {illustration ?? <View style={styles.illustPlaceholder} />}
          </View>

          <View style={styles.textBlock}>
            <View style={[styles.badge, badgeStyle]}>
              {badgeIcon}
              <Text style={[styles.badgeText, badgeTextStyle]}>{badgeText}</Text>
            </View>

            <View style={styles.headingBlock}>
              <Text style={styles.heading}>{heading}</Text>
              <Text style={styles.body}>{body}</Text>
            </View>

            <Pressable
              onPress={onButtonPress}
              style={({ pressed }) => [
                styles.button,
                isYellow && styles.buttonYellow,
                pressed && { opacity: 0.85 },
              ]}
              accessibilityRole="button"
              accessibilityLabel={buttonLabel}
            >
              {buttonIcon}
              <Text style={[styles.buttonLabel, isYellow && styles.buttonLabelDark]}>
                {buttonLabel}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const CONTENT_W = 343;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: tokens.color.white,
  },
  // Figma 77:1164 — Top Nav: px-16 py-8, h-48
  backBtn: {
    position: 'absolute',
    left: 16,
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginLeft: -8,
    zIndex: 10,
  },
  // 중앙 수직 + 좌우 16px 패딩
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  content: {
    width: CONTENT_W,
    maxWidth: '100%',
    gap: 32, // Figma frame gap-32
  },
  // Figma 일러스트 영역 — 280h x 343w
  illustWrap: {
    width: '100%',
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: tokens.color.bgSubtle,
    borderRadius: 16,
  },
  // 배지 + 헤딩 + 버튼 묶음 — gap-24 column items-center
  textBlock: {
    gap: 24,
    alignItems: 'center',
    width: '100%',
  },
  // Figma Badge Text — px-12 py-6, gap-8, rounded-10
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  badgeDestructive: {
    backgroundColor: '#FFF1F2', // Destructive/5
  },
  badgeBrand: {
    borderWidth: 1,
    borderColor: '#2563EB', // Brand/60
    backgroundColor: tokens.color.transparent,
  },
  // Figma Text sm/Medium — 14/20 -0.084
  badgeText: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansMedium,
    textAlign: 'center',
  },
  badgeTextDestructive: { color: '#F43F5E' }, // Destructive/50
  badgeTextBrand: { color: '#2563EB' },
  headingBlock: {
    gap: 12,
    alignItems: 'center',
    width: '100%',
  },
  // Figma Heading sm/Bold — 30/38 -0.39 #1F2937
  heading: {
    fontSize: 30,
    lineHeight: 38,
    letterSpacing: -0.39,
    fontFamily: tokens.font.sansBold,
    color: '#1F2937',
    textAlign: 'center',
    width: '100%',
  },
  // Figma Paragraph/md — Regular 16, lh 1.6 (≈26) #4B5563
  body: {
    fontSize: 16,
    lineHeight: 26,
    fontFamily: tokens.font.sans,
    color: '#4B5563',
    textAlign: 'center',
    width: '100%',
  },
  // Primary CTA — bg #007AFF, h-48, px-20 py-12, gap-10, radius-14, full-width
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    minHeight: 48,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: tokens.color.brandBlue,
  },
  // 노랑 CTA(브랜드) — pdByellow + 검정 글씨 (다기기 로그아웃 등).
  buttonYellow: { backgroundColor: tokens.color.pdByellow },
  // Figma Text md/SemiBold — 16/22 -0.112 white
  buttonLabel: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.white,
  },
  buttonLabelDark: { color: tokens.color.black },
});
