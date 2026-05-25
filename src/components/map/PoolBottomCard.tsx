import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { Button } from '@/components/ui/Button';
import { FavoriteHeart } from '@/components/ui/FavoriteHeart';
import { Tooltip } from '@/components/ui/Tooltip';
import type { Pool } from '@/types/pool';
import { tokens } from '@/styles/tokens';
import Swimmer from '@assets/icons/swimmer.svg';
import ArrowH from '@assets/icons/arrow-horizontal.svg';
import IconDepth from '@assets/icons/depth.svg';
import IconKids from '@assets/icons/facility-kids.svg';
import IconDiving from '@assets/icons/facility-diving.svg';
import IconHotel from '@assets/icons/facility-hotel.svg';
import { logEvent } from '@/lib/analytics';
import { useSwimSchedules } from '@/store/swimSchedule';
import { useFriends } from '@/store/friends';
import { useProfile } from '@/store/profile';
import { usePrefs } from '@/store/prefs';
import { useAddScheduleIntent } from '@/store/addScheduleIntent';
import { MOCK_OTHER_SCHEDULES } from '@/lib/mockData';
import {
  buildPoolScheduleSlots,
  type PoolScheduleSlot,
} from '@/lib/poolScheduleSlots';
import { PoolParticipantsSheet } from './PoolParticipantsSheet';

type ChipKey = 'kids' | 'diving' | 'hotel';
const CHIP_LABEL: Record<ChipKey, string> = {
  kids: '어린이풀',
  diving: '다이빙풀',
  hotel: '호텔',
};

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

// Figma 93:10597 풀 카드.

export function PoolBottomCard({
  pool,
  status,
  onPressScheduleAction,
}: Props) {
  const hasKids = !!pool.hasKidsPool;
  const hasDiving = !!pool.hasDivingPool;
  const isHotel = !!pool.isHotelPool;
  const showChips = hasKids || hasDiving || isHotel;

  // 칩 탭 → 위툴팁 5초 노출 (AddScheduleSheet 충돌 슬롯과 동일 패턴).
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

  // 카드가 보일 때 1회 — pool_id 별 카드 노출 카운트 (인기 풀 입력).
  React.useEffect(() => {
    void logEvent('pool_card_open', { pool_id: pool.id, status });
  }, [pool.id, status]);

  // 참여자 시트 — 풀의 모든 슬롯 + 가시 참여자. 일정카드 inline 노출 폐기
  // (Figma 281:3192). 슬롯 0개면 버튼 자체 미노출.
  const profile = useProfile((s) => s.profile);
  const mySchedules = useSwimSchedules((s) => s.schedules);
  const blockedIds = useFriends((s) => s.blocked);
  const othersScheduleView = usePrefs((s) => s.othersScheduleView);
  const setIntent = useAddScheduleIntent((s) => s.setIntent);
  const slots = React.useMemo(
    () =>
      buildPoolScheduleSlots({
        poolId: pool.id,
        me: {
          id: profile?.id,
          nickname: profile?.name,
          avatar: profile?.photoUri,
        },
        mySchedules,
        otherSchedules: MOCK_OTHER_SCHEDULES,
        blockedIds,
        othersScheduleView,
      }),
    [
      pool.id,
      profile?.id,
      profile?.name,
      profile?.photoUri,
      mySchedules,
      blockedIds,
      othersScheduleView,
    ],
  );
  const [participantsOpen, setParticipantsOpen] = React.useState(false);
  const onJoinSlot = (slot: PoolScheduleSlot) => {
    setIntent({
      poolId: pool.id,
      date: slot.date,
      start: slot.start,
      end: slot.end,
    });
    setParticipantsOpen(false);
  };

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
                  ? pool.priceWeekday === pool.priceWeekend
                    ? `이용요금 ${pool.priceWeekday}원`
                    : `평일 ${pool.priceWeekday}원 · 주말 ${pool.priceWeekend}원`
                  : `이용요금 ${pool.priceWeekday}원`}
              </Text>
            ) : null}
          </View>
          {pool.photoUrl ? (
            <Image source={pool.photoUrl} style={styles.photo} />
          ) : null}
        </View>

        {/* 인라인 stat + chip — 한 row, gap 12 */}
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

        {/* CTA row (Figma 281:4517) — gap 16. "참여자 보기"(콘텐츠폭) +
         *  "자유수영 시간표 보기"(flex 1). 둘 다 pdByellow.
         *  슬롯 0개 → 참여자 보기 미노출, 시간표 보기 단독 full width.
         *  status≠'available' → disabled CTA 단독(참여자 보기 미노출). */}
        {status === 'available' ? (
          <View style={styles.ctaRow}>
            {slots.length > 0 ? (
              <Button
                label="참여자 보기"
                onPress={() => setParticipantsOpen(true)}
                size="lg"
                variant="pdYellow"
                // Figma 265:3852 — px20 py12. Button size lg 기본 padH=0
                // 이라 콘텐츠폭 모드에서 텍스트만 노출 (시각상 안 보이는 수준)
                // → 명시 20px 부여로 콘텐츠+패딩 가시.
                style={styles.ctaContent}
              />
            ) : null}
            <Button
              label="자유수영 시간표 보기"
              onPress={onPressScheduleAction}
              size="lg"
              variant="pdYellow"
              style={styles.ctaGrow}
            />
          </View>
        ) : (
          <View style={styles.disabledCta} accessibilityRole="text">
            <Text style={styles.disabledLabel}>
              {status === 'no_schedule' ? '자유수영 정보 없음' : '자유수영 불가능'}
            </Text>
          </View>
        )}
      </View>

      <PoolParticipantsSheet
        visible={participantsOpen}
        onClose={() => setParticipantsOpen(false)}
        poolName={pool.name}
        slots={slots}
        onJoinSlot={onJoinSlot}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // Figma 93:10598 — padding 16. bg/radius/shadow/marginH/marginB 는 MapScreen
  // ScrollView wrapper 가 보유(스크롤 시 카드 라운드 클리핑 유지).
  card: {
    padding: 16,
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
  // Figma 93:10604 — width 153, gap-4 between text lines.
  // zIndex 1: 섬네일(Image, 뒤 형제)보다 위로 페인트 → textCol 안 툴팁이
  // 섬네일과 겹쳐도 위에 보이도록 하는 안전장치.
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
    ...tokens.shadow.lg,
  },
  // 칩 위쪽 툴팁 — 칩(20px)보다 넓게 양옆 -26으로 확장(총 72px). 꼬리는 가운데로 정렬.
  chipTip: {
    position: 'absolute',
    bottom: '100%',
    left: -26,
    width: 72,
    zIndex: 50,
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

  // Figma 281:4517 — CTA 두 버튼 row. gap 16, items-start.
  // 참여자 보기(콘텐츠폭) + 자유수영 시간표 보기(flex 1).
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  // Figma 281:4513 — 두 번째 버튼만 flex-[1_0_0] (남는 폭 차지).
  ctaGrow: { flex: 1 },
  // Figma 265:3852 — 콘텐츠폭 모드 px20. Button size lg 기본 padH=0 보강.
  ctaContent: { paddingHorizontal: 20 },
});
