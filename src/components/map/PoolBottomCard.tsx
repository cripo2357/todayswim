import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Button } from '@/components/ui/Button';
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
 * - 'no_schedule'  → 2버튼 split (시간표 작성 + 자유수영 정보 없음)
 * - 'impossible'   → disabled "자유수영 불가능"
 */
export type FreeSwimStatus = 'available' | 'no_schedule' | 'impossible';

interface Props {
  pool: Pool;
  status: FreeSwimStatus;
  /** 'available' → 시간표 보기 / 'no_schedule' → 시간표 작성 / 'impossible' → 호출 X */
  onPressScheduleAction?: () => void;
}

type TipId = 'lane' | 'length' | 'depth' | 'kids' | 'diving' | 'hotel';

/**
 * Figma 93:10597 풀 카드. 5초 자동 숨김 툴팁 + 라벨은 stat/chip 위에 떠 있는 형태.
 * Stat과 chip의 라벨은 카드에 평소엔 숨겨져 있고, 탭하면 흰 배경 툴팁으로 5초간 표시.
 */
function Tooltip({ label }: { label: string }) {
  return (
    <View style={styles.tooltip} pointerEvents="none">
      <View style={styles.tooltipBody}>
        <Text style={styles.tooltipText} numberOfLines={1}>
          {label}
        </Text>
      </View>
      <View style={styles.tooltipTail} />
    </View>
  );
}

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
            <Text style={styles.name} numberOfLines={1}>{pool.name}</Text>
            <Text style={styles.addr} numberOfLines={1}>{pool.address}</Text>
            {pool.phone ? (
              <Text style={styles.phone} numberOfLines={1}>{pool.phone}</Text>
            ) : null}
            {pool.pricePerSession ? (
              <Text style={styles.price} numberOfLines={1}>
                1회 {pool.pricePerSession.toLocaleString('ko-KR')}원
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
              {activeTip === 'lane' ? <Tooltip label="레인수" /> : null}
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
              {activeTip === 'length' ? <Tooltip label="레인 길이" /> : null}
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
              {activeTip === 'depth' ? <Tooltip label="수심" /> : null}
              <IconDepth width={20} height={20} />
              <Text style={styles.statValue}>
                {pool.depthMin}~{pool.depthMax}m
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
                  {activeTip === 'kids' ? <Tooltip label="유아풀" /> : null}
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
                  {activeTip === 'diving' ? <Tooltip label="다이빙풀" /> : null}
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
                  {activeTip === 'hotel' ? <Tooltip label="호텔" /> : null}
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
        ) : status === 'no_schedule' ? (
          <View style={styles.splitRow}>
            <Pressable
              onPress={onPressScheduleAction}
              style={({ pressed }) => [styles.writeBtn, pressed && { opacity: 0.85 }]}
              accessibilityRole="button"
              accessibilityLabel="시간표 작성"
            >
              <Text style={styles.writeBtnLabel}>시간표 작성</Text>
            </Pressable>
            <View style={styles.disabledHalfBtn} accessibilityRole="text">
              <Text style={styles.disabledLabel}>자유수영 정보 없음</Text>
            </View>
          </View>
        ) : (
          <View style={styles.disabledCta} accessibilityRole="text">
            <Text style={styles.disabledLabel}>자유수영 불가능</Text>
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
  textCol: { flex: 1, gap: 4 },
  // Figma 93:10610 — image 1:1, radius 6, self-stretch (텍스트 4줄 높이 ≈ 80px)
  photo: {
    width: 80,
    height: 80,
    borderRadius: 6,
    backgroundColor: tokens.color.bgSubtle,
  },
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

  // 툴팁 — stat/chip 위에 떠 있음. wrapper width 200 + ml -100으로 가운데 정렬.
  tooltip: {
    position: 'absolute',
    bottom: '100%',
    marginBottom: 4,
    left: 10,         // icon center (icon width 20 → center=10)
    marginLeft: -100, // wrapper width 절반
    width: 200,
    alignItems: 'center',
    zIndex: 10,
  },
  tooltipBody: {
    backgroundColor: tokens.color.white,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  tooltipText: {
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: -0.04,
    fontFamily: tokens.font.sansBold,
    color: '#1F2937',
    textAlign: 'center',
  },
  tooltipTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: tokens.color.white,
  },

  // 'impossible' / 'no_schedule' disabled 영역 — 기존 스타일 유지
  disabledCta: {
    minHeight: 48,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splitRow: { flexDirection: 'row', gap: 10 },
  writeBtn: {
    minHeight: 48,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: tokens.color.brandBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  writeBtnLabel: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.white,
  },
  disabledHalfBtn: {
    flex: 1,
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
