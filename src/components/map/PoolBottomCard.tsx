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

/**
 * 3-state CTA (Figma):
 * - 'available' (5:11479): 자유수영 가능 + 시간표 등록됨 → 단일 primary "자유수영 시간표 보기"
 * - 'no_schedule' (5:12919): 자유수영 가능 but 시간표 미등록 → 2버튼 split (시간표 작성 + 자유수영 정보 없음)
 * - 'impossible' (76:2032): 자유수영 자체 불가능한 풀 → 단일 disabled "자유수영 불가능"
 */
export type FreeSwimStatus = 'available' | 'no_schedule' | 'impossible';

interface Props {
  pool: Pool;
  status: FreeSwimStatus;
  /** 'available' → 시간표 보기 페이지로. 'no_schedule' → 시간표 작성 페이지로. 'impossible' → 호출 안됨. */
  onPressScheduleAction?: () => void;
}

type TipId = 'lane' | 'length' | 'depth' | 'kids' | 'diving';

/**
 * Figma 61:634/624/614, 60:871/881 — 5개 spec/배지 위에 뜨는 툴팁.
 * 흰 배경 + 진한 텍스트 + 아래 화살표 꼬리. 한 번에 하나만, 5초 자동 숨김.
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

/**
 * 메인 지도 화면 하단의 풀 정보 카드. Figma 5:11479 (small/has) 기준.
 * - 우상단 길찾기 버튼 제거 (Figma 변경)
 * - 부가시설 보유 시 배지 (유아풀/다이빙) — 탭하면 5초 툴팁
 */
