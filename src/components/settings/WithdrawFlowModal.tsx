// 회원 탈퇴 3단계 모달 (Figma 201:8341 / 201:10281 / 201:10428).
//
//  confirm1 "풀스데이를 떠나시나요?"  → [서비스 계속 이용](닫기) / 네,탈퇴하겠습니다
//  confirm2 "정말 탈퇴하겠습니까?"     → [서비스 탈퇴](red, →done) / 잠깐만,다시
//  done     "서비스 탈퇴 완료"          → [알겠습니다] → onDeleted
//
// ConfirmLogoutModal과 동일 토큰(dim 0.5 + 흰 카드 r32 p16 w343, done 버튼
// 패밀리). 실제 계정 teardown(useAuth.deleteAccount)은 부모가 마지막
// "알겠습니다"에서 실행 — 흐름 중 화면 언마운트/리렌더 글리치 회피
// (목업 P1 기준: '완료' 카드는 teardown 직전 단계). project_phases 참고.

import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { AppModal } from '@/components/ui/AppModal';
import { Check } from 'lucide-react-native';
import { tokens } from '@/styles/tokens';
import { logEvent } from '@/lib/analytics';
// 프로젝트 기존/업로드 아이콘 사용(lucide 대체 X).
//  life-buoy.svg = baked black 20px (WelcomeScreen·MapScreen 등 상시 사용,
//    노랑 버튼 검정 라벨에 적합 — Figma 201:8373).
//  hand-pan.svg  = currentColor(모노크롬) → color prop으로 문맥별 색.
//  light-bulb.svg = baked pd-blue (모달2 텍스트버튼 색 일치).
import IconLifeBuoy from '@assets/icons/life-buoy.svg';
import IconHandPan from '@assets/icons/hand-pan.svg';
import IconLightBulb from '@assets/icons/light-bulb.svg';
import IllustWithdraw from '@assets/illustrations/account-withdraw.svg';
import IllustPlug from '@assets/illustrations/friend-reject.svg';

type Phase = 'confirm1' | 'confirm2' | 'done';

