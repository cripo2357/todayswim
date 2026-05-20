// Figma 101:3833 "약관 상세보기" — 단일 템플릿. route param termsKey 로
// TERMS_META 에서 정보만 교체해 5개 약관(서비스/개인정보 수집·이용/
// 개인정보 처리방침/위치기반/마케팅)을 모두 커버.
//
// 읽기 전용 — Figma 101:3833엔 하단 버튼 없음(헤더 back으로 복귀).
// 동의/거부는 전적으로 TermsAgreement 체크박스 게이트가 담당.
// 본 화면은 약관 전문 열람만.

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BrandWordmark from '@assets/illustrations/wordmark-poolsday-light.svg';
import { WordmarkDroplets } from '@/components/ui/WordmarkDroplets';
import { AppHeader } from '@/components/layout/AppHeader';
import { TERMS_META } from '@/lib/termsContent';
import type { RootStackParamList } from '@/navigation/types';
import { tokens } from '@/styles/tokens';

export function TermsDetailScreen() {
  const { params } = useRoute<RouteProp<RootStackParamList, 'TermsDetail'>>();
  const meta = TERMS_META[params.termsKey];

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <AppHeader background={tokens.color.bgPaper} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.wordmarkWrap}>
          {/* 워드마크 apostrophe(#EAFF00)에서 노란 쉼표 물방울이 솟아오름 (스플래시와 동일 모션). */}
          <View style={styles.wordmarkBox}>
            <BrandWordmark width={256} height={152} />
            <WordmarkDroplets
              width={256}
              height={152}
              offsetX={-27}
              offsetY={-30}
              count={5}
              duration={1500}
            />
          </View>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.color.bgPaper },
  // Figma 101:3834 — w 343 (375 - 32 padding)
  scrollContent: { paddingHorizontal: 16, paddingBottom: 16 },
  wordmarkWrap: { alignItems: 'center', paddingTop: 24 },
  wordmarkBox: { width: 256, height: 152 },
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
});