export function PoolBottomCard({
  pool,
  status,
  onPressScheduleAction,
}: Props) {
  const hasKids = pool.facilities?.includes('유아풀');
  const hasDiving = pool.facilities?.includes('다이빙');
  // 스펙 행은 표시할 정보가 하나라도 있을 때만 노출 (Supabase 실데이터에 spec 정보 비어있는 케이스 多)
  const hasAnySpec =
    !!pool.laneCount ||
    !!pool.poolLength ||
    !!(pool.depthMin && pool.depthMax) ||
    !!hasKids ||
    !!hasDiving;

  const [activeTip, setActiveTip] = React.useState<TipId | null>(null);
  React.useEffect(() => {
    if (!activeTip) return;
    const t = setTimeout(() => setActiveTip(null), 5000);
    return () => clearTimeout(t);
  }, [activeTip]);

  const showTip = (id: TipId) => () => setActiveTip(id);

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.textCol}>
          <Text style={styles.name} numberOfLines={1}>{pool.name}</Text>
          <Text style={styles.addr}>{pool.address}</Text>
          {pool.phone ? <Text style={styles.phone}>{pool.phone}</Text> : null}
          {pool.pricePerSession ? (
            <Text style={styles.price}>
              1회 {pool.pricePerSession.toLocaleString('ko-KR')}원
            </Text>
          ) : null}
        </View>
        {pool.photoUrl ? (
          <Image source={pool.photoUrl} style={styles.photo} />
        ) : null}
      </View>

      {hasAnySpec ? (
      <View style={styles.specRow}>
        {pool.laneCount ? (
          <Pressable
            style={styles.spec}
            onPress={showTip('lane')}
            accessibilityRole="button"
            accessibilityLabel="레인수"
            hitSlop={4}
          >
            {activeTip === 'lane' ? <Tooltip label="레인수" /> : null}
            <Swimmer width={20} height={20} />
            <Text style={styles.specText}>{pool.laneCount}레인</Text>
          </Pressable>
        ) : null}
        {pool.poolLength ? (
          <Pressable
            style={styles.spec}
            onPress={showTip('length')}
            accessibilityRole="button"
            accessibilityLabel="레인 길이"
            hitSlop={4}
          >
            {activeTip === 'length' ? <Tooltip label="레인 길이" /> : null}
            <ArrowH width={20} height={20} />
            <Text style={styles.specText}>{pool.poolLength}m</Text>
          </Pressable>
        ) : null}
        {pool.depthMin && pool.depthMax ? (
          <Pressable
            style={styles.spec}
            onPress={showTip('depth')}
            accessibilityRole="button"
            accessibilityLabel="수심"
            hitSlop={4}
          >
            {activeTip === 'depth' ? <Tooltip label="수심" /> : null}
            <IconDepth width={20} height={20} />
            <Text style={styles.specText}>
              {pool.depthMin}~{pool.depthMax}m
            </Text>
          </Pressable>
        ) : null}
        {(hasKids || hasDiving) ? (
          <View style={styles.badgeRow}>
            {hasKids ? (
              <Pressable
                style={[styles.badge, { backgroundColor: tokens.color.brandBlue }]}
                onPress={showTip('kids')}
                accessibilityRole="button"
                accessibilityLabel="유아풀"
                hitSlop={4}
              >
                {activeTip === 'kids' ? <Tooltip label="유아풀" /> : null}
                <IconKids width={15} height={12} />
              </Pressable>
            ) : null}
            {hasDiving ? (
              <Pressable
                style={[styles.badge, { backgroundColor: tokens.color.brandBlue }]}
                onPress={showTip('diving')}
                accessibilityRole="button"
                accessibilityLabel="다이빙"
                hitSlop={4}
              >
                {activeTip === 'diving' ? <Tooltip label="다이빙" /> : null}
                <IconDiving width={16} height={16} />
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>
      ) : null}

      {status === 'available' ? (
        // Figma 5:11479 — 단일 primary "자유수영 시간표 보기"
        <Button
          label="자유수영 시간표 보기"
          onPress={onPressScheduleAction}
          size="lg"
          variant="primary"
          fullWidth
          style={styles.cta}
        />
      ) : status === 'no_schedule' ? (
        // Figma 5:12919 — 2버튼 split: 시간표 작성 (primary, 클릭) + 자유수영 정보 없음 (disabled, 비클릭)
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
        // Figma 76:2655 — 단일 disabled "자유수영 불가능": 파랑 10% bg + 파랑 30% text. 비클릭.
        <View style={styles.disabledCta} accessibilityRole="text">
          <Text style={styles.disabledLabel}>자유수영 불가능</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: tokens.color.bgPaper,
    borderRadius: tokens.radius.xl,
    padding: tokens.space[5],
    marginHorizontal: tokens.layout.pagePadMobile,
    marginBottom: tokens.space[4],
    ...tokens.shadow.lg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: tokens.space[3],
  },
  textCol: { flex: 1 },
  // 수영장 건물 사진 — 1:1 정사각, 80×80. photoUrl 없으면 미노출.
  photo: {
    width: 80,
    height: 80,
    borderRadius: tokens.radius.md,
    backgroundColor: tokens.color.bgSubtle,
  },
  name: { ...tokens.text.h3, color: tokens.color.ink900 },
  addr: { ...tokens.text.bodySm, color: tokens.color.ink700, marginTop: tokens.space[1] },
  phone: { ...tokens.text.bodySm, color: tokens.color.ink500 },
  price: { ...tokens.text.bodySm, color: tokens.color.ink700, marginTop: 2 },
  // Figma 5:12088 — 레인/길이/수심/배지 모두 좌측 정렬, 12px 일정 간격.
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space[3],
    marginTop: tokens.space[3],
  },
  spec: { flexDirection: 'row', alignItems: 'center', gap: tokens.space[1], position: 'relative' },
  specText: { ...tokens.text.bodySm, color: tokens.color.ink900 },
  // 부가시설 배지 영역
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  // Figma 60:602/603 — radius 6 (원이 아닌 둥근 사각형), padding 2.
  badge: {
    position: 'relative',
    width: 20,
    height: 20,
    borderRadius: 6,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Figma 5:11479 — 흰 배경 툴팁. 아이콘 위 가운데 정렬, 아래로 화살표.
  // wrapper width 200 + marginLeft -100 트릭으로 가운데 정렬 (가변 width 텍스트 지원).
  tooltip: {
    position: 'absolute',
    bottom: '100%',
    marginBottom: 4,
    left: 10,         // icon center (icon width 20 → center=10)
    marginLeft: -100, // wrapper width 의 절반
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
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: -0.04,
    fontFamily: tokens.font.sansBold,
    color: '#1F2937',
    textAlign: 'center',
  },
  tooltipTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: tokens.color.white,
  },
  cta: { marginTop: tokens.space[4] },
  // Figma 76:2655 — full-width disabled. 파랑 10% bg + 파랑 30% text + radius 14
  disabledCta: {
    marginTop: tokens.space[4],
    minHeight: 48,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Figma 5:12919 — 2버튼 split row, gap 10
  splitRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: tokens.space[4],
  },
  // Figma 5:12919 좌측 — primary "시간표 작성" (작성 가능 → 클릭 활성)
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
  // Figma 5:12919 우측 — disabled "자유수영 정보 없음" (flex 1로 잔여 폭 채움)
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
  // 두 disabled 케이스 공통 라벨 스타일
  disabledLabel: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansSemibold,
    color: 'rgba(0, 122, 255, 0.3)',
  },
});
