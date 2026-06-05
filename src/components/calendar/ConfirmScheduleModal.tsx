// 수영 일정 삭제/취소 확인 (Figma 169:6029).
// 지난 일정 '삭제' / 예정 일정 '취소' 공용 — 문구만 prop으로 다름.
// dim + 흰 카드(r32 p16 gap24 w343) + 달리기 일러스트(+빨강X 베이크)
// + 제목(Bold24) + 설명(Regular16/26) + pd-pink 주버튼(Trash2)
// + 보조 텍스트버튼(pd-blue, 아이콘 없음). ConfirmFriendActionModal 동일 토큰.

import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { AppModal } from '@/components/ui/AppModal';
import { Trash2 } from 'lucide-react-native';
import { tokens } from '@/styles/tokens';
import IllustDelete from '@assets/illustrations/schedule-delete.svg';

export function ConfirmScheduleModal({
  visible,
  title,
  desc,
  primaryLabel,
  secondaryLabel,
  onPrimary,
  onSecondary,
  onClose,
}: {
  visible: boolean;
  title: string;
  desc: string;
  primaryLabel: string;
  secondaryLabel: string;
  onPrimary: () => void;
  onSecondary: () => void;
  onClose: () => void;
}) {
  return (
    <AppModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.card}>
          <View style={styles.illustWrap}>
            <IllustDelete width="100%" height="100%" />
          </View>

          <View style={styles.textGroup}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.desc}>{desc}</Text>
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={onPrimary}
              style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.85 }]}
              accessibilityRole="button"
              accessibilityLabel={primaryLabel}
            >
              <Text style={styles.primaryLabel}>{primaryLabel}</Text>
              <Trash2 size={20} color={tokens.color.white} strokeWidth={2} />
            </Pressable>

            <Pressable
              onPress={onSecondary}
              style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.6 }]}
              accessibilityRole="button"
              accessibilityLabel={secondaryLabel}
            >
              <Text style={styles.secondaryLabel}>{secondaryLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </AppModal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  // Figma 169:6029 — 흰 카드 r32 p16 gap24 w343
  card: {
    width: '100%',
    maxWidth: 343,
    backgroundColor: tokens.color.white,
    borderRadius: 32,
    padding: 16,
    gap: 24,
    alignItems: 'center',
  },
  // schedule-delete.svg viewBox 311x206 (빨강 X 일러스트에 베이크)
  illustWrap: { width: '100%', aspectRatio: 311 / 206 },
  textGroup: { gap: 12, alignItems: 'center', alignSelf: 'stretch' },
  // Bold 24/32 -0.288 #1F2937
  title: {
    fontFamily: tokens.font.sansBold,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.288,
    color: '#1F2937',
    textAlign: 'center',
  },
  // Regular 16 lineHeight 1.6 #4B5563
  desc: {
    fontFamily: tokens.font.sans,
    fontSize: 16,
    lineHeight: 26,
    color: '#4B5563',
    textAlign: 'center',
  },
  actions: { gap: 24, alignSelf: 'stretch', alignItems: 'center' },
  // pd-pink #FF2D55, r14, minH48, px20 py12, gap10
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 48,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#FF2D55',
    alignSelf: 'stretch',
  },
  // SemiBold 16/22 -0.112 white
  primaryLabel: {
    fontFamily: tokens.font.sansSemibold,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    color: tokens.color.white,
  },
  // 보조 — 텍스트만(아이콘 없음), pd-blue
  secondaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 22,
  },
  // SemiBold 14/20 -0.084 pd-blue #6890CB
  secondaryLabel: {
    fontFamily: tokens.font.sansSemibold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    color: tokens.color.pdBlue,
  },
});
