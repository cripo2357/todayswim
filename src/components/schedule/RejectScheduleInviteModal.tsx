// Figma 228:3787 — 수영 일정 초대 거절 확인 모달.
// dim backdrop + 흰 카드(r32 p16 gap24 w343) + 일러스트 + 제목/설명
// + 거절(destructive #FF2D55) 버튼 + "나중에 결정하겠습니다" 텍스트 버튼.
// 호출처: NotificationsTab `invite_received` 메시지의 '거절' 버튼.
// 일러스트: assets/illustrations/reject-schedule-invite.svg (Figma 228:3838 export).

import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { XCircle, Hourglass } from 'lucide-react-native';
import { tokens } from '@/styles/tokens';
import IllustReject from '@assets/illustrations/reject-schedule-invite.svg';

export function RejectScheduleInviteModal({
  visible,
  name,
  onReject,
  onLater,
}: {
  visible: boolean;
  /** 일정 초대를 보낸 상대 표시 이름 */
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
            <Text style={styles.title}>수영 일정 초대 거절</Text>
            <Text style={styles.desc}>
              {name}님의 수영 일정 초대를 거절하겠습니까?
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
              accessibilityLabel={`${name} 수영 일정 초대 거절`}
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
  card: {
    width: '100%',
    maxWidth: 343,
    backgroundColor: tokens.color.white,
    borderRadius: 32,
    padding: 16,
    gap: 24,
    alignItems: 'center',
  },
  // Figma 228:3838 — 311x216 (RejectFriendModal과 같은 비율로 풀폭)
  illustWrap: { width: '100%', aspectRatio: 311 / 216 },
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
  actions: { gap: 24, alignSelf: 'stretch', alignItems: 'center' },
  // pd-pink #FF2D55, r14, minH48, px20 py12, gap10
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
  rejectLabel: {
    fontFamily: tokens.font.sansSemibold,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    color: tokens.color.white,
  },
  laterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  laterLabel: {
    fontFamily: tokens.font.sansSemibold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    color: tokens.color.pdBlue,
  },
});
