// Figma 103:1830 — 수영장 목록.
//
// 흐름: MapScreen 하단 "수영장 목록" 버튼 → 이 화면
// - 표시 대상: 지도에 보이는 풀 (필터 적용분)
// - 정렬: 거리순(내 위치 기준 Haversine) / 이름순(가나다 localeCompare)
// - 거리순 탭은 위치 권한 없거나 좌표 미상이면 미노출 → 이름순만
// - 페이지네이션: 10개 단위로 스크롤 끝에서 추가 로드 (서비스 속도 보호)

import React from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import IconFilter from '@assets/icons/filter.svg';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { AppHeader } from '@/components/layout/AppHeader';
import { Tooltip } from '@/components/ui/Tooltip';
import { usePools } from '@/hooks/usePools';
import { useSchedules } from '@/hooks/useSchedules';
import { useGeolocation } from '@/hooks/useGeolocation';
import { usePoolFilter, filterPools } from '@/store/poolFilter';
import { useSelection } from '@/store/selection';
import type { Pool } from '@/types/pool';
import type { RootStackParamList } from '@/navigation/types';
import { tokens } from '@/styles/tokens';
import Swimmer from '@assets/icons/swimmer.svg';
import ArrowH from '@assets/icons/arrow-horizontal.svg';
import IconDepth from '@assets/icons/depth.svg';
import IconKids from '@assets/icons/facility-kids.svg';
import IconDiving from '@assets/icons/facility-diving.svg';
import IconHotel from '@assets/icons/facility-hotel.svg';

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

  const { data: poolsData } = usePools();
  const { data: schedulesData } = useSchedules();
  const filter = usePoolFilter();
  const selectAndFocus = useSelection((s) => s.selectAndFocus);
  const geo = useGeolocation({ auto: true });
  const hasLocation = geo.status === 'granted' && !!geo.coords;

  const pools = poolsData ?? [];
  const schedules = schedulesData ?? [];

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

  // 페이지네이션: 10개씩 노출. 정렬/필터 바뀌면 1페이지로 리셋.
  const [visibleCount, setVisibleCount] = React.useState(PAGE_SIZE);
  React.useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [sortBy, filteredPools.length]);

  const visiblePools = sortedPools.slice(0, visibleCount);
  const canLoadMore = visibleCount < sortedPools.length;

  const onEndReached = () => {
    if (!canLoadMore) return;
    setVisibleCount((c) => Math.min(c + PAGE_SIZE, sortedPools.length));
  };

  const onPressMap = (pool: Pool) => {
    // 풀 선택 + 지도에서 해당 풀로 카메라 이동 요청 → MapScreen이 focus 시 consume.
    selectAndFocus(pool.id);
    navigation.navigate('MapMain');
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

type TipId = 'lane' | 'length' | 'depth' | 'kids' | 'diving' | 'hotel';

// stat/chip 라벨 툴팁은 공통 @/components/ui/Tooltip(Figma 147:5763) 사용.
// styles.tooltip = 아이콘 위 절대 위치만 담당.

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

  // 5초 자동 숨김 툴팁 — 한 번에 하나만.
  const [activeTip, setActiveTip] = React.useState<TipId | null>(null);
  React.useEffect(() => {
    if (!activeTip) return;
    const t = setTimeout(() => setActiveTip(null), 5000);
    return () => clearTimeout(t);
  }, [activeTip]);
  const showTip = (id: TipId) => () => setActiveTip(id);

  return (
    <View style={styles.card}>
      <View style={styles.innerCol}>
        <View style={styles.headerRow}>
          <View style={styles.textCol}>
            <Text style={styles.name} numberOfLines={1}>{pool.name}</Text>
            <Text style={styles.addr} numberOfLines={1}>
              {pool.address}
              {distanceKm !== undefined ? ` (${formatDistance(distanceKm)})` : ''}
            </Text>
            {pool.phone ? (
              <Text style={styles.phone} numberOfLines={1}>{pool.phone}</Text>
            ) : null}
            {pool.priceWeekday != null ? (
              <Text style={styles.price} numberOfLines={1}>
                {pool.priceWeekend != null
                  ? `평일 ${pool.priceWeekday}원 · 주말 ${pool.priceWeekend}원`
                  : `${pool.priceWeekday}원`}
              </Text>
            ) : null}
          </View>
          {pool.photoUrl ? (
            <Image source={pool.photoUrl} style={styles.photo} />
          ) : null}
        </View>

        <View style={styles.statChipRow}>
          {pool.laneCount ? (
            <Pressable
              style={styles.stat}
              onPress={showTip('lane')}
              accessibilityRole="button"
              accessibilityLabel="레인수"
              hitSlop={4}
            >
              {activeTip === 'lane' ? <Tooltip label="레인수" style={styles.tooltip} /> : null}
              <Swimmer width={20} height={20} />
              <Text style={styles.statValue}>{pool.laneCount}레인</Text>
            </Pressable>
          ) : null}
          {pool.poolLength ? (
            <Pressable
              style={styles.stat}
              onPress={showTip('length')}
              accessibilityRole="button"
              accessibilityLabel="레인 길이"
              hitSlop={4}
            >
              {activeTip === 'length' ? <Tooltip label="레인 길이" style={styles.tooltip} /> : null}
              <ArrowH width={20} height={20} />
              <Text style={styles.statValue}>{pool.poolLength}m</Text>
            </Pressable>
          ) : null}
          {pool.depthMin && pool.depthMax ? (
            <Pressable
              style={styles.stat}
              onPress={showTip('depth')}
              accessibilityRole="button"
              accessibilityLabel="수심"
              hitSlop={4}
            >
              {activeTip === 'depth' ? <Tooltip label="수심" style={styles.tooltip} /> : null}
              <IconDepth width={20} height={20} />
              <Text style={styles.statValue}>
                {pool.depthMin === pool.depthMax
                  ? `${pool.depthMin}m`
                  : `${pool.depthMin}~${pool.depthMax}m`}
              </Text>
            </Pressable>
          ) : null}

          {showChips ? (
            <View style={styles.chipGroup}>
              {hasKids ? (
                <Pressable
                  style={styles.chip}
                  onPress={showTip('kids')}
                  accessibilityRole="button"
                  accessibilityLabel="유아풀"
                  hitSlop={4}
                >
                  {activeTip === 'kids' ? <Tooltip label="유아풀" style={styles.tooltip} /> : null}
                  <IconKids width={16} height={16} />
                </Pressable>
              ) : null}
              {hasDiving ? (
                <Pressable
                  style={styles.chip}
                  onPress={showTip('diving')}
                  accessibilityRole="button"
                  accessibilityLabel="다이빙풀"
                  hitSlop={4}
                >
                  {activeTip === 'diving' ? <Tooltip label="다이빙풀" style={styles.tooltip} /> : null}
                  <IconDiving width={16} height={16} />
                </Pressable>
              ) : null}
              {isHotel ? (
                <Pressable
                  style={styles.chip}
                  onPress={showTip('hotel')}
                  accessibilityRole="button"
                  accessibilityLabel="호텔"
                  hitSlop={4}
                >
                  {activeTip === 'hotel' ? <Tooltip label="호텔" style={styles.tooltip} /> : null}
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
  textCol: { flex: 1, gap: 4 },
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
    position: 'relative',
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
    position: 'relative',
    ...tokens.shadow.lg,
  },

  // 공통 Tooltip 위치만 지정 — 아이콘 위 가운데(말풍선 시각은 ui/Tooltip).
  tooltip: {
    position: 'absolute',
    bottom: '100%',
    marginBottom: 4,
    left: 10,
    marginLeft: -100,
    width: 200,
    zIndex: 10,
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
