// Figma 239:3560 — 자주 묻는 질문. 헤더 + 일러스트 + 타이틀 +
// 메일 CTA + 단일오픈 아코디언 리스트.
//
// 데이터는 Supabase `faqs` (0071) sort_order asc. 운영자가 Dashboard에서 관리.

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Linking,
  Alert,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { ChevronDown, ChevronRight } from 'lucide-react-native';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { AppHeader } from '@/components/layout/AppHeader';
import { useFaqs } from '@/hooks/useFaqs';
import { tokens } from '@/styles/tokens';
import type { Faq, FaqCategory } from '@/types/faq';
import { FAQ_CATEGORIES, FAQ_CATEGORY_LABEL } from '@/types/faq';
import IconEnvelope from '@assets/icons/settings/envelope.svg';
import FaqIllust from '@assets/illustrations/faq.svg';

const FEEDBACK_EMAIL = 'cripo2357@gmail.com';

// Android — LayoutAnimation 활성화(아코디언 펼침/접힘 부드럽게).
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function FaqScreen() {
  const { data, isLoading, error } = useFaqs();
  // 단일 오픈 아코디언 — 1개를 열면 기존 열린건 자동 닫힘([[전역 규칙]] 사용자 지정).
  const [openId, setOpenId] = React.useState<string | null>(null);
  // 카테고리 탭(Figma 245:5819) — 기본 '처음'. 전환 시 열린 아코디언 닫힘.
  const [category, setCategory] = React.useState<FaqCategory>('first');
  const all = data ?? [];
  const items = all.filter((f) => f.category === category);

  const onPressItem = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenId((cur) => (cur === id ? null : id));
  };

  const onPressTab = (next: FaqCategory) => {
    if (next === category) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCategory(next);
    setOpenId(null);
  };

  const sendMail = () => {
    const url = `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(
      "[Pool’s day] 문의",
    )}`;
    Linking.openURL(url).catch(() => {
      Alert.alert(
        '메일 앱을 열 수 없어요',
        `직접 ${FEEDBACK_EMAIL} 로 보내주세요.`,
      );
    });
  };

  return (
    <ScreenContainer withHorizontalPadding={false}>
      <AppHeader />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero illustration — Figma 239:3564 (343x229) */}
        <View style={styles.hero}>
          <FaqIllust width={343} height={229} />
        </View>

        {/* Title — Figma 239:3750 / 239:3751. Heading sm/Bold 30/38 -1.3 */}
        <Text style={styles.title}>자주 묻는 질문</Text>

        {/* Pool's day에 메일 보내기 — Figma 239:3884. Settings Simple 동형. */}
        <Pressable
          onPress={sendMail}
          style={({ pressed }) => [styles.mailRow, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Pool’s day에 메일 보내기"
        >
          <View style={styles.mailRowLeft}>
            <IconEnvelope width={24} height={24} />
            <Text style={styles.mailRowLabel} numberOfLines={1}>
              Pool’s day에 메일 보내기
            </Text>
          </View>
          <ChevronRight size={20} color="#CBD5E1" strokeWidth={2} />
        </Pressable>

        {/* 카테고리 탭 — Figma 245:5819. Pool's day 첫 진입 = '처음' 그룹부터 */}
        <View style={styles.tabGroup}>
          {FAQ_CATEGORIES.map((c) => {
            const active = c === category;
            return (
              <Pressable
                key={c}
                onPress={() => onPressTab(c)}
                style={[styles.tab, active && styles.tabActive]}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                  {FAQ_CATEGORY_LABEL[c]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* 아코디언 리스트 — Figma 239:3752 */}
        <View style={styles.list}>
          {isLoading ? (
            <View style={styles.center}>
              <ActivityIndicator color={tokens.color.brandBlue} />
            </View>
          ) : error ? (
            <View style={styles.center}>
              <Text style={styles.empty}>
                FAQ를 불러오지 못했어요. 잠시 후 다시 시도해주세요.
              </Text>
            </View>
          ) : items.length === 0 ? (
            <View style={styles.center}>
              <Text style={styles.empty}>
                {all.length === 0
                  ? '등록된 질문이 아직 없어요.'
                  : '이 카테고리에는 아직 질문이 없어요.'}
              </Text>
            </View>
          ) : (
            items.map((faq) => (
              <AccordionItem
                key={faq.id}
                faq={faq}
                open={openId === faq.id}
                onPress={() => onPressItem(faq.id)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

interface AccordionItemProps {
  faq: Faq;
  open: boolean;
  onPress: () => void;
}

function AccordionItem({ faq, open, onPress }: AccordionItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.acc, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={faq.question}
      accessibilityState={{ expanded: open }}
    >
      <View style={styles.accContent}>
        <View style={styles.accHeader}>
          <Text style={styles.question}>{faq.question}</Text>
        </View>
        {open ? <Text style={styles.answer}>{faq.answer}</Text> : null}
      </View>
      <ChevronDown
        size={24}
        color={tokens.color.ink500}
        strokeWidth={2}
        style={open ? styles.chevronOpen : undefined}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // 본문 컨테이너 — px16, top32. 섹션 간 gap32.
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 32,
    gap: 32,
  },

  // Figma 239:3564 — 일러스트 343x229
  hero: {
    width: 343,
    height: 229,
    alignSelf: 'center',
  },

  // Figma 239:3751 — Heading sm/Bold 30/38 -1.3 #1F2937
  title: {
    fontSize: 30,
    lineHeight: 38,
    letterSpacing: -1.3,
    fontFamily: tokens.font.sansBold,
    color: '#1F2937',
  },

  // Figma 239:3884 — Settings Simple. white card, r16, px12 py16, gap12, shadow.
  mailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: tokens.color.bgPaper,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 16,
    ...tokens.shadow.md,
  },
  mailRowLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minWidth: 0,
  },
  mailRowLabel: {
    flexShrink: 1,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansSemibold,
    color: '#1F2937',
  },

  pressed: { opacity: 0.6 },

  // Figma 245:5819 — Tab Group. bg #F1F5F9, p4, r18, h48.
  tabGroup: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    padding: 4,
    borderRadius: 18,
    height: 48,
    alignItems: 'stretch',
  },
  // 각 탭: flex-1, h40, px16 py8, r14, center 정렬.
  tab: {
    flex: 1,
    height: 40,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // 활성 탭: bg white + shadow-sm (탭은 카드 아님, 작은 그림자).
  tabActive: {
    backgroundColor: tokens.color.white,
    ...tokens.shadow.sm,
  },
  // 비활성 라벨: SemiBold 14/20 -0.084 #1F2937
  tabLabel: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansSemibold,
    color: '#1F2937',
  },
  // 활성 라벨: 같은 폰트, 색만 #4B5563 (Figma 245:5822 — 흰 bg 위에 톤다운)
  tabLabelActive: {
    color: '#4B5563',
  },

  // 아코디언 리스트 — 카드 외곽 없음, 행마다 하단 1px 라인.
  list: {
    // Figma는 행 사이 spacing 없음(각 행이 py16 + border-bottom).
  },

  // Figma 239:3753 — border-b 1 #CBD5E1, py16, gap12, items-start
  acc: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
  },
  accContent: {
    flex: 1,
    gap: 16,
    justifyContent: 'center',
  },
  accHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  // Figma I239:3753;5586:9404 — Bold 16/22 -0.112 #1F2937
  question: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansBold,
    color: '#1F2937',
  },
  // Figma I239:3753;5586:9406 — Paragraph/sm Regular 14, lh 1.6 (≈22.4) #4B5563
  answer: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: tokens.font.sans,
    color: '#4B5563',
  },
  chevronOpen: {
    // 펼침 상태 — 회전 효과(LayoutAnimation 으로 부드러운 콘텐츠 펼침).
    transform: [{ rotate: '180deg' }],
  },

  center: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink500,
    textAlign: 'center',
  },
});
