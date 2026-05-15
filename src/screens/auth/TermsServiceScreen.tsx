// Figma 101:3833 — 서비스 이용약관 전문 + 동의/거부 버튼
// 동의 클릭 → AsyncStorage 저장 후 이전 화면(TermsAgreement)으로 복귀.

import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, X } from 'lucide-react-native';
import BrandWordmark from '@assets/illustrations/wordmark-poolsday-light.svg';
import { AppHeader } from '@/components/layout/AppHeader';
import { agreeService, declineService } from '@/lib/terms';
import type { RootStackParamList } from '@/navigation/types';
import { tokens } from '@/styles/tokens';

const EFFECTIVE_DATE = '2026년 11월 23일';
const SECTIONS: { title: string; body: string }[] = [
  {
    title: '1. 수집하는 정보',
    body:
      `저희는 서비스를 제공하고 개선하기 위해 다음과 같은 정보를 수집합니다:\n` +
      `개인정보: Pool's Day에 가입할 때 귀하의 이름, 이메일 주소 및 기타 연락처 정보를 수집합니다.\n` +
      `이용 데이터: 앱 사용 방식에 대한 정보를 수집합니다. 여기에는 앱 상호작용, 장치 정보, IP 주소 및 사용 로그가 포함됩니다.\n` +
      `쿠키: 저희는 귀하의 앱 사용 패턴을 추적하고 경험을 개선하기 위해 쿠키를 사용합니다.`,
  },
  {
    title: '2. 귀하의 정보를 사용하는 방법',
    body:
      `저희는 귀하의 개인정보를 다음과 같은 목적으로 사용합니다:\n` +
      `개인화된 수영장 추천 정보를 제공합니다.\n` +
      `자유수영 시간표를 동기화하고 알림을 보냅니다.\n` +
      `앱 기능을 개선하고 문제를 해결하며 향상시킵니다.\n` +
      `귀하의 활동에 대한 관련 알림, 업데이트 및 보고서를 보냅니다.\n` +
      `법적 및 규제 요구 사항을 준수합니다.`,
  },
  {
    title: '3. 약관 변경',
    body: '본 약관은 변경될 수 있으며 변경 시 앱 내 공지를 통해 안내드립니다.',
  },
];

export function TermsServiceScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const onAgree = async () => {
    await agreeService();
    navigation.goBack();
  };

  const onDecline = async () => {
    await declineService();
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <AppHeader background={tokens.color.bgPaper} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.wordmarkWrap}>
          <BrandWordmark width={256} height={152} />
        </View>

        {/* 헤더 frame — 배지 + (제목/발효일) gap 16 */}
        <View style={styles.headerBlock}>
          <View style={styles.versionChip}>
            <Text style={styles.versionText}>v1.0.0</Text>
          </View>
          <View style={styles.titleGroup}>
            <Text style={styles.title}>서비스 이용약관</Text>
            <Text style={styles.effective}>발효일: {EFFECTIVE_DATE}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {SECTIONS.map((section, i) => (
          <React.Fragment key={section.title}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.body}>{section.body}</Text>
            </View>
            {i < SECTIONS.length - 1 ? <View style={styles.divider} /> : null}
          </React.Fragment>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          onPress={onAgree}
          style={({ pressed }) => [styles.btn, styles.btnAgree, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.btnAgreeLabel}>동의합니다</Text>
          <Check size={20} color={tokens.color.black} strokeWidth={2.4} />
        </Pressable>
        <Pressable
          onPress={onDecline}
          style={({ pressed }) => [styles.btn, styles.btnDecline, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.btnDeclineLabel}>거부합니다</Text>
          <X size={20} color={tokens.color.white} strokeWidth={2.4} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.color.bgPaper },
  // Figma 101:3834 — w 343 (375 - 32 padding), gap 32 between main blocks.
  scrollContent: { paddingHorizontal: 16, paddingBottom: 16 },
  wordmarkWrap: { alignItems: 'center', paddingTop: 24 },
  // Figma 101:3838 — gap 20 (배지 ↔ 제목 그룹)
  headerBlock: { alignItems: 'center', gap: 20, marginTop: 32 },
  titleGroup: { alignSelf: 'stretch', alignItems: 'center', gap: 16 },
  // Figma 101:3839 — Medium 14/20 #4B5563, border #CBD5E1, radius 9, px10 py4
  versionChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  versionText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: tokens.font.sansMedium,
    color: '#4B5563',
  },
  // Figma 101:3841 — 30/38 -0.39 Bold center
  title: {
    fontSize: 30,
    lineHeight: 38,
    letterSpacing: -0.39,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.ink900,
    textAlign: 'center',
  },
  // Figma 101:3842 — 18/24 -0.144 Regular #4B5563
  effective: {
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.144,
    fontFamily: tokens.font.sans,
    color: '#4B5563',
    textAlign: 'center',
  },
  divider: { height: 1, backgroundColor: tokens.color.lineDefault, marginVertical: 32 },
  // Figma 101:3847 — section frame gap 16
  section: { gap: 16 },
  // Figma 101:3848 — 20/28 -0.2 Bold #1F2937
  sectionTitle: {
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: -0.2,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.ink900,
  },
  // Figma 101:3849 — 14/1.6 Regular #4B5563
  body: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: tokens.font.sans,
    color: '#4B5563',
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 12,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 48,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  btnAgree: { backgroundColor: tokens.color.pdByellow },
  // Figma — SemiBold (700이 아닌 600)
  btnAgreeLabel: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.black,
  },
  // Figma — #FF2D55 (pd-pink, Apple destructive red 톤)
  btnDecline: { backgroundColor: '#FF2D55' },
  btnDeclineLabel: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.white,
  },
});
