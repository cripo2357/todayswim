// Figma 169:6312 / 169:6663 — 즐겨찾는 수영장 (설정 > 즐겨찾는 수영장 진입).
//
// '수영장 목록'(PoolListScreen, 지도용 전체/필터/정렬/CTA)과 분리된 전용 화면.
// - 본문: 즐겨찾기된 수영장만, 카드 = 썸네일 + 이름 + 주소 + 채운 하트(탭=해제)
// - 검색 트리거 → float 드롭다운(169:6663): 전체 수영장 + 하트 토글로
//   즐겨찾기 추가/해제. 드롭다운 결과는 즐겨찾기 먼저(가나다) → 일반(가나다).
//   ([[android_nested_modal_float]] — body 마지막 자식 absolute, 트리 최상위)

import React from 'react';
import {
  View, Text, FlatList, StyleSheet, Pressable, Image, TextInput, ScrollView,
} from 'react-native';
import { XCircle } from 'lucide-react-native';
import IconChevronDown from '@assets/icons/chevron-down.svg';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { AppHeader } from '@/components/layout/AppHeader';
import { FavoriteHeart } from '@/components/ui/FavoriteHeart';
import { useFavorites } from '@/store/favorites';
import { usePools } from '@/hooks/usePools';
import type { Pool } from '@/types/pool';
import { tokens } from '@/styles/tokens';

