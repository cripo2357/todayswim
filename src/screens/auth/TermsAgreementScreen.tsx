// Figma 101:3671 — 서비스 약관 동의 (가입 게이트).
// 동의 항목 5개: 만14세 / 서비스 이용약관 / 개인정보 수집·이용 /
//   위치기반서비스 이용약관 (필수 4) + 마케팅 정보 수신 동의 (선택).
// 약관명(링크) 탭 → 단일 상세 템플릿(TermsDetail), termsKey 전달.
// 만 14세는 약관 문서가 없어 링크 없는 평문 체크 행.

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check } from 'lucide-react-native';
import {
  getTermsState,
  isFullyAgreed,
  setConsent,
  MANDATORY_CONSENTS,
  type ConsentKey,
} from '@/lib/terms';
import type { TermsKey } from '@/lib/termsContent';
import type { RootStackParamList } from '@/navigation/types';
import { tokens } from '@/styles/tokens';
import { AppHeader } from '@/components/layout/AppHeader';
import TermsKeyIllust from '@assets/illustrations/terms-key.svg';
import IconGavel from '@assets/icons/gavel.svg';
import IconGavelGray from '@assets/icons/gavel-gray.svg';

// 표시 순서·라벨 (Figma 101:3671). label=링크 없는 평문 / linkLabel+tail=링크 행.
const ROWS: {
  key: ConsentKey;
  label?: string;
  linkLabel?: string;
  tail?: string;
  termsKey?: TermsKey;
}[] = [
  { key: 'age', label: '만 14세 이상입니다.' },
  {
    key: 'service',
    linkLabel: '서비스 이용약관',
    tail: '에 동의합니다.',
    termsKey: 'service',
  },
  {
    key: 'privacyConsent',
    linkLabel: '개인정보 수집·이용',
    tail: '에 동의합니다.',
    termsKey: 'privacyConsent',
  },
  {
    key: 'location',
    linkLabel: '위치기반서비스 이용약관',
    tail: '에 동의합니다.',
    termsKey: 'location',
  },
  {
    key: 'marketing',
    linkLabel: '마케팅 정보 수신 동의',
    tail: '에 동의합니다.(선택)',
    termsKey: 'marketing',
  },
];

type Agreed = Record<ConsentKey, boolean>;
const EMPTY: Agreed = {
  age: false,
  service: false,
  privacyConsent: false,
  location: false,
  marketing: false,
};

export function TermsAgreementScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [agreed, setAgreed] = React.useState<Agreed>(EMPTY);

  // 상세 화면 다녀온 후 동의 상태 재동기화.
  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        const s = await getTermsState();
        setAgreed({
          age: !!s.age,
          service: !!s.service,
          privacyConsent: !!s.privacyConsent,
          location: !!s.location,
          marketing: !!s.marketing,
        });
      })();
    }, []),
  );

  // 가입 진행 = 필수 4개 모두 동의 (마케팅 제외).
  const canStart = MANDATORY_CONSENTS.every((k) => agreed[k]);

  const toggle = async (key: ConsentKey) => {
    const next = !agreed[key];
    await setConsent(key, next);
    setAgreed((p) => ({ ...p, [key]: next }));
  };

  const onStart = () => {
    if (!canStart) return;
    navigation.replace('ProfileSetup');
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
            <Text style={styles.subtitle}>
              약관에 동의하고 서비스를 시작하세요.
            </Text>

            <View style={styles.checkList}>
              {ROWS.map((r) => (
                <CheckRow
                  key={r.key}
                  checked={agreed[r.key]}
                  label={r.label}
                  linkLabel={r.linkLabel}
                  tailLabel={r.tail}
                  onToggle={() => toggle(r.key)}
                  onPressLink={
                    r.termsKey
                      ? () =>
                          navigation.navigate('TermsDetail', {
                            termsKey: r.termsKey as TermsKey,
                          })
                      : undefined
                  }
                />
              ))}
            </View>
          </View>
        </View>

        <Pressable
          onPress={onStart}
          disabled={!canStart}
          style={({ pressed }) => [
            styles.cta,
            !canStart && styles.ctaDisabled,
            pressed && canStart && { opacity: 0.85 },
          ]}
          accessibilityRole="button"
        >
          <Text style={[styles.ctaLabel, !canStart && styles.ctaLabelDisabled]}>
            동의하고 풀스데이 시작
          </Text>
          {canStart ? (
            <IconGavel width={20} height={20} />
          ) : (
            <IconGavelGray width={20} height={20} />
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function CheckRow({
  checked,
  label,
  linkLabel,
  tailLabel,
  onToggle,
  onPressLink,
}: {
  checked: boolean;
  /** 링크 없는 평문 행 (만 14세) */
  label?: string;
  /** 링크 행: 약관명(밑줄) + 꼬리 */
  linkLabel?: string;
  tailLabel?: string;
  onToggle: () => void;
  onPressLink?: () => void;
}) {
  return (
    <View style={styles.checkRow}>
      <Pressable
        onPress={onToggle}
        hitSlop={8}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        style={[styles.checkbox, checked && styles.checkboxChecked]}
      >
        <Check size={12} color={tokens.color.white} strokeWidth={3} />
      </Pressable>
      {label != null ? (
        <Text style={styles.tailLabel}>{label}</Text>
      ) : (
        <Text style={styles.tailLabel}>
          <Text style={styles.linkLabel} onPress={onPressLink}>
            {linkLabel}
          </Text>
          {tailLabel}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: tokens.color.bgPaper,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 32,
    justifyContent: 'space-between',
  },
  upperBlock: {
    alignItems: 'center',
    gap: 40,
    paddingTop: 24,
  },
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
  // 16/26 Regular #4B5563 center
  subtitle: {
    fontSize: 16,
    lineHeight: 26,
    fontFamily: tokens.font.sans,
    color: '#4B5563',
    textAlign: 'center',
  },
  checkList: { width: '100%', gap: 12, paddingHorizontal: 24 },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  // unchecked: 회색 채움, no border
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: tokens.color.pdGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // checked: pd-mint 채움 (Figma 101:3828 #63CBE8)
  checkboxChecked: {
    backgroundColor: tokens.color.pdMint,
  },
  // pd-mint #63CBE8, 16/22 Medium underline
  linkLabel: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansMedium,
    color: tokens.color.pdMint,
    textDecorationLine: 'underline',
  },
  // 16/22 Regular ink900
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
