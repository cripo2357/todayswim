// 친구 추가 요청 완료 (Figma 169:5727).
// dim backdrop + 흰 카드(r32 p16 gap24 w343) + friend-request-sent 일러스트
// + 제목(Bold24) + 설명(Regular16/26 #4B5563) + pd-yellow 확인 버튼(Users 아이콘).
// ConfirmFriendActionModal과 동일 카드 디자인 토큰(같은 완료 카드 패밀리).

import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { Users } from 'lucide-react-native';
import { tokens } from '@/styles/tokens';
import IllustSent from '@assets/illustrations/friend-request-sent.svg';

export function FriendRequestSentModal({
  visible,
  name,
  onClose,
}: {
  visible: boolean;
  /** 요청 보낸 상대 표시 이름 */
  name: string;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.card}>
          <View style={styles.illustWrap}>
            <IllustSent width="100%" height="100%" />
          </View>

          <View style={styles.textGroup}>
            <Text style={styles.title}>친구 추가 요청 완료</Text>
            <Text style={styles.desc}>
              {name}님의 초대장 확인을 기다리세요.
            </Text>
          </View>

          <Pressable
            onPress={onClose}
            style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.85 }]}
            accessibilityRole="button"
            accessibilityLabel="알겠습니다"
          >
            <Text style={styles.primaryLabel}>알겠습니다</Text>
            <Users size={20} color={tokens.color.black} strokeWidth={2.4} />
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
  // Figma 169:5727 — 흰 카드 r32 p16 gap24 w343
  card: {
    width: '100%',
    maxWidth: 343,
    backgroundColor: tokens.color.white,
    borderRadius: 32,
    padding: 16,
    gap: 24,
    alignItems: 'center',
  },
  // 일러스트 풀폭(311x227 비율 — friend-request-sent.svg viewBox)
  illustWrap: { width: '100%', aspectRatio: 311 / 227 },
  // gap12 center
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
  // pd-yellow 확인 버튼 — r14 minH48 px20 py12 gap10 (done 버튼 패밀리)
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
  // Bold 16/22 -0.112 black
  primaryLabel: {
    fontFamily: tokens.font.sansBold,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    color: tokens.color.black,
  },
});
