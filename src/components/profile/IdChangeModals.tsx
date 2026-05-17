// Figma 163:6737 (ID 변경 확인) / 163:6885 (ID 변경 완료).
// dim backdrop + 흰 카드(r32 p16 gap24) + 일러스트 + 제목/설명 + 액션.
// 163:6737 일러스트(혼란/비밀번호)는 친구거절 163:10420과 동일 에셋 공유.

import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { tokens } from '@/styles/tokens';
import IconIdBadge from '@assets/icons/id-badge.svg';
import IconIdChangeBlue from '@assets/icons/id-change-blue.svg';
import IllustConfused from '@assets/illustrations/confused-password.svg';
import IllustIdDone from '@assets/illustrations/id-change-done.svg';

function ModalShell({
  children,
  onRequestClose,
  illustration,
  illustStyle,
}: {
  children: React.ReactNode;
  onRequestClose: () => void;
  illustration: React.ReactNode;
  illustStyle: StyleProp<ViewStyle>;
}) {
  return (
    <View style={styles.root}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onRequestClose} />
      <View style={styles.card}>
        <View style={[styles.illustWrap, illustStyle]}>{illustration}</View>
        {children}
      </View>
    </View>
  );
}

/** Figma 163:6737 — ID 변경 확인 */
export function IdChangeModal({
  visible,
  onKeep,
  onChange,
}: {
  visible: boolean;
  /** 변경하지 않음 (닫기) */
  onKeep: () => void;
  /** ID 변경 진행 */
  onChange: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onKeep}>
      <ModalShell
        onRequestClose={onKeep}
        illustration={<IllustConfused width="100%" height="100%" />}
        illustStyle={styles.illustConfused}
      >
        <View style={styles.textGroup}>
          <Text style={styles.title}>ID 변경</Text>
          <Text style={styles.desc}>내 계정의 ID를 변경하겠습니까?</Text>
        </View>
        <View style={styles.actions}>
          <Pressable
            onPress={onKeep}
            style={({ pressed }) => [styles.yellowBtn, pressed && { opacity: 0.85 }]}
            accessibilityRole="button"
            accessibilityLabel="ID를 변경하지 않습니다"
          >
            <Text style={styles.yellowLabel}>변경하지 않습니다</Text>
            <IconIdBadge width={20} height={20} />
          </Pressable>
          <Pressable
            onPress={onChange}
            style={({ pressed }) => [styles.linkBtn, pressed && { opacity: 0.6 }]}
            accessibilityRole="button"
            accessibilityLabel="ID를 변경합니다"
          >
            <IconIdChangeBlue width={20} height={20} />
            <Text style={styles.linkLabel}>ID를 변경합니다.</Text>
          </Pressable>
        </View>
      </ModalShell>
    </Modal>
  );
}

/** Figma 163:6885 — ID 변경 완료 */
export function IdChangeDoneModal({
  visible,
  onConfirm,
}: {
  visible: boolean;
  onConfirm: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onConfirm}>
      <ModalShell
        onRequestClose={onConfirm}
        illustration={<IllustIdDone width="100%" height="100%" />}
        illustStyle={styles.illustDone}
      >
        <View style={styles.textGroup}>
          <Text style={styles.title}>ID 변경 완료</Text>
          <Text style={styles.desc}>
            ID를 변경했습니다. 변경한 ID를 확인하세요.
          </Text>
        </View>
        <View style={styles.actions}>
          <Pressable
            onPress={onConfirm}
            style={({ pressed }) => [styles.yellowBtn, pressed && { opacity: 0.85 }]}
            accessibilityRole="button"
            accessibilityLabel="알겠습니다"
          >
            <Text style={styles.yellowLabel}>알겠습니다</Text>
            <IconIdBadge width={20} height={20} />
          </Pressable>
        </View>
      </ModalShell>
    </Modal>
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
  // Figma 163:6741 — 흰 카드 r32 p16 gap24 w343
  card: {
    width: '100%',
    maxWidth: 343,
    backgroundColor: tokens.color.white,
    borderRadius: 32,
    padding: 16,
    gap: 24,
    alignItems: 'center',
  },
  // Figma 163:7149 — 일러스트 풀폭(원본 비율 유지)
  illustWrap: { width: '100%' },
  illustConfused: { aspectRatio: 343 / 227 },
  illustDone: { aspectRatio: 313 / 221 }, // friend 163:6885 새 일러스트 viewBox
  // Figma 163:6814 — 제목/설명 그룹
  textGroup: { gap: 12, alignItems: 'center', alignSelf: 'stretch' },
  // Figma 163:6815 — Bold 24/32 -0.288 #1F2937
  title: {
    fontFamily: tokens.font.sansBold,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.288,
    color: '#1F2937',
    textAlign: 'center',
  },
  // Figma 163:6816 — Regular 16 lineHeight 1.6 #4B5563
  desc: {
    fontFamily: tokens.font.sans,
    fontSize: 16,
    lineHeight: 26,
    color: '#4B5563',
    textAlign: 'center',
  },
  // Figma 163:6858 — gap24
  actions: { gap: 24, alignSelf: 'stretch', alignItems: 'center' },
  // Figma 163:6870 — pd-byellow r14 minH48 px20 py12 gap10
  yellowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 48,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: tokens.color.pdByellow,
    alignSelf: 'stretch',
  },
  // Figma 163:6872 — SemiBold 16/22 -0.112 black
  yellowLabel: {
    fontFamily: tokens.font.sansSemibold,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    color: tokens.color.black,
  },
  // Figma 163:6877 — gap8 center
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  // Figma 163:6879 — SemiBold 14/20 -0.084 pd-blue
  linkLabel: {
    fontFamily: tokens.font.sansSemibold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    color: tokens.color.pdBlue,
  },
});
