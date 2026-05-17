// 로그아웃 확인 (Figma 173:12943).
// dim + 흰 카드(r32 p16 gap24 w343) + 끊긴 플러그 일러스트(friend-reject 재사용)
// + 제목(Bold24) + 설명(Regular16/26) + pd-yellow 단일 버튼(LogOut 아이콘).
// 보조버튼 없음 — dim 탭으로 취소. ConfirmFriendActionModal 동일 토큰.

import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { LogOut } from 'lucide-react-native';
import { tokens } from '@/styles/tokens';
import IllustPlug from '@assets/illustrations/friend-reject.svg';

export function ConfirmLogoutModal({
  visible,
  onConfirm,
  onClose,
}: {
  visible: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.card}>
          <View style={styles.illustWrap}>
            <IllustPlug width="100%" height="100%" />
          </View>

          <View style={styles.textGroup}>
            <Text style={styles.title}>로그아웃</Text>
            <Text style={styles.desc}>풀스데이를 로그아웃하겠습니까?</Text>
          </View>

          <Pressable
            onPress={onConfirm}
            style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.85 }]}
            accessibilityRole="button"
            accessibilityLabel="로그아웃"
          >
            <Text style={styles.primaryLabel}>로그아웃</Text>
            <LogOut size={20} color={tokens.color.black} strokeWidth={2} />
          </Pressable>
        </View>
      </View>
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
  // Figma 173:12943 — 흰 카드 r32 p16 gap24 w343
  card: {
    width: '100%',
    maxWidth: 343,
    backgroundColor: tokens.color.white,
    borderRadius: 32,
    padding: 16,
    gap: 24,
    alignItems: 'center',
  },
  // friend-reject(플러그) viewBox 527x242 재사용
  illustWrap: { width: '100%', aspectRatio: 527 / 242 },
  textGroup: { gap: 12, alignItems: 'center', alignSelf: 'stretch' },
  title: {
    fontFamily: tokens.font.sansBold,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.288,
    color: '#1F2937',
    textAlign: 'center',
  },
  desc: {
    fontFamily: tokens.font.sans,
    fontSize: 16,
    lineHeight: 26,
    color: '#4B5563',
    textAlign: 'center',
  },
  // pd-yellow 단일 버튼 — r14 minH48 px20 py12 gap10 (done 버튼 패밀리)
  primaryBtn: {
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
  primaryLabel: {
    fontFamily: tokens.font.sansBold,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    color: tokens.color.black,
  },
});
