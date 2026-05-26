// Figma 90:7417 — 자유수영 검색 (재디자인 2026-05-13).
//
// 변경 요약 (v1 → v2):
// - 제목 단축: "자유수영 수영장 검색" → "자유수영 검색", 서브타이틀 삭제
// - 요일 칩 3-state: 비선택(pd-blue 40%) / 선택(pd-mint) / 오늘+선택(pd-mint + pd-blue 보더 + pd-byellow 글자)
// - 라디오 칩 신디자인: 흰 bg → 선택 시 pd-mint bg + 2px pd-blue 보더 + pd-byellow 글자 + pd-blue 체크원
// - 섹션 "부가 시설" → "옵션" + 호텔 추가 (3개)
// - 옵션 칩에 facility 아이콘(cyan) 추가
// - Apply 버튼: brandBlue → pd-byellow + 검정 글자

import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { AppHeader } from '@/components/layout/AppHeader';
import { useSchedules } from '@/hooks/useSchedules';
import { usePools } from '@/hooks/usePools';
import type { RootStackParamList } from '@/navigation/types';
import type { DayOfWeek } from '@/types/schedule';
import {
  usePoolFilter,
  filterPools,
  ALL_DAYS,
  ALL_LANES,
  ALL_FEES,
  ALL_FACILITIES,
  DEFAULT_DAYS,
  type LaneOption,
  type FeeOption,
  type FacilityOption,
} from '@/store/poolFilter';
import IconLifeBuoy from '@assets/icons/life-buoy.svg';
import IconRotate from '@assets/icons/arrow-rotate-right.svg';
import { logEvent } from '@/lib/analytics';
// Figma 90:7417 — unselected: #4B5563 (Gray/60), selected: white (chip bg pd-mint)
import IconKidsGray from '@assets/icons/facility-kids-gray.svg';
import IconDivingGray from '@assets/icons/facility-diving-gray.svg';
import IconHotelGray from '@assets/icons/facility-hotel-gray.svg';
import IconKidsWhite from '@assets/icons/facility-kids.svg';
import IconDivingWhite from '@assets/icons/facility-diving.svg';
import IconHotelWhite from '@assets/icons/facility-hotel.svg';
import { tokens } from '@/styles/tokens';

