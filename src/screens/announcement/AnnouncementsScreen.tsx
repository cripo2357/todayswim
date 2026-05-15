// Figma: 75:1536 (Notification & Search — 공지사항 목록).
//
// 헤더(공지사항) → 최근(7일 이내) 섹션 + 이전 섹션 → 카드 리스트.
// 카드: 좌측 둥근 아이콘(유형별) + 우측 컨텐츠(타이틀/날짜/본문/선택 글머리/선택 CTA).

import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Linking, Alert, ActivityIndicator } from 'react-native';
import { ArrowUpRight } from 'lucide-react-native';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { AppHeader } from '@/components/layout/AppHeader';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { tokens } from '@/styles/tokens';
import type { Announcement, AnnouncementType } from '@/types/announcement';

import IconNewFeature from '@assets/icons/announcement/new-feature.svg';
import IconFeatureUpdate from '@assets/icons/announcement/feature-update.svg';
import IconInfoUpdate from '@assets/icons/announcement/info-update.svg';
import IconEvent from '@assets/icons/announcement/event.svg';

type SvgIcon = React.FC<{ width?: number; height?: number }>;

const ICON_BY_TYPE: Record<AnnouncementType, SvgIcon> = {
  new_feature: IconNewFeature,
  feature_update: IconFeatureUpdate,
  info_update: IconInfoUpdate,
  event: IconEvent,
};

const RECENT_DAYS = 7;
const RECENT_MS = RECENT_DAYS * 24 * 60 * 60 * 1000;

// Figma 26.05.11 형식 (yy.mm.dd)
function formatDate(iso: string): string {
  const d = new Date(iso);
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}.${mm}.${dd}`;
}

function isRecent(iso: string): boolean {
  return Date.now() - new Date(iso).getTime() < RECENT_MS;
}

export function AnnouncementsScreen() {
  const { data, isLoading, error } = useAnnouncements();
  const items = data ?? [];

  const recent = items.filter((a) => isRecent(a.publishedAt));
  const older = items.filter((a) => !isRecent(a.publishedAt));

  return (
    <ScreenContainer withHorizontalPadding={false}>
      <AppHeader title="공지사항" />
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={tokens.color.brandBlue} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.empty}>공지사항을 불러오지 못했습니다.</Text>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.empty}>등록된 공지사항이 없습니다.</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sections}>
            {recent.length > 0 && <Section title="최근" items={recent} />}
            {older.length > 0 && <Section title="이전" items={older} />}
          </View>
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

interface SectionProps {
  title: string;
  items: Announcement[];
}

function Section({ title, items }: SectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>{title}</Text>
      <View style={styles.cardList}>
        {items.map((a) => (
          <AnnouncementCard key={a.id} announcement={a} />
        ))}
      </View>
    </View>
  );
}

function AnnouncementCard({ announcement: a }: { announcement: Announcement }) {
  const Icon = ICON_BY_TYPE[a.type];
  const hasBullets = !!a.bullets && a.bullets.length > 0;
  const hasCta = !!a.buttonLabel && !!a.buttonUrl;

  const onCta = () => {
    if (!a.buttonUrl) return;
    Linking.openURL(a.buttonUrl).catch(() => {
      Alert.alert('링크를 열 수 없어요', a.buttonUrl ?? '');
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <Icon width={20} height={20} />
      </View>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{a.title}</Text>
          <Text style={styles.date}>{formatDate(a.publishedAt)}</Text>
        </View>
        <Text style={styles.body}>{a.body}</Text>
        {hasBullets && (
          <View style={styles.bullets}>
            {a.bullets!.map((b, i) => (
              <View key={i} style={styles.bulletRow}>
                <Text style={styles.bulletDot}>{'•'}</Text>
                <Text style={styles.bulletText}>{b}</Text>
              </View>
            ))}
          </View>
        )}
        {hasCta && (
          <Pressable
            onPress={onCta}
            style={({ pressed }) => [styles.cta, pressed && { opacity: 0.6 }]}
            accessibilityRole="link"
            accessibilityLabel={a.buttonLabel ?? undefined}
          >
            <ArrowUpRight size={16} color="#4B5563" strokeWidth={2} />
            <Text style={styles.ctaText}>{a.buttonLabel}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Figma 75:1539 — Frame p-16
  scrollContent: {
    padding: 16,
  },
  // Figma 75:1541 — gap-32 (섹션 간)
  sections: {
    gap: 32,
  },
  // Figma 75:1542 — gap-12 (섹션 헤더 ↔ 카드 리스트)
  section: {
    gap: 12,
  },
  // Figma I75:1543;...33443 — Bold 14/20 -0.084 #1F2937
  sectionHeader: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansBold,
    color: '#1F2937',
  },
  // Figma 75:1544 — gap-12 카드 사이
  cardList: {
    gap: 12,
  },
  // Figma 75:1545 — bg white, p-16, rounded-24, shadow-md (옅은 2겹), gap-12, items-start
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: tokens.color.white,
    padding: 16,
    borderRadius: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
  },
  // Figma I75:1545;...31071 — bg #F8FAFC, rounded-full, 40x40
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Figma I75:1545;...31070 — 우측 컨텐츠. gap-6 기본 (헤더↔본문)
  content: {
    flex: 1,
    gap: 6,
  },
  // Figma I75:1545;...31078 — title flex-1 + date. items-start (멀티라인 정렬)
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  // Figma I75:1545;...31069 — SemiBold 14/20 -0.084 #1F2937
  title: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansSemibold,
    color: '#1F2937',
  },
  // Figma I75:1545;...31076 — Regular 12/16 -0.06 #4B5563 whitespace-nowrap
  date: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.06,
    fontFamily: tokens.font.sans,
    color: '#4B5563',
  },
  // Figma Paragraph/sm — Regular 14, lh 1.6 (≈22), #4B5563
  body: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: tokens.font.sans,
    color: '#4B5563',
  },
  // 글머리 목록 — 본문에 살짝 들여쓰기 (Figma list-disc ms-21 모방)
  bullets: {
    paddingLeft: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bulletDot: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: tokens.font.sans,
    color: '#4B5563',
    width: 14,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: tokens.font.sans,
    color: '#4B5563',
  },
  // Figma I75:1548;...31171 (Badge Text) — border #CBD5E1, rounded-10, px-12 py-6, gap-8
  cta: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 6, // body→CTA 6 추가 = 총 12 (Figma 75:1548 gap-12)
  },
  // Figma I75:1548;...11545 — Medium 14/20 -0.084 #4B5563
  ctaText: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansMedium,
    color: '#4B5563',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  empty: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink500,
    textAlign: 'center',
  },
});
