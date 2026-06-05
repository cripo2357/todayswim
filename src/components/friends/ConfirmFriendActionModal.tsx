// 친구 차단(172:11694) / 친구 삭제(172:11852) 공용 확인 모달.
// dim backdrop + 흰 카드(r32 p16 gap24 w343) + friend-reject 일러스트
// + 제목(Bold24) + 설명(Regular16/26 #4B5563, 여러 줄)
// + destructive 버튼(pd-pink, Ban 아이콘) + 보조 텍스트 버튼(pd-blue).
// RejectFriendModal과 동일 디자인 토큰.

import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { AppModal } from '@/components/ui/AppModal';
import { Ban, Hourglass } from 'lucide-react-native';
import { tokens } from '@/styles/tokens';
import IllustReject from '@assets/illustrations/friend-reject.svg';

export function ConfirmFriendActionModal({
  visible,
  title,
  descLines,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  secondaryIcon = 'hourglass',
  onSecondary,
  onClose,
}: {
  visible: boolean;
  title: string;
  descLines: string[];
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel: string;
  /** 'hourglass'=나중에 결정 / 'ban'=차단하고 싶습니다 */
  secondaryIcon?: 'hourglass' | 'ban';
  onSecondary: () => void;
  onClose: () => void;
}) {
  const SecIcon = secondaryIcon === 'ban' ? Ban : Hourglass;
  return (
    <AppModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.card}>
          <View style={styles.illustWrap}>
            <IllustReject width="100%" height="100%" />
          </View>

          <View style={styles.textGroup}>
            <Text style={styles.title}>{title}</Text>
            <View>
              {descLines.map((line) => (
                <Text key={line} style={styles.desc}>
                  {line}
                </Text>
              ))}
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={onPrimary}
              style={({ pressed }) => [
                styles.primaryBtn,
                pressed && { opacity: 0.85 },
              ]}
              accessibilityRole="button"
              accessibilityLabel={primaryLabel}
            >
              <Text style={styles.primaryLabel}>{primaryLabel}</Text>
              <Ban size={20} color={tokens.color.white} strokeWidth={2} />
            </Pressable>

            <Pressable
              onPress={onSecondary}
              style={({ pressed }) => [
                styles.secondaryBtn,
                pressed && { opacity: 0.6 },
              ]}
              accessibilityRole="button"
              accessibilityLabel={secondaryLabel}
            >
              <SecIcon size={20} color={tokens.color.pdBlue} strokeWidth={2} />
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
  // Figma 172:11697 — 흰 카드 r32 p16 gap24 w343
  card: {
    width: '100%',
    maxWidth: 343,
    backgroundColor: tokens.color.white,
    borderRadius: 32,
    padding: 16,
    gap: 24,
    alignItems: 'center',
  },
  // Figma 172:11698 — 일러스트 풀폭(311x199 비율)
  illustWrap: { width: '100%', aspectRatio: 527 / 242 }, // friend-reject(플러그) viewBox
  // Figma 172:11825 — gap12 center
  textGroup: { gap: 12, alignItems: 'center', alignSelf: 'stretch' },
  // Figma 172:11826 — Bold 24/32 -0.288 #1F2937
  title: {
    fontFamily: tokens.font.sansBold,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.288,
    color: '#1F2937',
    textAlign: 'center',
  },
  // Figma 172:11827 — Regular 16 lineHeight 1.6 #4B5563
  desc: {
    fontFamily: tokens.font.sans,
    fontSize: 16,
    lineHeight: 26,
    color: '#4B5563',
    textAlign: 'center',
  },
  // Figma 172:11828 — gap24
  actions: { gap: 24, alignSelf: 'stretch', alignItems: 'center' },
  // Figma 172:11829 — pd-pink #FF2D55, r14, minH48, px20 py12, gap10
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
  // Figma 172:11831 — SemiBold 16/22 -0.112 white
  primaryLabel: {
    fontFamily: tokens.font.sansSemibold,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    color: tokens.color.white,
  },
  // Figma 172:11833 — gap8 center
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  // Figma 172:11835 — SemiBold 14/20 -0.084 pd-blue #6890CB
  secondaryLabel: {
    fontFamily: tokens.font.sansSemibold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    color: tokens.color.pdBlue,
  },
});