export function PoolFilterScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const stored = usePoolFilter();
  const applyToStore = usePoolFilter((s) => s.apply);
  const resetStore = usePoolFilter((s) => s.reset);

  const [days, setDays] = React.useState<Set<DayOfWeek>>(
    // 필터 적용 안 된 상태(앱 시동 직후)면 기본값 토/일을 pre-select.
    // 이미 선택된 값 있으면 그대로 유지.
    () => new Set(stored.days.length > 0 ? stored.days : DEFAULT_DAYS),
  );
  const [lane, setLane] = React.useState<LaneOption>(stored.lane);
  const [fee, setFee] = React.useState<FeeOption>(stored.fee);
  const [facilities, setFacilities] = React.useState<Set<FacilityOption>>(
    new Set(stored.facilities),
  );

  const { data: poolsData } = usePools();
  const { data: schedulesData } = useSchedules();
  // ?? [] 인라인은 매 렌더 새 array reference → 의존 hook 무한 재계산.
  // useMemo 로 안정 reference 유지.
  const pools = React.useMemo(() => poolsData ?? [], [poolsData]);
  const schedules = React.useMemo(() => schedulesData ?? [], [schedulesData]);

  const resultCount = React.useMemo(() => {
    return filterPools(pools, schedules, {
      days: Array.from(days),
      lane,
      fee,
      facilities: Array.from(facilities),
      apply: () => {},
      reset: () => {},
      clearAll: () => {},
    }).length;
  }, [pools, schedules, days, lane, fee, facilities]);

  function toggleDay(d: DayOfWeek) {
    if (days.has(d) && days.size === 1) return;
    setDays((prev) => {
      const next = new Set(prev);
      if (next.has(d)) next.delete(d);
      else next.add(d);
      return next;
    });
  }

  function toggleFacility(f: FacilityOption) {
    setFacilities((prev) => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f);
      else next.add(f);
      return next;
    });
  }

  const canApply = resultCount > 0;

  const onReset = () => {
    resetStore();
    navigation.goBack();
  };

  const onApply = () => {
    if (!canApply) return;
    applyToStore({
      days: Array.from(days),
      lane,
      fee,
      facilities: Array.from(facilities),
    });
    void logEvent('pool_filter_apply', {
      day_count: days.size,
      lane: lane ?? 'any',
      fee: fee ?? 'any',
      facility_count: facilities.size,
    });
    // 필터 적용 → 지도가 아닌 수영장 목록 화면으로 이동.
    // replace로 필터 화면을 스택에서 제거 (사용자가 뒤로 가면 직전 화면으로).
    navigation.replace('PoolList');
  };

  return (
    <ScreenContainer withHorizontalPadding={false} background={tokens.color.bgPaper}>
      <AppHeader background={tokens.color.bgPaper} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>자유수영 검색</Text>

        {/* 자유수영 운영 요일 */}
        <Section label="자유수영 운영 요일" hint="최소 1개 선택">
          <View style={styles.dayCard}>
            {ALL_DAYS.map((d) => {
              const selected = days.has(d);
              return (
                <DayChip
                  key={d}
                  label={d}
                  selected={selected}
                  onPress={() => toggleDay(d)}
                />
              );
            })}
          </View>
        </Section>

        {/* 레인 길이 */}
        <Section label="레인 길이">
          <View style={styles.chipRow}>
            {ALL_LANES.map((opt) => (
              <RadioChip
                key={opt}
                label={opt}
                checked={lane === opt}
                onPress={() => setLane(opt)}
              />
            ))}
          </View>
        </Section>

        {/* 자유수영 요금 */}
        <Section label="자유수영 요금">
          <View style={styles.chipRow}>
            {ALL_FEES.map((opt) => (
              <RadioChip
                key={opt}
                label={opt}
                checked={fee === opt}
                onPress={() => setFee(opt)}
              />
            ))}
          </View>
        </Section>

        {/* 옵션 — 어린이풀/다이빙/호텔 */}
        <Section label="옵션">
          <View style={styles.chipRow}>
            {ALL_FACILITIES.map((f) => {
              const checked = facilities.has(f);
              // 선택 시: 글자색(white)과 동일한 white 아이콘으로 swap.
              const icon =
                f === '어린이풀'
                  ? checked
                    ? <IconKidsWhite width={20} height={20} />
                    : <IconKidsGray width={20} height={20} />
                  : f === '다이빙'
                  ? checked
                    ? <IconDivingWhite width={20} height={20} />
                    : <IconDivingGray width={20} height={20} />
                  : checked
                    ? <IconHotelWhite width={20} height={20} />
                    : <IconHotelGray width={20} height={20} />;
              return (
                <RadioChip
                  key={f}
                  label={f}
                  checked={checked}
                  onPress={() => toggleFacility(f)}
                  icon={icon}
                />
              );
            })}
          </View>
        </Section>
      </ScrollView>

      {/* 푸터 */}
      <View style={styles.footer}>
        {canApply ? (
          <Text style={styles.resultCountText}>필터 결과: {resultCount}곳</Text>
        ) : (
          <Text style={styles.validationText}>
            조건에 맞는 수영장이 없는 경우 필터를 적용할 수 없습니다.
          </Text>
        )}
        <View style={styles.footerButtons}>
          <Pressable
            onPress={onReset}
            style={({ pressed }) => [styles.resetBtn, pressed && { opacity: 0.85 }]}
            accessibilityRole="button"
          >
            <Text style={styles.resetLabel}>초기화</Text>
            <IconRotate width={20} height={20} />
          </Pressable>
          <Pressable
            onPress={onApply}
            disabled={!canApply}
            style={({ pressed }) => [
              styles.applyBtn,
              !canApply && styles.applyBtnDisabled,
              pressed && canApply && { opacity: 0.85 },
            ]}
            accessibilityRole="button"
            accessibilityState={{ disabled: !canApply }}
          >
            <Text style={styles.applyLabel}>수영장 검색</Text>
            <IconLifeBuoy width={20} height={20} />
          </Pressable>
        </View>
      </View>
    </ScreenContainer>
  );
}

function Section({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>
        {label}
        {hint ? <Text style={styles.sectionHint}>{` (${hint})`}</Text> : null}
      </Text>
      {children}
    </View>
  );
}

