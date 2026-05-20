// 후원 비공개 확인 모달 — Figma 239:3426.
//
// 본문: "후원 내용을 삭제하겠습니까?" — UI 텍스트는 "삭제" 늬앙스이지만 실제
// 동작은 hidden = true (이력은 보존, 다른 사용자에게만 미노출). row delete X.
// 노란(pdByellow) "비공개" CTA 버튼 + 캔슬 영역.

import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
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
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
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
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.color.bgPaper,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    ...tokens.shadow.lg,
  },
  body: { flex: 1, gap: 4 },
  title: {
    fontSize: 16,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.ink900,
  },
  message: {
    fontSize: 14,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink500,
  },
  cta: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: tokens.color.pdByellow,
    borderRadius: 999,
  },
  ctaLabel: {
    fontSize: 14,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.ink900,
  },
});
