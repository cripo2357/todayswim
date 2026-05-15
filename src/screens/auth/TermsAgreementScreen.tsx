// Figma 101:3671 — 서비스 약관 동의 (게이트 화면)
// 두 약관(서비스 이용 + 개인정보 수집·이용) 모두 체크 후 시작.
// 각 라벨 탭하면 전문 화면(TermsService / TermsPrivacy)으로.

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check } from 'lucide-react-native';
import {
  getTermsState,
  isFullyAgreed,
  agreeService,
  declineService,
  agreePrivacy,
  declinePrivacy,
} from '@/lib/terms';
import type { RootStackParamList } from '@/navigation/types';
import { tokens } from '@/styles/tokens';
import { AppHeader } from '@/components/layout/AppHeader';
import TermsKeyIllust from '@assets/illustrations/terms-key.svg';
import IconGavel from '@assets/icons/gavel.svg';
import IconGavelGray from '@assets/icons/gavel-gray.svg';

export function TermsAgreementScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [serviceAgreed, setServiceAgreed] = React.useState(false);
  const [privacyAgreed, setPrivacyAgreed] = React.useState(false);

  // 전문 화면 다녀온 후 동의 상태 다시 가져오기.
  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        const s = await getTermsState();
        setServiceAgreed(!!s.serviceAgreedAt);
        setPrivacyAgreed(!!s.privacyAgreedAt);
      })();
    }, []),
  );

  const allAgreed = serviceAgreed && privacyAgreed;

  const onStart = async () => {
    if (!allAgreed) return;
    // 약관 동의 → 프로필 등록 단계.
    navigation.replace('ProfileSetup');
  };

  // 체크박스 직접 토글 — 상세 화면 안 보고도 동의/철회 가능.
  const toggleService = async () => {
    if (serviceAgreed) {
      await declineService();
      setServiceAgreed(false);
    } else {
      await agreeService();
      setServiceAgreed(true);
    }
  };
  const togglePrivacy = async () => {
    if (privacyAgreed) {
      await declinePrivacy();
      setPrivacyAgreed(false);
    } else {
      await agreePrivacy();
      setPrivacyAgreed(true);
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <AppHeader background={tokens.color.bgPaper} />

      <View style={styles.content}>
        <View style={styles.upperBlock}>
          <Text style={styles.title}>서비스 약관 동의</Text>

          <View style={styles.illustWrap}>
            <TermsKeyIllust width={300} height={206} />
          </View>

          <View style={styles.textBlock}>
            <Text style={styles.subtitle}>약관에 동의하고 서비스를 시작하세요.</Text>

            <View style={styles.checkList}>
              <CheckRow
                checked={serviceAgreed}
                linkLabel="서비스 이용약관"
                tailLabel="에 동의합니다."
                onToggle={toggleService}
                onPressLink={() => navigation.navigate('TermsService')}
              />
              <CheckRow
                checked={privacyAgreed}
                linkLabel="개인정보 수집 및 이용"
                tailLabel="에 동의합니다."
                onToggle={togglePrivacy}
                onPressLink={() => navigation.navigate('TermsPrivacy')}
              />
            </View>
          </View>
        </View>

        <Pressable
          onPress={onStart}
          disabled={!allAgreed}
          style={({ pressed }) => [
            styles.cta,
            !allAgreed && styles.ctaDisabled,
            pressed && allAgreed && { opacity: 0.85 },
          ]}
          accessibilityRole="button"
        >
          <Text style={[styles.ctaLabel, !allAgreed && styles.ctaLabelDisabled]}>
            약관 동의
          </Text>
          {allAgreed
            ? <IconGavel width={20} height={20} />
            : <IconGavelGray width={20} height={20} />}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function CheckRow({
  checked, linkLabel, tailLabel, onToggle, onPressLink,
}: {
  checked: boolean;
  linkLabel: string;
  tailLabel: string;
  /** 체크박스 자체 탭 → on/off 토글 */
  onToggle: () => void;
  /** 약관 이름(링크) 탭 → 상세 화면 */
  onPressLink: () => void;
}) {
  return (
    <View style={styles.checkRow}>
      <Pressable
        onPress={onToggle}
        hitSlop={8}
        style={[styles.checkbox, checked && styles.checkboxChecked]}
      >
        {/* Figma 101:3828/3829 — 체크/언체크 동일하게 흰 체크 아이콘 표시. 배경색만 mint/gray로. */}
        <Check size={12} color={tokens.color.white} strokeWidth={3} />
      </Pressable>
      {/* nested Text — link 부분만 onPress 받고, 전체는 한 줄 inline 렌더 ("약관에 동의합니다" 자연스럽게 붙음). */}
      <Text style={styles.tailLabel}>
        <Text style={styles.linkLabel} onPress={onPressLink}>{linkLabel}</Text>
        {tailLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: tokens.color.bgPaper,
  },
  // AppHeader 아래 컨텐츠 — 가로 16 패딩, CTA를 바닥으로 밀기 위해 space-between.
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 32,
    justifyContent: 'space-between',
  },
  // 제목 → 일러스트 → 텍스트블록 = gap 40 (Figma 101:3673)
  upperBlock: {
    alignItems: 'center',
    gap: 40,
    paddingTop: 24,
  },
  // 부제 ↔ 체크리스트 = gap 24 (Figma 101:3825)
  textBlock: {
    width: '100%',
    alignItems: 'center',
    gap: 24,
  },
  // Figma 101:3671 — 30/38 -0.39 Bold #1F2937
  title: {
    fontSize: 30,
    lineHeight: 38,
    letterSpacing: -0.39,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.ink900,
    textAlign: 'center',
  },
  illustWrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Figma — 16/26 (1.6) Regular #4B5563 center
  subtitle: {
    fontSize: 16,
    lineHeight: 26,
    fontFamily: tokens.font.sans,
    color: '#4B5563',
    textAlign: 'center',
  },
  // 체크리스트 wrapper에 padding 24
  checkList: { width: '100%', gap: 12, paddingHorizontal: 24 },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  // Figma — unchecked: 회색(#C8C8C8) 채움, no border
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: tokens.color.pdGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // checked: pd-mint 채움 (Figma 101:3828 — #63CBE8)
  checkboxChecked: {
    backgroundColor: tokens.color.pdMint,
  },
  // Figma — pd-mint #63CBE8, 16/22 Medium underline
  linkLabel: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansMedium,
    color: tokens.color.pdMint,
    textDecorationLine: 'underline',
  },
  // Figma — 16/22 Regular ink900
  tailLabel: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink900,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 48,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: tokens.color.pdByellow,
    width: '100%',
  },
  ctaDisabled: { backgroundColor: tokens.color.pdBgray },
  ctaLabel: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.black,
  },
  ctaLabelDisabled: { color: tokens.color.pdGray },
});