/** 요일 칩 — 35px 원형. 2 state: unselected / selected. */
function DayChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  // 비선택: 연한 pd-blue 40% bg, pd-blue 글자
  // 선택: pd-mint bg, 흰 글자
  return (
    <Pressable
      onPress={onPress}
      style={[styles.dayChip, selected && styles.dayChipSelected]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
    >
      <Text
        style={[
          styles.dayChipLabel,
          selected ? styles.dayChipLabelSelected : styles.dayChipLabelMuted,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/** 라디오 칩 — Figma 신스타일. 비선택: 흰 bg + 회색 보더 / 선택: pd-mint bg + pd-blue 보더 + pd-byellow 글자. */
function RadioChip({
  label,
  checked,
  onPress,
  icon,
}: {
  label: string;
  checked: boolean;
  onPress: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.radioChip,
        checked ? styles.radioChipChecked : styles.radioChipUnchecked,
      ]}
      accessibilityRole="radio"
      accessibilityState={{ checked }}
    >
      {icon}
      <Text
        style={[
          styles.radioChipLabel,
          checked ? styles.radioChipLabelChecked : styles.radioChipLabelUnchecked,
        ]}
      >
        {label}
      </Text>
      <View
        style={[
          styles.radioCircle,
          checked ? styles.radioCircleChecked : styles.radioCircleUnchecked,
        ]}
      >
        {checked ? <Text style={styles.radioCircleCheck}>✓</Text> : null}
      </View>
    </Pressable>
  );
}

const PAGE_PAD = 16;

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: PAGE_PAD,
    paddingTop: 16,
    paddingBottom: 32,
  },
  // Figma 30/38 -0.39 bold #1F2937
  title: {
    fontSize: 30,
    lineHeight: 38,
    letterSpacing: -0.39,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.ink900,
    marginBottom: 16,
  },
  section: {
    gap: 8,
    marginTop: 16,
  },
  // 14/20 -0.084 semibold
  sectionLabel: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.ink900,
  },
  // Figma — hint도 본문과 동일 색(ink900). 라벨과 시각적으로 한 덩어리.
  sectionHint: {
    fontFamily: tokens.font.sans,
    color: tokens.color.ink900,
  },

  // Figma 100:11345 — radius 16, padding 16, Shadow/lg (앱 카드 표준)
  dayCard: {
    backgroundColor: tokens.color.bgPaper,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...tokens.shadow.lg,
  },
  dayChip: {
    width: 35,
    height: 35,
    borderRadius: 35 / 2,
    alignItems: 'center',
    justifyContent: 'center',
    // 기본(비선택): pd-blue 40% bg
    backgroundColor: 'rgba(104, 144, 203, 0.4)',
  },
  // 선택: pd-mint bg (보더 없음)
  dayChipSelected: {
    backgroundColor: tokens.color.pdMint,
  },
  dayChipLabel: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansMedium,
    textAlign: 'center',
  },
  // 비선택 글자: pd-blue
  dayChipLabelMuted: {
    color: tokens.color.pdBlue,
  },
  // 선택 글자: white
  dayChipLabelSelected: {
    color: tokens.color.white,
  },

  // 라디오 칩 row — wrap, gap 8
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  // Figma 90:7449 등 — radius 16, padding 12, gap 8, 보더 1 #CBD5E1
  radioChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 46,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: tokens.color.bgPaper,
  },
  // Figma 90:7452 — bg/border 동색 pd-mint (외곽선 시각상 안 보임)
  radioChipChecked: {
    backgroundColor: tokens.color.pdMint,
    borderWidth: 1,
    borderColor: tokens.color.pdMint,
  },
  radioChipUnchecked: {},
  // 16/22 -0.112 Regular (Figma 변경: SemiBold → Regular)
  radioChipLabel: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sans,
  },
  radioChipLabelChecked: {
    color: tokens.color.white,
  },
  radioChipLabelUnchecked: {
    color: tokens.color.ink900,
  },
  // 라디오 원 — Figma 9999 radius, size 20
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleUnchecked: {
    backgroundColor: tokens.color.white,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  radioCircleChecked: {
    backgroundColor: tokens.color.pdBlue,
  },
  radioCircleCheck: {
    fontSize: 12,
    lineHeight: 14,
    color: tokens.color.white,
    fontFamily: tokens.font.sansBold,
  },

  // Figma 90:7482 — padding 32/16
  footer: {
    paddingHorizontal: PAGE_PAD,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: tokens.color.bgPaper,
    gap: 16,
  },
  // 12/16 regular -0.06 pd-blue 가운데
  resultCountText: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.06,
    fontFamily: tokens.font.sans,
    color: tokens.color.pdBlue,
    textAlign: 'center',
  },
  validationText: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.06,
    fontFamily: tokens.font.sans,
    color: tokens.color.red,
    textAlign: 'center',
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  // Figma 90:7486 — 흰 bg + pd-blue 보더, content-size
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: tokens.color.pdBlue,
    backgroundColor: tokens.color.bgPaper,
  },
  resetLabel: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.pdBlue,
  },
  // Figma 90:7487 — pd-byellow bg, black text, flex:1
  applyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: tokens.color.pdByellow,
  },
  applyBtnDisabled: {
    backgroundColor: tokens.color.bgSubtle,
  },
  applyLabel: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    // Figma: 한글은 Noto Sans KR Bold → Pretendard-Bold
    fontFamily: tokens.font.sansBold,
    color: tokens.color.black,
  },
});
