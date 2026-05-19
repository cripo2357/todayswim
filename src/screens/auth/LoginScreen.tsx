// Figma 101:2369 — 로그인 (Google / 카카오 / Apple 소셜 로그인)
//
// Phase 1: useAuth.signInMock(provider) 호출 — 로컬 가짜 세션.
// Phase 2: native OAuth SDK + supabase.auth.signInWithIdToken로 교체.

import React from 'react';
import { View, Text, StyleSheet, Pressable, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth, type SocialProvider } from '@/store/auth';
import { useProfile } from '@/store/profile';
import { getTermsState, isFullyAgreed, clearTerms } from '@/lib/terms';
import type { RootStackParamList } from '@/navigation/types';
import { tokens } from '@/styles/tokens';
import LoginIllust from '@assets/illustrations/login.svg';
import IconGoogle from '@assets/icons/social-google.svg';
import IconKakao from '@assets/icons/social-kakao.svg';
import IconApple from '@assets/icons/social-apple.svg';

export function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const signInMock = useAuth((s) => s.signInMock);
  const signInWithGoogle = useAuth((s) => s.signInWithGoogle);
  const signInWithKakao = useAuth((s) => s.signInWithKakao);

  // 로그인 성공 후 공통 게이트 — 약관 → 프로필 → 지도.
  const goAfterLogin = async () => {
    const terms = await getTermsState();
    if (!isFullyAgreed(terms)) {
      navigation.replace('TermsAgreement');
      return;
    }
    const profile = useProfile.getState().profile;
    navigation.replace(profile ? 'MapMain' : 'ProfileSetup');
  };

  const onSocial = async (provider: SocialProvider) => {
    // [TEST MODE] Apple 로그인을 가입 프로세스 강제 진입점으로 사용 — 매번 약관·프로필 리셋 후 처음부터.
    // 원복: Apple 분기 블록 + iOS 플랫폼 체크 복구.
    if (provider === 'apple') {
      try {
        await signInMock(provider);
        await clearTerms();
        await useProfile.getState().clear();
        navigation.replace('TermsAgreement');
      } catch (e) {
        Alert.alert('로그인 실패', String(e));
      }
      return;
    }

    try {
      if (provider === 'google') {
        await signInWithGoogle();
        if (!useAuth.getState().user) return; // 사용자가 취소
      } else {
        await signInWithKakao();
        if (!useAuth.getState().user) return; // 사용자가 취소
      }
      await goAfterLogin();
    } catch (e) {
      Alert.alert('로그인 실패', String(e));
    }
  };

  // dim(카드 밖 어두운 영역) 탭 → 닫기. 단, 게이트 진입(뒤 화면 없음)이면
  // canGoBack=false → 무동작(필수 로그인 게이트에서 실수로 닫히지 않게).
  const onDismiss = () => {
    if (navigation.canGoBack()) navigation.goBack();
  };

  return (
    <View style={styles.root}>
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={onDismiss}
        accessibilityRole="button"
        accessibilityLabel="닫기"
      />
      <View style={styles.card}>
        <View style={styles.illustWrap}>
          <LoginIllust width={280} height={224} />
        </View>

        <Text style={styles.title}>로그인</Text>

        <View style={styles.buttons}>
          <Pressable
            onPress={() => onSocial('google')}
            style={({ pressed }) => [styles.btn, styles.btnGoogle, pressed && { opacity: 0.85 }]}
            accessibilityRole="button"
            accessibilityLabel="Google 로그인"
          >
            <IconGoogle width={20} height={20} />
            <Text style={[styles.btnLabel, styles.btnLabelGoogle]}>Google 로그인</Text>
          </Pressable>

          <Pressable
            onPress={() => onSocial('kakao')}
            style={({ pressed }) => [styles.btn, styles.btnKakao, pressed && { opacity: 0.85 }]}
            accessibilityRole="button"
            accessibilityLabel="카카오 로그인"
          >
            <IconKakao width={20} height={20} />
            <Text style={[styles.btnLabel, styles.btnLabelKakao]}>카카오 로그인</Text>
          </Pressable>

          <Pressable
            onPress={() => onSocial('apple')}
            style={({ pressed }) => [styles.btn, styles.btnApple, pressed && { opacity: 0.85 }]}
            accessibilityRole="button"
            accessibilityLabel="Apple 로그인"
          >
            <IconApple width={20} height={20} />
            <Text style={[styles.btnLabel, styles.btnLabelApple]}>Apple 로그인</Text>
          </Pressable>
        </View>

        <Text style={styles.copyright}>© 2026 CRIPO. All right reserved</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#4B5563',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  // Figma 101:2369 — 카드 padding 16, gap 32, radius 32
  card: {
    backgroundColor: tokens.color.bgPaper,
    borderRadius: 32,
    padding: 16,
    alignItems: 'center',
    gap: 32,
  },
  illustWrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.288,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.ink900,
  },
  buttons: { width: '100%', gap: 12 },
  // Figma — minH 48, px 16 py 10, radius는 버튼별 다름 (아래 개별 지정)
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  btnGoogle: { backgroundColor: '#000000', borderRadius: 16 },
  btnKakao: { backgroundColor: '#FEE500', borderRadius: 12 },
  btnApple: { backgroundColor: '#F1F5F9', borderRadius: 16 },
  // Figma — Regular(400) 16/22 -0.112
  btnLabel: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sans,
  },
  btnLabelGoogle: { color: tokens.color.white },
  btnLabelKakao: { color: 'rgba(0,0,0,0.85)' },
  btnLabelApple: { color: tokens.color.ink900 },
  // Figma — 14/20 -0.084, #4B5563
  copyright: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sans,
    color: '#4B5563',
    textAlign: 'center',
  },
});
