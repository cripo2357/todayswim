import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import { FavoriteHeart } from '@/components/ui/FavoriteHeart';
import type { Pool } from '@/types/pool';
import { tokens } from '@/styles/tokens';
import Swimmer from '@assets/icons/swimmer.svg';
import ArrowH from '@assets/icons/arrow-horizontal.svg';
import IconDepth from '@assets/icons/depth.svg';
import IconKids from '@assets/icons/facility-kids.svg';
import IconDiving from '@assets/icons/facility-diving.svg';
import IconHotel from '@assets/icons/facility-hotel.svg';

/**
 * 3-state CTA:
 * - 'available'    → pdYellow primary "자유수영 시간표 보기" (Figma 93:10597)
 * - 'no_schedule'  → disabled "자유수영 정보 없음"
 * - 'impossible'   → disabled "자유수영 불가능"
 */
export type FreeSwimStatus = 'available' | 'no_schedule' | 'impossible';

interface Props {
  pool: Pool;
  status: FreeSwimStatus;
  /** 'available' → 시간표 보기 / 그 외 → 비활성(호출 X) */
  onPressScheduleAction?: () => void;
}

type TipId = 'lane' | 'length' | 'depth' | 'kids' | 'diving' | 'hotel';

// Figma 93:10597 풀 카드. stat/chip 라벨은 평소 숨김, 탭하면 공통 Tooltip(147:5763)
// 으로 5초간 표시. styles.tooltip = 아이콘 위 절대 위치만 담당(말풍선은 공통 컴포넌트).

export function PoolBottomCard({
  pool,
  status,
  onPressScheduleAction,
}: Props) {
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
        {/* Header — text column + photo */}
        <View style={styles.headerRow}>
          <View style={styles.textCol}>
            {/* Figma 163:10646 — 이름 + 즐겨찾기 하트(gap 4, 20x20) */}
            <View style={styles.nameRow}>
              <Text style={[styles.name, styles.nameFlex]} numberOfLines={1}>
                {pool.name}
              </Text>
              <FavoriteHeart poolId={pool.id} size={20} />
            </View>
            <Text style={styles.addr} numberOfLines={1}>{pool.address}</Text>
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

        {/* 인라인 stat + chip — 한 row, gap 12. 탭 → 5초 툴팁. */}
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

        {/* CTA */}
        {status === 'available' ? (
          <Button
            label="자유수영 시간표 보기"
            onPress={onPressScheduleAction}
            size="lg"
            variant="pdYellow"
            fullWidth
          />
        ) : (
          <View style={styles.disabledCta} accessibilityRole="text">
            <Text style={styles.disabledLabel}>
              {status === 'no_schedule' ? '자유수영 정보 없음' : '자유수영 불가능'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Figma 93:10598 — padding 16, radius 16, shadow lg
  card: {
    backgroundColor: tokens.color.bgPaper,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: tokens.layout.pagePadMobile,
    marginBottom: tokens.space[4],
    ...tokens.shadow.lg,
  },
  // Figma 93:10599 — column gap 16 (header → row → CTA)
  innerCol: { gap: 16 },

  // Figma 93:10600 — items-start, justify-between
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  // Figma 93:10604 — width 153, gap-4 between text lines
  // zIndex 1: headerRow에서 섬네일(Image, 뒤 형제)보다 위로 페인트 →
  // 하트 툴팁(textCol 안, 오른쪽으로 뻗어 섬네일과 겹침)이 섬네일 위에
  // 보이도록(PoolListScreen과 동일). elevation은 Android halo라 미사용.
  textCol: { flex: 1, gap: 4, zIndex: 1 },
  // Figma 93:10610 — image 1:1, radius 6, self-stretch (텍스트 4줄 높이 ≈ 80px)
  photo: {
    width: 80,
    height: 80,
    borderRadius: 6,
    backgroundColor: tokens.color.bgSubtle,
  },
  // Figma 163:10646 — 이름 + 하트 한 줄(gap 4)
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  nameFlex: { flexShrink: 1 },
  // Figma 93:10606 — Plus Jakarta Bold 14/20 -0.084 #1F2937
  name: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansBold,
    color: '#1F2937',
  },
  // Figma 93:10607/10608/10609 — Regular 12/16 -0.06 #1F2937
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

  // Figma 93:10611 — gap 12 items-center, stat 3개 + chip group on SAME row
  statChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  // Figma 93:10612/10615/10619 — gap 4 items-center, icon 20 + text
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    position: 'relative',
  },
  // Figma 93:10614 — Plus Jakarta Regular 14/20 -0.084 #1F2937
  statValue: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sans,
    color: '#1F2937',
  },

  // Figma 93:10622 — chip group gap 6
  chipGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  // Figma 93:10623/10624/10703 — bg pd-mint #63CBE8, size 20×20, padding 2, radius 6, shadow lg
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

  // 공통 Tooltip 위치만 지정 — stat/chip 위 가운데(wrapper width 200 + ml -100).
  // 말풍선 시각은 @/components/ui/Tooltip (Figma 147:5763).
  tooltip: {
    position: 'absolute',
    bottom: '100%',
    marginBottom: 4,
    left: 10,         // icon center (icon width 20 → center=10)
    marginLeft: -100, // wrapper width 절반
    width: 200,
    zIndex: 10,
  },

  // 'impossible' / 'no_schedule' 공통 disabled CTA
  disabledCta: {
    minHeight: 48,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledLabel: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansSemibold,
    color: 'rgba(0, 122, 255, 0.3)',
  },
});
