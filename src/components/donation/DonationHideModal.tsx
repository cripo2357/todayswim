// 후원 비공개 확인 토스트 — Figma 239:3426.
//
// 화면 하단 토스트 형식 (사용자 정정 2026-05-21 — 중앙 X / 하단 O):
//  - bg white / border 1px pd-gray (#C8C8C8) / rounded 16 / padding 12 / gap 12
//  - 좌측: 텍스트 영역 (제목 #1F2937 Bold 16 + 본문 #4B5563 Medium 14)
//  - 우측: 노란 CTA "비공개" — pd-byellow / rounded 12 / padding 16×10
//  - 화면 하단 + safe-area 인셋 + 좌우 16px 마진
//
// 동작: hidden=true 토글(실질적 삭제 효과 — 본인 포함 모든 화면에서 미노출,
// DB 이력은 보존). UI 텍스트의 "삭제" 늬앙스는 사용자 인지와 일치.

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

export function DonationHideModal({
  visible,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
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
        style={[
          styles.backdrop,
          { paddingBottom: 16 + insets.bottom },
        ]}
        onPress={onClose}
      >
        <Pressable style={styles.card} onPress={() => undefined}>
          <View style={styles.body}>
            <Text style={styles.title}>후원 비공개</Text>
            <Text style={styles.message}>후원 내용을 삭제하겠습니까?</Text>
          </View>
          <Pressable
            style={styles.cta}
            onPress={() => {
              onConfirm();
              onClose();
            }}
            accessibilityRole="button"
            accessibilityLabel="후원 비공개로 전환"
          >
            <Text style={styles.ctaLabel}>비공개</Text>
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
  // Figma 충실도 — Gray/80 = #1F2937, Gray/60 = #4B5563 (ink900/500 토큰과 다름).
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
