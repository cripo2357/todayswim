// Figma 163:10420 — 친구 추가 거절 확인 모달.
// dim backdrop + 흰 카드(r32 p16 gap24 w343) + 일러스트 + 제목/설명
// + 거절(destructive) 버튼 + "나중에 결정하겠습니다" 텍스트 버튼.
// 일러스트(168:7181, 311x199) = 친구 추가 거절 전용 에셋.

import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { XCircle, Hourglass } from 'lucide-react-native';
import { tokens } from '@/styles/tokens';
import IllustReject from '@assets/illustrations/friend-reject.svg';

export function RejectFriendModal({
  visible,
  name,
  onReject,
  onLater,
}: {
  visible: boolean;
  name: string;
  onReject: () => void;
  onLater: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onLater}>
      <View style={styles.root}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onLater} />
        <View style={styles.card}>
          <View style={styles.illustWrap}>
            <IllustReject width="100%" height="100%" />
          </View>

          <View style={styles.textGroup}>
            <Text style={styles.title}>친구 추가 거절</Text>
            <Text style={styles.desc}>
              {name}님의 친구 요청을 거절하겠습니까?
            </Text>
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={onReject}
              style={({ pressed }) => [
                styles.rejectBtn,
                pressed && { opacity: 0.85 },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`${name} 친구 추가 거절`}
            >
              <Text style={styles.rejectLabel}>네, 거절합니다</Text>
              <XCircle size={20} color={tokens.color.white} strokeWidth={2} />
            </Pressable>

            <Pressable
              onPress={onLater}
              style={({ pressed }) => [
                styles.laterBtn,
                pressed && { opacity: 0.6 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="나중에 결정하겠습니다"
            >
              <Hourglass size={20} color={tokens.color.pdBlue} strokeWidth={2} />
              <Text style={styles.laterLabel}>나중에 결정하겠습니다.</Text>
            </Pressable>
          </View>
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
  // Figma 163:10424 — 흰 카드 r32 p16 gap24 w343
  card: {
    width: '100%',
    maxWidth: 343,
    backgroundColor: tokens.color.white,
    borderRadius: 32,
    padding: 16,
    gap: 24,
    alignItems: 'center',
  },
  // Figma 168:7181 — 일러스트 풀폭 (원본 311x199 비율 유지)
  illustWrap: {
    width: '100%',
    aspectRatio: 311 / 199,
  },
  // Figma 163:10576 — gap12 center
  textGroup: { gap: 12, alignItems: 'center', alignSelf: 'stretch' },
  // Figma 163:10577 — Bold 24/32 -0.288 #1F2937
  title: {
    fontFamily: tokens.font.sansBold,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.288,
    color: '#1F2937',
    textAlign: 'center',
  },
  // Figma 163:10578 — Regular 16 lineHeight 1.6 #4B5563
  desc: {
    fontFamily: tokens.font.sans,
    fontSize: 16,
    lineHeight: 26,
    color: '#4B5563',
    textAlign: 'center',
  },
  // Figma 163:10579 — gap24
  actions: { gap: 24, alignSelf: 'stretch', alignItems: 'center' },
  // Figma 163:10580 — pd-pink #FF2D55, r14, minH48, px20 py12, gap10
  rejectBtn: {
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
  // Figma 163:10582 — SemiBold 16/22 -0.112 white
  rejectLabel: {
    fontFamily: tokens.font.sansSemibold,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    color: tokens.color.white,
  },
  // Figma 163:10584 — gap8 center
  laterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  // Figma 163:10586 — SemiBold 14/20 -0.084 pd-blue #6890CB
  laterLabel: {
    fontFamily: tokens.font.sansSemibold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    color: tokens.color.pdBlue,
  },
});