export function WithdrawFlowModal({
  visible,
  nickname,
  onClose,
  onDeleted,
}: {
  visible: boolean;
  /** 탈퇴 안내문에 들어갈 표시용 닉네임 */
  nickname: string;
  /** 취소(서비스 계속 이용 / 잠깐만 / 백드롭) — 부모가 visible=false */
  onClose: () => void;
  /** 최종 "알겠습니다" — 부모가 deleteAccount + 스택 reset */
  onDeleted: () => void;
}) {
  const [phase, setPhase] = React.useState<Phase>('confirm1');
  // 열릴 때마다 1단계부터.
  React.useEffect(() => {
    if (visible) {
      setPhase('confirm1');
      void logEvent('withdraw_started');
    }
  }, [visible]);
  // 'done' 단계 도달 = 탈퇴 진행 완료 (부모가 onDeleted 호출 직전 카드).
  React.useEffect(() => {
    if (phase === 'done') void logEvent('withdraw_complete');
  }, [phase]);

  return (
    <AppModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        {phase === 'done' ? (
          <View style={[styles.card, styles.cardGap32]}>
            <View style={[styles.illustWrap, styles.illustPlug]}>
              <IllustPlug width="100%" height="100%" />
            </View>
            <View style={styles.textGroup}>
              <Text style={styles.title}>서비스 탈퇴 완료</Text>
              <Text style={styles.descLg}>
                {'정말 고마웠어요.\n앞으로도 즐거운 수영하세요.'}
              </Text>
            </View>
            <Pressable
              onPress={onDeleted}
              style={({ pressed }) => [
                styles.primaryBtn,
                styles.btnYellow,
                pressed && { opacity: 0.85 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="알겠습니다"
            >
              <Text style={styles.btnLabelDark}>알겠습니다</Text>
              <Check size={20} color={tokens.color.black} strokeWidth={2.4} />
            </Pressable>
          </View>
        ) : (
          <View style={[styles.card, styles.cardGap24]}>
            <View style={[styles.illustWrap, styles.illustPerson]}>
              <IllustWithdraw width="100%" height="100%" />
            </View>

            {phase === 'confirm1' ? (
              <View style={styles.textGroup}>
                <Text style={styles.title}>풀스데이를 떠나시나요?</Text>
                <Text style={styles.descMd}>
                  {`탈퇴하면 ${nickname}님의 모든 정보들은\n영구 삭제되며 복구할 수 없습니다.`}
                </Text>
              </View>
            ) : (
              <Text style={styles.title}>정말 탈퇴하겠습니까?</Text>
            )}

            <View style={styles.actions}>
              {phase === 'confirm1' ? (
                <>
                  <Pressable
                    onPress={onClose}
                    style={({ pressed }) => [
                      styles.primaryBtn,
                      styles.btnYellow,
                      pressed && { opacity: 0.85 },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel="서비스 계속 이용"
                  >
                    <Text style={styles.btnLabelDark}>서비스 계속 이용</Text>
                    <IconLifeBuoy width={20} height={20} />
                  </Pressable>
                  <Pressable
                    onPress={() => setPhase('confirm2')}
                    style={({ pressed }) => [
                      styles.textLink,
                      pressed && { opacity: 0.6 },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel="네, 탈퇴하겠습니다"
                  >
                    <IconHandPan
                      width={20}
                      height={20}
                      color={tokens.color.pdBlue}
                    />
                    <Text style={styles.textLinkLabel}>네, 탈퇴하겠습니다</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Pressable
                    onPress={() => setPhase('done')}
                    style={({ pressed }) => [
                      styles.primaryBtn,
                      styles.btnRed,
                      pressed && { opacity: 0.85 },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel="서비스 탈퇴"
                  >
                    <Text style={styles.btnLabelLight}>서비스 탈퇴</Text>
                    <IconHandPan
                      width={20}
                      height={20}
                      color={tokens.color.white}
                    />
                  </Pressable>
                  <Pressable
                    onPress={onClose}
                    style={({ pressed }) => [
                      styles.textLink,
                      pressed && { opacity: 0.6 },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel="잠깐만, 다시 생각해볼게요"
                  >
                    <IconLightBulb width={20} height={20} />
                    <Text style={styles.textLinkLabel}>
                      잠깐만, 다시 생각해볼게요
                    </Text>
                  </Pressable>
                </>
              )}
            </View>
          </View>
        )}
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
  // Figma 201:8344 등 — 흰 카드 r32 p16 w343, 가운데 정렬
  card: {
    width: '100%',
    maxWidth: 343,
    backgroundColor: tokens.color.white,
    borderRadius: 32,
    padding: 16,
    alignItems: 'center',
    ...tokens.shadow.lg,
  },
  cardGap24: { gap: 24 },
  cardGap32: { gap: 32 }, // 201:10429 — 완료 카드만 gap-32
  illustWrap: { width: '100%' },
  // account-withdraw.svg viewBox 314x175
  illustPerson: { aspectRatio: 314 / 175 },
  // friend-reject.svg(끊긴 플러그) viewBox 527x242 재사용
  illustPlug: { aspectRatio: 527 / 242 },
  textGroup: { gap: 12, alignItems: 'center', alignSelf: 'stretch' },
  // Figma — Bold 24/32 -0.288 #1F2937, 가운데
  title: {
    fontFamily: tokens.font.sansBold,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.288,
    color: '#1F2937',
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  // Figma 201:8368 — Regular 16, lineHeight 1.6(≈26) #4B5563
  descMd: {
    fontFamily: tokens.font.sans,
    fontSize: 16,
    lineHeight: 26,
    color: '#4B5563',
    textAlign: 'center',
  },
  // Figma 201:10453 — Regular 18, lineHeight 1.6(≈29) #4B5563
  descLg: {
    fontFamily: tokens.font.sans,
    fontSize: 18,
    lineHeight: 29,
    color: '#4B5563',
    textAlign: 'center',
  },
  actions: { gap: 24, alignItems: 'center', alignSelf: 'stretch' },
  // primary 버튼 — r14 minH48 px20 py12 gap10, 가로 stretch (done 버튼 패밀리)
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 48,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    alignSelf: 'stretch',
  },
  btnYellow: { backgroundColor: tokens.color.pdByellow },
  // Figma 201:10493 — var(--pd-pink,#FF2D55). 토큰 없음 → 기존 #FF2D55 리터럴
  btnRed: { backgroundColor: '#FF2D55' },
  btnLabelDark: {
    fontFamily: tokens.font.sansBold,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    color: tokens.color.black,
  },
  btnLabelLight: {
    fontFamily: tokens.font.sansBold,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    color: tokens.color.white,
  },
  // 텍스트 링크 버튼 — 아이콘 + 라벨, gap8, 가운데 (보더/bg 없음)
  textLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  // Figma — SemiBold 14/20 -0.084 pd-blue
  textLinkLabel: {
    fontFamily: tokens.font.sansSemibold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    color: tokens.color.pdBlue,
  },
});
