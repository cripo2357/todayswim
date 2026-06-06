// Figma 103:1830 — 수영장 목록.
//
// 흐름: MapScreen 하단 "수영장 목록" 버튼 → 이 화면
// - 표시 대상: 지도에 보이는 풀 (필터 적용분)
// - 정렬: 거리순(내 위치 기준 Haversine) / 이름순(가나다 localeCompare)
// - 거리순 탭은 위치 권한 없거나 좌표 미상이면 미노출 → 이름순만
// - 페이지네이션: 10개 단위로 스크롤 끝에서 추가 로드 (서비스 속도 보호)

import React from 'react';
import {
  View, Text, FlatList, StyleSheet, Pressable, Image, ActivityIndicator,
  TextInput, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { XCircle } from 'lucide-react-native';
import IconFilter from '@assets/icons/filter.svg';
import IconChevronDown from '@assets/icons/chevron-down.svg';
import HeartFilled from '@assets/icons/heart-filled.svg';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { AppHeader } from '@/components/layout/AppHeader';
import { FavoriteHeart } from '@/components/ui/FavoriteHeart';
import { useFavorites } from '@/store/favorites';
import { usePools } from '@/hooks/usePools';
import { useSchedules } from '@/hooks/useSchedules';
import { useGeolocation } from '@/hooks/useGeolocation';
import { usePoolFilter, filterPools } from '@/store/poolFilter';
import { formatPoolPrice } from '@/lib/poolPrice';
import { useSelection } from '@/store/selection';
import type { Pool } from '@/types/pool';
import type { RootStackParamList } from '@/navigation/types';
import { tokens } from '@/styles/tokens';
import Swimmer from '@assets/icons/swimmer.svg';
import { logEvent } from '@/lib/analytics';
import ArrowH from '@assets/icons/arrow-horizontal.svg';
import IconDepth from '@assets/icons/depth.svg';
import IconKids from '@assets/icons/facility-kids.svg';
import IconDiving from '@assets/icons/facility-diving.svg';
import IconHotel from '@assets/icons/facility-hotel.svg';
import { Tooltip } from '@/components/ui/Tooltip';

const PAGE_SIZE = 10;
type SortBy = 'distance' | 'name';

/** Haversine — 두 GPS 좌표 간 km 거리. */
function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function PoolListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  React.useEffect(() => {
    void logEvent('pool_list_open');
  }, []);

  const { data: poolsData } = usePools();
  const { data: schedulesData } = useSchedules();
  const filter = usePoolFilter();
  const selectAndFocus = useSelection((s) => s.selectAndFocus);
  const geo = useGeolocation({ auto: true });
  const hasLocation = geo.status === 'granted' && !!geo.coords;

  // ?? [] 인라인은 매 렌더 새 array reference → 의존 hook 재계산.
  // useMemo 로 안정 reference.
  const pools = React.useMemo(() => poolsData ?? [], [poolsData]);
  const schedules = React.useMemo(() => schedulesData ?? [], [schedulesData]);

  // 필터 적용 — MapScreen과 동일 로직 (필터 미적용이면 pools 그대로)
  const filteredPools = React.useMemo(
    () => filterPools(pools, schedules, filter),
    [pools, schedules, filter],
  );

  // 거리순은 위치 있을 때만. 기본 거리순(위치 있으면), 위치 없으면 이름순.
  // 위치가 mount 후 도착한 경우에도 자동으로 거리순으로 전환 — 단 사용자가 직접 탭을 누르면 그 선택 존중.
  const [sortBy, setSortBy] = React.useState<SortBy>(hasLocation ? 'distance' : 'name');
  const userOverrideRef = React.useRef(false);
  const handleSetSort = (s: SortBy) => {
    userOverrideRef.current = true;
    setSortBy(s);
  };
  React.useEffect(() => {
    if (userOverrideRef.current) return;
    if (hasLocation && sortBy !== 'distance') setSortBy('distance');
    if (!hasLocation && sortBy === 'distance') setSortBy('name');
  }, [hasLocation, sortBy]);

  // 거리 계산 — 위치 있을 때 풀별 km 거리. 정렬과 카드 표시 모두 사용.
  const distanceMap = React.useMemo<Map<string, number> | null>(() => {
    if (!geo.coords) return null;
    const me = { lat: geo.coords.lat, lng: geo.coords.lng };
    const map = new Map<string, number>();
    for (const p of filteredPools) {
      map.set(p.id, haversineKm(me, { lat: p.lat, lng: p.lng }));
    }
    return map;
  }, [filteredPools, geo.coords]);

  const sortedPools = React.useMemo(() => {
    if (sortBy === 'name') {
      return [...filteredPools].sort((a, b) => a.name.localeCompare(b.name, 'ko'));
    }
    if (!distanceMap) return filteredPools;
    return [...filteredPools].sort(
      (a, b) => (distanceMap.get(a.id) ?? 0) - (distanceMap.get(b.id) ?? 0),
    );
  }, [filteredPools, sortBy, distanceMap]);

  // ── 수영장 이름 검색 (Figma 103:1830 / 147:5326) — 수영 일정 추가와 동일 패턴 ──
  const favIds = useFavorites((s) => s.ids);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [draft, setDraft] = React.useState(''); // 검색칸 입력값
  const [query, setQuery] = React.useState(''); // 확정된 필터(목록 적용)
  const [triggerY, setTriggerY] = React.useState(0);
  const searchInputRef = React.useRef<TextInput>(null);

  // 드롭다운 결과 — 즐겨찾기 먼저(가나다), 그 다음 일반(가나다).
  const dropdownPools = React.useMemo(() => {
    const q = draft.trim().toLowerCase();
    const matched = q
      ? filteredPools.filter((p) => p.name.toLowerCase().includes(q))
      : filteredPools;
    const favSet = new Set(favIds);
    const byKo = (a: Pool, b: Pool) => a.name.localeCompare(b.name, 'ko');
    return [
      ...matched.filter((p) => favSet.has(p.id)).sort(byKo),
      ...matched.filter((p) => !favSet.has(p.id)).sort(byKo),
    ];
  }, [filteredPools, draft, favIds]);

  // 확정 검색어로 목록 필터. 검색 중이면 결과를 즐겨찾기 먼저(가나다)
  // → 일반(가나다)로 정렬. 빈 값이면 전체(거리순/이름순 그대로).
  const searchedPools = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sortedPools;
    const matched = sortedPools.filter((p) =>
      p.name.toLowerCase().includes(q),
    );
    const favSet = new Set(favIds);
    const byKo = (a: Pool, b: Pool) => a.name.localeCompare(b.name, 'ko');
    return [
      ...matched.filter((p) => favSet.has(p.id)).sort(byKo),
      ...matched.filter((p) => !favSet.has(p.id)).sort(byKo),
    ];
  }, [sortedPools, query, favIds]);

  // 검색어 입력 후 키보드 [완료]/Enter → 전체 일치 결과를 목록에 적용
  // (1개만 지정할 필요 없음. 0개면 빈 상태 노출).
  const onSubmitSearch = () => {
    setQuery(draft.trim());
    setSearchOpen(false);
  };

  // 드롭다운에서 특정 수영장을 고르면 그 이름으로 확정(편의 — 필수 아님)
  const onSelectSearch = (pool: Pool) => {
    setQuery(pool.name);
    setDraft(pool.name);
    setSearchOpen(false);
  };

  // 페이지네이션: 10개씩 노출. 정렬/필터/검색 바뀌면 1페이지로 리셋.
  const [visibleCount, setVisibleCount] = React.useState(PAGE_SIZE);
  React.useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [sortBy, filteredPools.length, query]);

  const visiblePools = searchedPools.slice(0, visibleCount);
  const canLoadMore = visibleCount < searchedPools.length;

  const onEndReached = () => {
    if (!canLoadMore) return;
    setVisibleCount((c) => Math.min(c + PAGE_SIZE, searchedPools.length));
  };

  const onPressMap = (pool: Pool) => {
    // 풀 선택 + 지도에서 해당 풀로 카메라 이동 요청 → MapScreen이 focus 시 consume.
    selectAndFocus(pool.id);
    // 위계: Map=1depth(루트), 수영장 목록=2depth. '지도에서 보기'는 루트
    // Map으로 복귀하며 그 위 스택(목록 등) 제거 → 뒤로가기 시 목록으로
    // 되돌아오지 않음. (Splash가 replace('MapMain')라 MapMain이 스택 루트)
    navigation.popToTop();
  };

  const onPressSchedule = (pool: Pool) => {
    navigation.navigate('ScheduleView', { poolId: pool.id });
  };

  return (
    <ScreenContainer withHorizontalPadding={false} background={tokens.color.bgPaper}>
      <AppHeader
        title={`수영장 목록 (${filteredPools.length})`}
        background={tokens.color.bgPaper}
        rightSlot={
          <Pressable
            onPress={() => navigation.navigate('PoolFilter')}
            hitSlop={8}
            style={({ pressed }) => [styles.headerRightBtn, pressed && { opacity: 0.6 }]}
            accessibilityRole="button"
            accessibilityLabel="필터 설정"
          >
            <IconFilter width={24} height={24} color={tokens.color.ink900} />
          </Pressable>
        }
      />

      <View style={styles.contentWrap}>
        {/* 수영장 이름 검색 (Figma 163:6226) — 라벨 + 닫힘 트리거 */}
        <View style={styles.searchArea}>
          <Text style={styles.searchLabel}>수영장</Text>
          <View onLayout={(e) => setTriggerY(e.nativeEvent.layout.y)}>
            <Pressable
              onPress={() => setSearchOpen(true)}
              style={styles.poolTrigger}
              accessibilityRole="button"
              accessibilityLabel="수영장 이름 검색"
            >
              <Text
                style={[
                  styles.poolTriggerText,
                  !query && styles.poolTriggerPlaceholder,
                ]}
                numberOfLines={1}
              >
                {query || '수영장 이름'}
              </Text>
              <IconChevronDown width={20} height={20} />
            </Pressable>
          </View>
        </View>

        {/* 정렬 탭 — 거리순(위치 있을 때만) / 이름순 */}
        <View style={styles.tabsWrap}>
          <View style={styles.tabs}>
            {hasLocation ? (
              <TabBtn
                label="거리순"
                active={sortBy === 'distance'}
                onPress={() => handleSetSort('distance')}
              />
            ) : null}
            <TabBtn
              label="이름순"
              active={sortBy === 'name'}
              onPress={() => handleSetSort('name')}
            />
          </View>
        </View>

        <FlatList
          data={visiblePools}
          keyExtractor={(item) => item.id}
          scrollEnabled={!searchOpen}
          renderItem={({ item }) => (
            <PoolListCard
              pool={item}
              distanceKm={distanceMap?.get(item.id)}
              onPressMap={() => onPressMap(item)}
              onPressSchedule={() => onPressSchedule(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            canLoadMore ? (
              <View style={styles.loadingFooter}>
                <ActivityIndicator color={tokens.color.pdBlue} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <Text style={styles.empty}>조건에 맞는 수영장이 없어요.</Text>
          }
          showsVerticalScrollIndicator={false}
        />

        {/* 검색 float — contentWrap 마지막 자식(트리 최상위) + absolute */}
        {searchOpen ? (
          <>
            <Pressable
              style={styles.poolBackdrop}
              // 다른 영역 탭으로 자동완성 닫힐 때도 엔터와 동일하게
              // draft 커밋 + 닫기 = 검색 1회 실행(사용자 확정).
              onPress={onSubmitSearch}
              accessibilityRole="button"
              accessibilityLabel="수영장 검색 닫고 검색"
            />
            <View style={[styles.poolPanel, { top: triggerY }]}>
              {/* Figma 147:5406 — 검색칸 #F8FAFC 알약 */}
              <View style={styles.poolSearch}>
                <View style={styles.poolSearchInputWrap}>
                  <TextInput
                    ref={searchInputRef}
                    autoFocus
                    value={draft}
                    onChangeText={setDraft}
                    onSubmitEditing={onSubmitSearch}
                    returnKeyType="search"
                    style={styles.poolSearchInput}
                  />
                  {draft.length === 0 ? (
                    <Text style={styles.poolSearchPlaceholder} pointerEvents="none">
                      수영장 이름
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
                  <Pressable
                    key={p.id}
                    onPress={() => onSelectSearch(p)}
                    style={styles.poolItem}
                  >
                    <Text style={styles.poolItemText} numberOfLines={1}>
                      {p.name}
                    </Text>
                    {favIds.includes(p.id) ? (
                      <HeartFilled width={20} height={20} />
                    ) : null}
                  </Pressable>
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

function TabBtn({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.tabBtn, active && styles.tabBtnActive]}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
    >
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
    </Pressable>
  );
}

/** 거리 km 포맷 — < 1km은 소수점 2자리, >= 1km은 소수점 1자리, > 100km은 정수. */
function formatDistance(km: number): string {
  if (km < 1) return `${km.toFixed(2)}km`;
  if (km < 100) return `${km.toFixed(1)}km`;
  return `${Math.round(km)}km`;
}

// 칩 툴팁 라벨 — PoolBottomCard와 동일.
type ChipKey = 'kids' | 'diving' | 'hotel';
const CHIP_LABEL: Record<ChipKey, string> = {
  kids: '어린이풀',
  diving: '다이빙풀',
  hotel: '호텔',
};

/** 풀 목록 카드 — PoolBottomCard와 유사 레이아웃 + 2개 CTA (시간표 + 지도에서 보기). */
function PoolListCard({
  pool,
  distanceKm,
  onPressMap,
  onPressSchedule,
}: {
  pool: Pool;
  distanceKm?: number;
  onPressMap: () => void;
  onPressSchedule: () => void;
}) {
  const hasKids = !!pool.hasKidsPool;
  const hasDiving = !!pool.hasDivingPool;
  const isHotel = !!pool.isHotelPool;
  const showChips = hasKids || hasDiving || isHotel;

  // 칩 탭 → 위 툴팁 5초 노출 (PoolBottomCard와 동일 패턴).
  const [tipChip, setTipChip] = React.useState<ChipKey | null>(null);
  const tipTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const showTip = React.useCallback((c: ChipKey) => {
    setTipChip(c);
    if (tipTimer.current) clearTimeout(tipTimer.current);
    tipTimer.current = setTimeout(() => setTipChip(null), 5000);
  }, []);
  React.useEffect(
    () => () => {
      if (tipTimer.current) clearTimeout(tipTimer.current);
    },
    [],
  );

  return (
    <View style={styles.card}>
      <View style={styles.innerCol}>
        <View style={styles.headerRow}>
          <View style={styles.textCol}>
            {/* Figma 166:9726 — 이름 + 즐겨찾기 하트(gap 4, 20x20) */}
            <View style={styles.nameRow}>
              <Text style={[styles.name, styles.nameFlex]} numberOfLines={1}>
                {pool.name}
              </Text>
              <FavoriteHeart poolId={pool.id} size={20} />
            </View>
            {/* Figma 103:2607 — 주소는 말줄임 없이 여러 줄 줄바꿈(full text) */}
            <Text style={styles.addr}>
              {pool.address}
              {distanceKm !== undefined ? ` (${formatDistance(distanceKm)})` : ''}
            </Text>
            {pool.phone ? (
              <Text style={styles.phone} numberOfLines={1}>{pool.phone}</Text>
            ) : null}
            {formatPoolPrice(pool) ? (
              <Text style={styles.price} numberOfLines={1}>{formatPoolPrice(pool)}</Text>
            ) : null}
          </View>
          {pool.photoUrl ? (
            <Image source={pool.photoUrl} style={styles.photo} />
          ) : null}
        </View>

        <View style={styles.statChipRow}>
          {pool.laneCount ? (
            <View style={styles.stat}>
              <Swimmer width={20} height={20} />
              <Text style={styles.statValue}>{pool.laneCount}레인</Text>
            </View>
          ) : null}
          {pool.poolLength ? (
            <View style={styles.stat}>
              <ArrowH width={20} height={20} />
              <Text style={styles.statValue}>{pool.poolLength}m</Text>
            </View>
          ) : null}
          {pool.depthMin && pool.depthMax ? (
            <View style={styles.stat}>
              <IconDepth width={20} height={20} />
              <Text style={styles.statValue}>
                {pool.depthMin === pool.depthMax
                  ? `${pool.depthMin}m`
                  : `${pool.depthMin}~${pool.depthMax}m`}
              </Text>
            </View>
          ) : null}

          {showChips ? (
            <View style={styles.chipGroup}>
              {hasKids ? (
                <Pressable style={styles.chip} onPress={() => showTip('kids')}>
                  {tipChip === 'kids' ? (
                    <Tooltip label={CHIP_LABEL.kids} style={styles.chipTip} />
                  ) : null}
                  <IconKids width={16} height={16} />
                </Pressable>
              ) : null}
              {hasDiving ? (
                <Pressable style={styles.chip} onPress={() => showTip('diving')}>
                  {tipChip === 'diving' ? (
                    <Tooltip label={CHIP_LABEL.diving} style={styles.chipTip} />
                  ) : null}
                  <IconDiving width={16} height={16} />
                </Pressable>
              ) : null}
              {isHotel ? (
                <Pressable style={styles.chip} onPress={() => showTip('hotel')}>
                  {tipChip === 'hotel' ? (
                    <Tooltip label={CHIP_LABEL.hotel} style={styles.chipTip} />
                  ) : null}
                  <IconHotel width={16} height={16} />
                </Pressable>
              ) : null}
            </View>
          ) : null}
        </View>

        {/* 2개 CTA — 자유수영 시간표 / 지도에서 보기 (Figma 103:2795) */}
        <View style={styles.ctaRow}>
          <Pressable
            onPress={onPressSchedule}
            style={({ pressed }) => [styles.ctaHalf, pressed && { opacity: 0.85 }]}
            accessibilityRole="button"
            accessibilityLabel={`${pool.name} 자유수영 시간표`}
          >
            <Text style={styles.ctaLabel}>자유수영 시간표</Text>
          </Pressable>
          <Pressable
            onPress={onPressMap}
            style={({ pressed }) => [styles.ctaHalf, pressed && { opacity: 0.85 }]}
            accessibilityRole="button"
            accessibilityLabel={`${pool.name} 지도에서 보기`}
          >
            <Text style={styles.ctaLabel}>지도에서 보기</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // 검색 float가 목록 위에 뜨도록 relative 컨테이너
  contentWrap: { flex: 1, position: 'relative' },

  // ── 수영장 검색 (Figma 163:6226 / 147:5326) — AddScheduleSheet와 동일 ──
  // 라벨 + 닫힘 트리거 영역 (frame 103:2640 px16 py8)
  searchArea: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 8,
  },
  // Figma 163:6227 — SemiBold 14/20 -0.084 #4B5563
  searchLabel: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansSemibold,
    color: '#4B5563',
  },
  // Figma 163:6228 — border #94A3B8 r14 minH48 px12
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
  // 열림 시 화면 덮는 투명 영역 — 탭하면 닫힘(패널은 그 위, 트리 최상위)
  poolBackdrop: { ...StyleSheet.absoluteFillObject },
  // Figma 147:5326 — 흰 카드 border #E2E8F0 r14 p8 gap4 Shadow/lg
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
  // Figma 147:5406 — 검색칸 #F8FAFC 알약 minH40 p8 gap8
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
  // RN Android 커스텀폰트 placeholder 회피 — 빈 값 시 Text 오버레이
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
  // Figma 147:5330 — 아이템 알약 minH40 p8 (이름 + 즐겨찾기 하트)
  poolItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 40,
    padding: 8,
    borderRadius: 9999,
  },
  // Figma 163:10807 — [이름] gap [하트]. flexShrink만(콘텐츠 너비, 길면
  // 말줄임) → 하트가 텍스트 바로 옆(맨 오른쪽 끝 아님). AddScheduleSheet와 동일.
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

  // 상단 우측 망원경(필터) 버튼 — 24x24 tap target 40
  headerRightBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // 정렬 탭 (Figma 103:1830 상단 segmented control)
  tabsWrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  // Figma 103:2641 — bg #F1F5F9, radius 18, padding 4
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 18,
    padding: 4,
  },
  // Figma I103:2641 — h 40, radius 14
  tabBtn: {
    flex: 1,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtnActive: {
    backgroundColor: tokens.color.bgPaper,
    ...(tokens.shadow.sm),
  },
  tabLabel: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansMedium,
    color: tokens.color.ink500,
  },
  tabLabelActive: {
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.ink900,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    // Figma 103:1834 — 카드 사이 gap 32
    gap: 32,
  },
  loadingFooter: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  empty: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink500,
    textAlign: 'center',
    marginTop: 48,
  },

  // 카드 — PoolBottomCard 동일 구조 (Figma 93:10597 기준)
  card: {
    backgroundColor: tokens.color.bgPaper,
    borderRadius: 16,
    padding: 16,
    ...tokens.shadow.lg,
  },
  innerCol: { gap: 16 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  // zIndex 1: 섬네일(Image, 뒤 형제)보다 위로 페인트 → textCol 안 툴팁이
  // 섬네일과 겹쳐도 위에 보이도록 하는 안전장치.
  textCol: { flex: 1, gap: 4, zIndex: 1 },
  // Figma 166:9726 — 이름 + 하트 한 줄(gap 4)
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  nameFlex: { flexShrink: 1 },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 6,
    backgroundColor: tokens.color.bgSubtle,
  },
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
  phone: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.06,
    fontFamily: tokens.font.sans,
    color: '#1F2937',
  },
  price: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.06,
    fontFamily: tokens.font.sans,
    color: tokens.color.black,
  },

  statChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sans,
    color: '#1F2937',
  },

  chipGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chip: {
    width: 20,
    height: 20,
    padding: 2,
    borderRadius: 6,
    backgroundColor: tokens.color.pdMint,
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadow.lg,
  },
  // 칩 위 툴팁 (PoolBottomCard와 동일) — 칩(20) 중앙 정렬 72px.
  chipTip: {
    position: 'absolute',
    bottom: '100%',
    left: -26,
    width: 72,
    zIndex: 50,
  },

  // 2개 CTA — Figma 103:2795 gap 16
  ctaRow: {
    flexDirection: 'row',
    gap: 16,
  },
  ctaHalf: {
    flex: 1,
    minHeight: 48,
    height: 48,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: tokens.color.pdByellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaLabel: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.black,
  },
});
