// Figma 230:4481 — 수영 일정 초대 취소 확인 모달.
// dim backdrop + 흰 카드(r32 p16 gap24 w343) + 일러스트 + 제목/설명
// + 취소(destructive #FF2D55) 버튼 + "나중에 결정하겠습니다" 텍스트 버튼.
//
// body 문구는 name/count 변수 없이 "보낸 수영 일정 초대를 취소하시겠습니까?" 공용 —
// 1명/여러명 entry 모두 같은 모달 호출(NotificationsTab `invite_sent`의 1명/N명 카드 둘 다).
// 일러스트: 228:3787과 동일(누워있는 인물). assets/illustrations/reject-schedule-invite.svg 재사용.

import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { AppModal } from '@/components/ui/AppModal';
import { XCircle, Hourglass } from 'lucide-react-native';
import { tokens } from '@/styles/tokens';
import IllustReject from '@assets/illustrations/reject-schedule-invite.svg';

export function CancelScheduleInviteModal({
  visible,
  onCancel,
  onLater,
}: {
  visible: boolean;
  onCancel: () => void;
  onLater: () => void;
}) {
  return (
    <AppModal visible={visible} transparent animationType="fade" onRequestClose={onLater}>
      <View style={styles.root}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onLater} />
        <View style={styles.card}>
          <View style={styles.illustWrap}>
            <IllustReject width="100%" height="100%" />
          </View>

          <View style={styles.textGroup}>
            <Text style={styles.title}>수영 일정 초대 취소</Text>
            <Text style={styles.desc}>보낸 수영 일정 초대를 취소하시겠습니까?</Text>
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [
                styles.cancelBtn,
                pressed && { opacity: 0.85 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="수영 일정 초대 취소"
            >
              <Text style={styles.cancelLabel}>네, 취소합니다</Text>
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
  card: {
    width: '100%',
    maxWidth: 343,
    backgroundColor: tokens.color.white,
    borderRadius: 32,
    padding: 16,
    gap: 24,
    alignItems: 'center',
  },
  // Figma 228:3838 (재사용) — 311x216 aspect
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
  cancelBtn: {
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
  cancelLabel: {
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
