// Figma 228:3911 — 친구 추가 요청 취소 확인 모달.
// dim backdrop + 흰 카드(r32 p16 gap24 w343) + 일러스트 + 제목/설명
// + 취소(pd-byellow + black 텍스트) 버튼 + "나중에 결정하겠습니다" 텍스트 버튼.
// (수영 일정 초대 취소(230:4481)는 빨강 CTA — 일정엔 영향 더 큰 destructive로 구분.)
// 호출처: OtherUserProfileScreen 의 outgoing 상태 CTA 탭.
// 일러스트: FriendRequestSentModal(169:5727)과 동일 자산(friend-request-sent.svg) 공유 — 사용자 확인.

import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { AppModal } from '@/components/ui/AppModal';
import { XCircle, Hourglass } from 'lucide-react-native';
import { tokens } from '@/styles/tokens';
import IllustCancel from '@assets/illustrations/friend-request-sent.svg';

export function CancelFriendRequestModal({
  visible,
  name,
  onCancel,
  onLater,
}: {
  visible: boolean;
  /** 요청 보낸 상대 표시 이름 */
  name: string;
  onCancel: () => void;
  onLater: () => void;
}) {
  return (
    <AppModal visible={visible} transparent animationType="fade" onRequestClose={onLater}>
      <View style={styles.root}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onLater} />
        <View style={styles.card}>
          <View style={styles.illustWrap}>
            <IllustCancel width="100%" height="100%" />
          </View>

          <View style={styles.textGroup}>
            <Text style={styles.title}>친구 추가 요청 취소</Text>
            <Text style={styles.desc}>
              {`${name}님에게 보낸\n친구 추가 요청을 취소하겠습니까?`}
            </Text>
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [
                styles.cancelBtn,
                pressed && { opacity: 0.85 },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`${name} 친구 추가 요청 취소`}
            >
              <Text style={styles.cancelLabel}>네, 취소합니다</Text>
              <XCircle size={20} color={tokens.color.black} strokeWidth={2} />
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
  // friend-request-sent.svg viewBox 343x226 (FriendRequestSentModal과 동일 자산)
  illustWrap: { width: '100%', aspectRatio: 343 / 226 },
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
  // pd-byellow #EAFF00 (친구 요청 취소는 일정 취소보다 영향 작아 노랑)
  cancelBtn: {
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
  cancelLabel: {
    fontFamily: tokens.font.sansBold,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    color: tokens.color.black,
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
