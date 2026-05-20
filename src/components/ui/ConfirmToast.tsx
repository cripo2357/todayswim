// 하단 확인 토스트 — Pool's day 공통 컴포넌트.
//
// 형식 (Figma 239:3426 기준):
//   - 화면 하단 가로 띠 + 좌우 16 마진 + safe-area inset 반영
//   - bg white / border 1px pd-gray (#C8C8C8) / rounded 16 / padding 12 / gap 12
//   - 좌측 텍스트(제목 Bold 16 + 본문 Medium 14) + 우측 노란 CTA
//   - animationType='fade' — dim 즉시 깔리고 카드 같이 fade in (slide=dim 슬라이드 회귀)
//
// 사용처:
//   - DonationHideModal (후원 비공개 — Figma 239:3426)
//   - 향후 짧은 1액션 확인이 필요한 액션(삭제·해제·전환) — confirm dialog 보다
//     덜 무겁고 모바일 친화. 큰 결정/일러스트 필요 시엔 중앙 confirm 모달 사용.
//
// 메모리: [[toast_pattern]] 토스트 규약 단일 출처.

import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tokens } from '@/styles/tokens';

export function ConfirmToast({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  ctaLabel,
  ctaAccessibilityLabel,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  ctaLabel: string;
  ctaAccessibilityLabel?: string;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={[styles.backdrop, { paddingBottom: 16 + insets.bottom }]}
        onPress={onClose}
      >
        <Pressable style={styles.card} onPress={() => undefined}>
          <View style={styles.body}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
          </View>
          <Pressable
            style={styles.cta}
            onPress={() => {
              onConfirm();
              onClose();
            }}
            accessibilityRole="button"
            accessibilityLabel={ctaAccessibilityLabel ?? ctaLabel}
          >
            <Text style={styles.ctaLabel}>{ctaLabel}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.32)',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 343,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: tokens.color.pdGray, // #C8C8C8
    borderRadius: 16,
    padding: 12,
    gap: 12,
  },
  body: { flex: 1, gap: 6 },
  // Figma 충실도 — Gray/80 #1F2937, Gray/60 #4B5563 (ink900/500 토큰과 별개,
  // [[figma_color_token_mismatch]]).
  title: {
    fontFamily: tokens.font.sansBold,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    color: '#1F2937',
  },
  message: {
    fontFamily: tokens.font.sansMedium,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    color: '#4B5563',
  },
  cta: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: tokens.color.pdByellow, // #EAFF00
    borderRadius: 12,
  },
  ctaLabel: {
    fontFamily: tokens.font.sansSemibold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    color: '#000000',
  },
});