export function FavoritePoolsScreen() {
  const { data: poolsData } = usePools();
  const favIds = useFavorites((s) => s.ids);
  const pools = React.useMemo(() => poolsData ?? [], [poolsData]);

  const byKo = (a: Pool, b: Pool) => a.name.localeCompare(b.name, 'ko');

  // 본문 — 즐겨찾기된 수영장만(가나다). 하트 해제 시 favIds 변동 → 자동 제외.
  const favoritePools = React.useMemo(() => {
    const set = new Set(favIds);
    return pools.filter((p) => set.has(p.id)).sort(byKo);
  }, [pools, favIds]);

  // ── 검색 float (Figma 169:6663) — PoolListScreen과 동일 패턴 ──
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [draft, setDraft] = React.useState('');
  const [triggerY, setTriggerY] = React.useState(0);

  // 드롭다운: 전체 수영장(이름 매칭). 즐겨찾기 먼저(가나다) → 일반(가나다).
  const dropdownPools = React.useMemo(() => {
    const q = draft.trim().toLowerCase();
    const matched = q
      ? pools.filter((p) => p.name.toLowerCase().includes(q))
      : pools;
    const favSet = new Set(favIds);
    return [
      ...matched.filter((p) => favSet.has(p.id)).sort(byKo),
      ...matched.filter((p) => !favSet.has(p.id)).sort(byKo),
    ];
  }, [pools, draft, favIds]);

  return (
    <ScreenContainer withHorizontalPadding={false} background={tokens.color.bgPaper}>
      <AppHeader
        title={`즐겨찾는 수영장 (${favoritePools.length})`}
        background={tokens.color.bgPaper}
      />

      <View style={styles.contentWrap}>
        {/* Figma 169:6312 — 라벨 + 닫힘 트리거 */}
        <View style={styles.searchArea}>
          <Text style={styles.searchLabel}>수영장</Text>
          <View onLayout={(e) => setTriggerY(e.nativeEvent.layout.y)}>
            <Pressable
              onPress={() => setSearchOpen(true)}
              style={styles.poolTrigger}
              accessibilityRole="button"
              accessibilityLabel="수영장 이름으로 즐겨찾기 검색"
            >
              <Text style={[styles.poolTriggerText, styles.poolTriggerPlaceholder]}>
                수영장 이름
              </Text>
              <IconChevronDown width={20} height={20} />
            </Pressable>
          </View>
        </View>

        <FlatList
          data={favoritePools}
          keyExtractor={(item) => item.id}
          scrollEnabled={!searchOpen}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {item.photoUrl ? (
                <Image source={item.photoUrl} style={styles.photo} />
              ) : (
                <View style={styles.photo} />
              )}
              <View style={styles.textCol}>
                <Text style={styles.name} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.addr}>{item.address}</Text>
              </View>
              <FavoriteHeart poolId={item.id} size={24} />
            </View>
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.empty}>
              즐겨찾는 수영장이 없어요.{'\n'}수영장을 검색해 하트를 눌러보세요.
            </Text>
          }
          showsVerticalScrollIndicator={false}
        />

        {/* 검색 float — contentWrap 마지막 자식(트리 최상위) + absolute */}
        {searchOpen ? (
          <>
            <Pressable
              style={styles.poolBackdrop}
              onPress={() => setSearchOpen(false)}
              accessibilityRole="button"
              accessibilityLabel="수영장 검색 닫기"
            />
            <View style={[styles.poolPanel, { top: triggerY }]}>
              {/* Figma 169:6663 — 검색칸 #F8FAFC 알약 */}
              <View style={styles.poolSearch}>
                <View style={styles.poolSearchInputWrap}>
                  <TextInput
                    autoFocus
                    value={draft}
                    onChangeText={setDraft}
                    returnKeyType="search"
                    style={styles.poolSearchInput}
                  />
                  {draft.length === 0 ? (
                    <Text style={styles.poolSearchPlaceholder} pointerEvents="none">
                      수영장
                    </Text>
                  ) : null}
                </View>
                {draft.length > 0 ? (
                  <Pressable
                    onPress={() => setDraft('')}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel="검색어 지우기"
                  >
                    <XCircle size={20} color="#94A3B8" strokeWidth={2} />
                  </Pressable>
                ) : null}
              </View>
              <ScrollView
                style={styles.poolList}
                contentContainerStyle={styles.poolListContent}
                nestedScrollEnabled
                keyboardShouldPersistTaps="always"
              >
                {dropdownPools.map((p) => (
                  <View key={p.id} style={styles.poolItem}>
                    <FavoriteHeart poolId={p.id} size={20} />
                    <Text style={styles.poolItemText} numberOfLines={1}>
                      {p.name}
                    </Text>
                  </View>
                ))}
                {dropdownPools.length === 0 ? (
                  <Text style={styles.poolEmpty}>검색 결과가 없어요.</Text>
                ) : null}
              </ScrollView>
            </View>
          </>
        ) : null}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  contentWrap: { flex: 1, position: 'relative' },

  // 라벨 + 닫힘 트리거 (PoolListScreen과 동일 토큰)
  searchArea: { paddingHorizontal: 16, paddingTop: 8, gap: 8 },
  searchLabel: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansSemibold,
    color: '#4B5563',
  },
  poolTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#94A3B8',
    borderRadius: 14,
    backgroundColor: tokens.color.white,
  },
  poolTriggerText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sans,
    color: '#1F2937',
  },
  poolTriggerPlaceholder: { color: '#4B5563' },

  poolBackdrop: { ...StyleSheet.absoluteFillObject },
  poolPanel: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    backgroundColor: tokens.color.white,
    padding: 8,
    gap: 4,
    ...tokens.shadow.lg,
  },
  poolSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 40,
    padding: 8,
    borderRadius: 9999,
    backgroundColor: '#F8FAFC',
  },
  poolSearchInputWrap: { flex: 1, justifyContent: 'center' },
  poolSearchInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansMedium,
    color: '#4B5563',
    padding: 0,
  },
  poolSearchPlaceholder: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    textAlignVertical: 'center',
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansMedium,
    color: '#4B5563',
    includeFontPadding: false,
  },
  poolList: { height: 220 },
  poolListContent: { gap: 4 },
  // Figma 169:6663 — [하트] [이름] (하트 좌측), 알약 minH40 p8
  poolItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 40,
    padding: 8,
    borderRadius: 9999,
  },
  poolItemText: {
    flexShrink: 1,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansMedium,
    color: '#4B5563',
  },
  poolEmpty: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink500,
    textAlign: 'center',
    paddingVertical: 24,
  },

  // Figma 169:6312 — 카드 r16 p16 gap12, 썸네일 + 이름/주소 + 하트
  listContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32, gap: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: tokens.color.bgPaper,
    borderRadius: 16,
    padding: 16,
    ...tokens.shadow.lg,
  },
  photo: {
    width: 56,
    height: 56,
    borderRadius: 6,
    backgroundColor: tokens.color.bgSubtle,
  },
  textCol: { flex: 1, gap: 4 },
  name: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansBold,
    color: '#1F2937',
  },
  addr: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.06,
    fontFamily: tokens.font.sans,
    color: '#1F2937',
  },
  empty: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink500,
    textAlign: 'center',
    marginTop: 48,
  },
});
