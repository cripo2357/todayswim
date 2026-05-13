// Figma 59:531/59:652 — 수영장 검색 필터.
//
// - 자유수영 운영 요일: multi-select (최소 1개)
// - 레인 길이: radio 단일 (전체 / 25m만 / 50m만)
// - 자유수영 요금: radio 단일 (전체 / 만원 이하만)
// - 부가 시설: multi-select (유아풀 / 다이빙)
//
// 푸터: count > 0이면 "필터 결과: N곳" 파랑, count == 0이면 빨간 validation + 적용 disabled.

import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RotateCcw, Check } from 'lucide-react-native';

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
  type LaneOption,
  type FeeOption,
  type FacilityOption,
} from '@/store/poolFilter';
import IconFilter from '@assets/icons/filter.svg';
import { tokens } from '@/styles/tokens';

export function PoolFilterScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const stored = usePoolFilter();
  const applyToStore = usePoolFilter((s) => s.apply);
  const resetStore = usePoolFilter((s) => s.reset);

  // 요일 multi (최소 1개). 비어있으면 전체 7일 = 필터 미적용.
  const [days, setDays] = React.useState<Set<DayOfWeek>>(
    () => new Set(stored.days.length > 0 ? stored.days : ALL_DAYS),
  );
  // 레인/요금 라디오 단일 — 기본값 '전체'
  const [lane, setLane] = React.useState<LaneOption>(stored.lane);
  const [fee, setFee] = React.useState<FeeOption>(stored.fee);
  // 부가시설 multi (옵셔널)
  const [facilities, setFacilities] = React.useState<Set<FacilityOption>>(new Set(stored.facilities));

  // Supabase에서 풀/시간표 fetch — MapScreen과 동일 데이터 소스 (react-query 캐시 공유).
  const { data: poolsData } = usePools();
  const { data: schedulesData } = useSchedules();
  const pools = poolsData ?? [];
  const schedules = schedulesData ?? [];

  // 실시간 매칭 카운트
  const resultCount = React.useMemo(() => {
    return filterPools(pools, schedules, {
      days: Array.from(days),
      lane,
      fee,
      facilities: Array.from(facilities),
      apply: () => {},
      reset: () => {},
    }).length;
  }, [pools, schedules, days, lane, fee, facilities]);

  function toggleDay(d: DayOfWeek) {
    // 마지막 1개 끄려 하면 무시 — 최소 1개 보장
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

  const onReset = () => {
    resetStore();
    navigation.goBack();
  };

  const canApply = resultCount > 0;

  const onApply = () => {
    if (!canApply) return;
    applyToStore({
      days: Array.from(days),
      lane,
      fee,
      facilities: Array.from(facilities),
    });
    navigation.goBack();
  };

  return (
    <ScreenContainer withHorizontalPadding={false}>
      <AppHeader />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleBlock}>
          <Text style={styles.title}>자유수영 수영장 검색</Text>
          <Text style={styles.subtitle}>
            자유수영 시간표가 없는 수영장은 검색 제외됩니다.
          </Text>
        </View>

        {/* 자유수영 운영 요일 — multi (최소 1개) */}
        <Section label="자유수영 운영 요일" hint="최소 1개 선택">
          <View style={styles.dayCard}>
            {ALL_DAYS.map((d) => {
              const selected = days.has(d);
              return (
                <Pressable
                  key={d}
                  onPress={() => toggleDay(d)}
                  style={[
                    styles.dayChip,
                    selected ? styles.dayChipSelected : styles.dayChipMuted,
                  ]}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected }}
                >
                  <Text style={selected ? styles.dayChipLabelSelected : styles.dayChipLabelMuted}>
                    {d}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Section>

        {/* 레인 길이 — radio 단일 */}
        <Section label="레인 길이">
          <View style={styles.radioRow}>
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

        {/* 자유수영 요금 — radio 단일 */}
        <Section label="자유수영 요금">
          <View style={styles.radioRow}>
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

        {/* 부가 시설 — multi (compact) */}
        <Section label="부가 시설">
          <View style={styles.facilityRow}>
            {ALL_FACILITIES.map((f) => (
              <RadioChip
                key={f}
                label={f}
                checked={facilities.has(f)}
                onPress={() => toggleFacility(f)}
                compact
              />
            ))}
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
            <RotateCcw size={18} color={tokens.color.brandBlue} strokeWidth={2.2} />
          </Pressable>
          <Pressable
            onPress={onApply}
            disabled={!canApply}
            style={({ pressed }) => [
              styles.applyBtn,
              pressed && canApply && { opacity: 0.85 },
            ]}
            accessibilityRole="button"
            accessibilityState={{ disabled: !canApply }}
          >
            <Text style={styles.applyLabel}>필터 적용</Text>
            <IconFilter width={18} height={18} color={tokens.color.white} />
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

interface RadioChipProps {
  label: string;
  checked: boolean;
  onPress: () => void;
  compact?: boolean;
}

function RadioChip({ label, checked, onPress, compact }: RadioChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        compact && styles.chipCompact,
        checked ? styles.chipChecked : styles.chipUnchecked,
      ]}
      accessibilityRole="radio"
      accessibilityState={{ checked }}
    >
      <Text style={[styles.chipLabel, checked && styles.chipLabelChecked]}>{label}</Text>
      <View style={[styles.chipCircle, checked && styles.chipCircleChecked]}>
        {checked ? <Check size={12} color={tokens.color.white} strokeWidth={3} /> : null}
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
  titleBlock: {
    marginBottom: 24,
    gap: 8,
  },
  title: {
    fontSize: 30,
    lineHeight: 38,
    letterSpacing: -0.39,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.ink900,
  },
  // Figma 57:2039 — Gray/60, paragraph md (16 / 1.6)
  subtitle: {
    fontSize: 16,
    lineHeight: 26,
    fontFamily: tokens.font.sans,
    color: '#4B5563',
  },
  section: {
    gap: 8,
    marginTop: 16,
  },
  sectionLabel: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.ink900,
  },
  sectionHint: {
    fontFamily: tokens.font.sans,
    color: tokens.color.ink500,
  },
  dayCard: {
    backgroundColor: tokens.color.bgPaper,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: 'rgba(15, 23, 42, 0.05)',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    shadowOpacity: 1,
    elevation: 2,
  },
  dayChip: {
    width: 35,
    height: 35,
    borderRadius: 35 / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayChipSelected: {
    backgroundColor: tokens.color.brandBlue,
  },
  dayChipMuted: {
    backgroundColor: '#DBEAFE',
  },
  dayChipLabelSelected: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansMedium,
    color: tokens.color.white,
  },
  dayChipLabelMuted: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansMedium,
    color: 'rgba(128, 128, 128, 0.55)',
  },
  radioRow: {
    flexDirection: 'row',
    gap: 8,
  },
  facilityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: tokens.color.lineDefault,
    backgroundColor: tokens.color.bgPaper,
  },
  chipCompact: {
    flex: 0,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chipChecked: {
    backgroundColor: '#EFF6FF',
    borderColor: tokens.color.brandBlue,
  },
  chipUnchecked: {},
  chipLabel: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.ink900,
  },
  chipLabelChecked: {
    color: tokens.color.brandBlue,
  },
  chipCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  chipCircleChecked: {
    borderColor: tokens.color.brandBlue,
    backgroundColor: tokens.color.brandBlue,
  },
  footer: {
    paddingHorizontal: PAGE_PAD,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: tokens.color.lineSubtle,
    backgroundColor: tokens.color.bgCream,
  },
  // count > 0: 파랑 결과 카운트
  resultCountText: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.brandBlue,
    textAlign: 'center',
    marginBottom: 12,
  },
  // count == 0: 빨간 validation (Figma 59:716 — Colors/Red #FF3B30)
  validationText: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.06,
    fontFamily: tokens.font.sans,
    color: tokens.color.red,
    textAlign: 'center',
    marginBottom: 12,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: tokens.color.brandBlue,
    backgroundColor: tokens.color.bgPaper,
  },
  resetLabel: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.brandBlue,
  },
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
    backgroundColor: tokens.color.brandBlue,
  },
  applyLabel: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.white,
  },
});
