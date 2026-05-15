// Figma 101:3937 — 개인정보 수집 및 이용 전문 + 동의/거부 버튼

import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, X } from 'lucide-react-native';
import BrandWordmark from '@assets/illustrations/wordmark-poolsday-light.svg';
import { AppHeader } from '@/components/layout/AppHeader';
import { agreePrivacy, declinePrivacy } from '@/lib/terms';
import type { RootStackParamList } from '@/navigation/types';
import { tokens } from '@/styles/tokens';

const EFFECTIVE_DATE = '2026년 11월 23일';
const SECTIONS: { title: string; body: string }[] = [
  {
    title: '1. 수집하는 개인정보 항목',
    body:
      `회원가입 및 서비스 이용 과정에서 다음과 같은 개인정보를 수집합니다:\n` +
      `필수 항목: 이메일 주소, 닉네임, 소셜 로그인 제공자(Google/Apple/Kakao) 식별자\n` +
      `자동 수집 항목: 단말 정보(OS·기기 모델), 앱 버전, 위치 정보(권한 동의 시), 서비스 이용 기록`,
  },
  {
    title: '2. 개인정보 수집 및 이용 목적',
    body:
      `수집한 개인정보는 다음 목적으로만 이용합니다:\n` +
      `회원 식별 및 로그인 유지\n` +
      `근거리 수영장 추천 및 지도 표시\n` +
      `자유수영 시간표·시설 정보 제공\n` +
      `서비스 개선을 위한 통계 분석\n` +
      `관련 법령에 따른 의무 이행`,
  },
  {
    title: '3. 개인정보 보유 및 이용 기간',
    body:
      `회원 탈퇴 시까지 보유하며, 탈퇴 즉시 파기합니다.\n` +
      `법령에 의해 보존이 필요한 경우 해당 기간 동안 별도 보관합니다.`,
  },
  {
    title: '4. 정보 주체의 권리',
    body:
      `귀하는 언제든지 본인 정보 열람·수정·삭제·처리정지를 요구할 수 있으며,\n` +
      `앱 내 [더보기 > 계정] 에서 직접 처리하거나 고객센터를 통해 요청할 수 있습니다.`,
  },
  {
    title: '5. 개인정보 보호책임자',
    body: '문의: privacy@poolsday.app',
  },
];

export function TermsPrivacyScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const onAgree = async () => {
    await agreePrivacy();
    navigation.goBack();
  };
  const onDecline = async () => {
    await declinePrivacy();
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <AppHeader background={tokens.color.bgPaper} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.wordmarkWrap}>
          <BrandWordmark width={256} height={152} />
        </View>

        <View style={styles.headerBlock}>
          <View style={styles.versionChip}>
            <Text style={styles.versionText}>v1.0.0</Text>
          </View>
          <View style={styles.titleGroup}>
            <Text style={styles.title}>개인정보 수집 및 이용</Text>
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
  scrollContent: { paddingHorizontal: 16, paddingBottom: 16 },
  wordmarkWrap: { alignItems: 'center', paddingTop: 24 },
  headerBlock: { alignItems: 'center', gap: 20, marginTop: 32 },
  titleGroup: { alignSelf: 'stretch', alignItems: 'center', gap: 16 },
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
  title: {
    fontSize: 30,
    lineHeight: 38,
    letterSpacing: -0.39,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.ink900,
    textAlign: 'center',
  },
  effective: {
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.144,
    fontFamily: tokens.font.sans,
    color: '#4B5563',
    textAlign: 'center',
  },
  divider: { height: 1, backgroundColor: tokens.color.lineDefault, marginVertical: 32 },
  section: { gap: 16 },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: -0.2,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.ink900,
  },
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
  btnDecline: { backgroundColor: '#FF2D55' },
  btnDeclineLabel: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.white,
  },
});
