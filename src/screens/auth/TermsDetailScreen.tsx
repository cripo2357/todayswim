// Figma 101:3833 "약관 상세보기" — 단일 템플릿. route param termsKey 로
// TERMS_META 에서 정보만 교체해 5개 약관(서비스/개인정보 수집·이용/
// 개인정보 처리방침/위치기반/마케팅)을 모두 커버.
//
// 동의/거부: 온보딩 게이트(lib/terms)에 묶인 service·privacyConsent 만
// 상태 기록, 나머지(처리방침/위치/마케팅)는 조회 후 뒤로가기.
// (TermsAgreement·LoginScreen 의 isFullyAgreed 게이트 = service+privacy
//  유지 — 본 리팩터로 게이트 동작 불변.)

import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, X } from 'lucide-react-native';
import BrandWordmark from '@assets/illustrations/wordmark-poolsday-light.svg';
import { AppHeader } from '@/components/layout/AppHeader';
import { setConsent, type ConsentKey } from '@/lib/terms';
import { TERMS_META, type TermsKey } from '@/lib/termsContent';
import type { RootStackParamList } from '@/navigation/types';
import { tokens } from '@/styles/tokens';

// 동의 대상 약관 → ConsentKey. 개인정보 처리방침(privacyPolicy)은
// '고지' 문서라 동의 대상 아님(상태 미기록, 닫기만).
const CONSENT_OF: Partial<Record<TermsKey, ConsentKey>> = {
  service: 'service',
  privacyConsent: 'privacyConsent',
  location: 'location',
  marketing: 'marketing',
};

export function TermsDetailScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<RouteProp<RootStackParamList, 'TermsDetail'>>();
  const meta = TERMS_META[params.termsKey];

  const consentKey = CONSENT_OF[params.termsKey];
  const onAgree = async () => {
    if (consentKey) await setConsent(consentKey, true);
    navigation.goBack();
  };
  const onDecline = async () => {
    if (consentKey) await setConsent(consentKey, false);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <AppHeader background={tokens.color.bgPaper} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.wordmarkWrap}>
          <BrandWordmark width={256} height={152} />
        </View>

        {/* 헤더 — 버전 배지 + (제목/발효일) */}
        <View style={styles.headerBlock}>
          <View style={styles.versionChip}>
            <Text style={styles.versionText}>{meta.version}</Text>
          </View>
          <View style={styles.titleGroup}>
            <Text style={styles.title}>{meta.title}</Text>
            <Text style={styles.effective}>발효일: {meta.effectiveDate}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {meta.sections.map((section, i) => (
          <React.Fragment key={section.title}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.body}>{section.body}</Text>
            </View>
            {i < meta.sections.length - 1 ? (
              <View style={styles.divider} />
            ) : null}
          </React.Fragment>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          onPress={onAgree}
          style={({ pressed }) => [
            styles.btn,
            styles.btnAgree,
            pressed && { opacity: 0.85 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="동의합니다"
        >
          <Text style={styles.btnAgreeLabel}>동의합니다</Text>
          <Check size={20} color={tokens.color.black} strokeWidth={2.4} />
        </Pressable>
        <Pressable
          onPress={onDecline}
          style={({ pressed }) => [
            styles.btn,
            styles.btnDecline,
            pressed && { opacity: 0.85 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="거부합니다"
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
  // Figma 101:3834 — w 343 (375 - 32 padding)
  scrollContent: { paddingHorizontal: 16, paddingBottom: 16 },
  wordmarkWrap: { alignItems: 'center', paddingTop: 24 },
  // Figma 101:3838 — gap 20 (배지 ↔ 제목 그룹)
  headerBlock: { alignItems: 'center', gap: 20, marginTop: 32 },
  titleGroup: { alignSelf: 'stretch', alignItems: 'center', gap: 16 },
  // Figma 101:3839 — Medium 14/20 #4B5563, border #CBD5E1, r9 px10 py4
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
  divider: {
    height: 1,
    backgroundColor: tokens.color.lineDefault,
    marginVertical: 32,
  },
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
  btnAgreeLabel: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.black,
  },
  // Figma — #FF2D55 (pd-pink, destructive)
  btnDecline: { backgroundColor: '#FF2D55' },
  btnDeclineLabel: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.white,
  },
});
