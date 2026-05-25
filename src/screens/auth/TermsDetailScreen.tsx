// Figma 101:3833 "약관 상세보기" — 단일 템플릿. route param termsKey 로
// TERMS_META 에서 정보만 교체해 5개 약관(서비스/개인정보 수집·이용/
// 개인정보 처리방침/위치기반/마케팅)을 모두 커버.
//
// 읽기 전용 — Figma 101:3833엔 하단 버튼 없음(헤더 back으로 복귀).
// 동의/거부는 전적으로 TermsAgreement 체크박스 게이트가 담당.
// 본 화면은 약관 전문 열람만.
//
// 워드마크/물방울 레이어링:
//   - 워드마크 + 물방울이 본문 스크롤과 동기 이동 (sticky가 아닌 fake-scroll).
//   - stacking은 분리해서: AppHeader가 워드마크는 paper bg로 자연스럽게 가리고,
//     물방울은 헤더보다 위 zIndex라 헤더 영역을 뚫고 솟구쳐 보임.
//   - 자식 순서: ScrollView → wordmarkLayer → headerWrap → dropletLayer
//     (뒤에 그려지는 게 위 stacking).

import React from 'react';
import {
  View, Text, StyleSheet, Animated, Dimensions,
} from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BrandWordmark from '@assets/illustrations/wordmark-poolsday-color.svg';
import { WordmarkDroplets } from '@/components/ui/WordmarkDroplets';
import { AppHeader } from '@/components/layout/AppHeader';
import { TERMS_META } from '@/lib/termsContent';
import type { RootStackParamList } from '@/navigation/types';
import { tokens } from '@/styles/tokens';

const SCREEN_W = Dimensions.get('window').width;
const HEADER_H = 48;
const WORDMARK_W = 256;
const WORDMARK_H = 152;
const WORDMARK_TOP_PAD = 24;
// ScrollView 본문 시작 = 헤더 + 워드마크 영역(상단패딩 + 높이) + 본문 간격 32
const CONTENT_TOP_PAD = HEADER_H + WORDMARK_TOP_PAD + WORDMARK_H + 32;

export function TermsDetailScreen() {
  const { params } = useRoute<RouteProp<RootStackParamList, 'TermsDetail'>>();
  const meta = TERMS_META[params.termsKey];
  const insets = useSafeAreaInsets();

  const scrollY = React.useRef(new Animated.Value(0)).current;
  // 본문 스크롤만큼 워드마크/물방울 레이어를 반대 방향으로 이동 → 스크롤 동기.
  const translateY = Animated.multiply(scrollY, -1);

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom }]}>
      <Animated.ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + CONTENT_TOP_PAD },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
      >
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
      </Animated.ScrollView>

      {/* 워드마크 — AppHeader 아래 stacking. 스크롤 시 헤더 영역으로 침범하면 paper bg가 가린다. */}
      <Animated.View
        style={[
          styles.wordmarkLayer,
          {
            top: insets.top + HEADER_H + WORDMARK_TOP_PAD,
            transform: [{ translateY }],
          },
        ]}
        pointerEvents="none"
      >
        <BrandWordmark width={WORDMARK_W} height={WORDMARK_H} />
      </Animated.View>

      {/* AppHeader — ScrollView/워드마크 위, droplet 아래. paper bg로 본문/워드마크 침범 가림.
          paddingTop으로 status bar 영역까지 paper로 채움. */}
      <View style={[styles.headerWrap, { paddingTop: insets.top }]}>
        <AppHeader background={tokens.color.bgPaper} />
      </View>

      {/* 물방울 — 헤더보다 위 stacking. 헤더 영역을 뚫고 솟구쳐 보임. 워드마크와 동일 translateY. */}
      <Animated.View
        style={[
          styles.dropletLayer,
          {
            top: insets.top + HEADER_H + WORDMARK_TOP_PAD,
            transform: [{ translateY }],
          },
        ]}
        pointerEvents="none"
      >
        <WordmarkDroplets
          width={WORDMARK_W}
          height={WORDMARK_H}
          color={tokens.color.pdMint}
          offsetX={-10}
          offsetY={-41}
          count={3}
          duration={1500}
          scale={1.15}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.color.bgPaper },
  // Figma 101:3834 — w 343 (375 - 32 padding). paddingTop은 인라인 (insets.top 더해 동적).
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  // 워드마크 absolute — top은 인라인 (insets.top + 헤더 + 워드마크 패딩).
  wordmarkLayer: {
    position: 'absolute',
    left: (SCREEN_W - WORDMARK_W) / 2,
    width: WORDMARK_W,
    height: WORDMARK_H,
  },
  // 헤더 wrap — absolute, paper bg로 status bar 영역까지 채움. 워드마크 위 stacking.
  // 스택 순서는 zIndex 만 사용 ([[shadow_boxshadow]] — elevation 금지).
  headerWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: tokens.color.bgPaper,
    zIndex: 10,
  },
  // 물방울 absolute — 헤더보다 위. 워드마크 영역과 동일 박스라 솟구침 좌표 일치.
  dropletLayer: {
    position: 'absolute',
    left: (SCREEN_W - WORDMARK_W) / 2,
    width: WORDMARK_W,
    height: WORDMARK_H,
    zIndex: 20,
  },
  // Figma 101:3838 — gap 20 (배지 ↔ 제목 그룹)
  headerBlock: { alignItems: 'center', gap: 20 },
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
