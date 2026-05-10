// Figma: 5:14288 (자유수영 시간표 보기) — dark backdrop + centered card.
//
// 풀이름 + 업데이트 캡션 + 7일 day chip + 선택 요일 시간 슬롯 + "시간표 수정 요청" outline 버튼.

import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useRoute, useNavigation, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ModalCard } from '@/components/layout/ModalCard';
import { Button } from '@/components/ui/Button';
import { dummyPools, dummySchedules } from '@/data/dummyPools';
import type { RootStackParamList } from '@/navigation/types';
import type { DayOfWeek } from '@/types/schedule';
import { tokens } from '@/styles/tokens';

const DAYS: DayOfWeek[] = ['월', '화', '수', '목', '금', '토', '일'];

export function ScheduleViewScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ScheduleView'>>();
  const { poolId } = route.params;

  const pool = dummyPools.find((p) => p.id === poolId);
  const schedule = dummySchedules.find((s) => s.poolId === poolId);

  const daysWithSchedule = React.useMemo(() => {
    if (!schedule) return new Set<DayOfWeek>();
    return new Set(
      DAYS.filter((d) => (schedule.byDay[d]?.length ?? 0) > 0),
    );
  }, [schedule]);

  const firstAvailable = React.useMemo<DayOfWeek>(() => {
    return DAYS.find((d) => daysWithSchedule.has(d)) ?? '월';
  }, [daysWithSchedule]);

  const [selectedDay, setSelectedDay] = React.useState<DayOfWeek>(firstAvailable);
  const slots = schedule?.byDay[selectedDay] ?? [];

  return (
    <ModalCard
      withCardPadding={false}
      onBackdropPress={() => navigation.goBack()}
    >
      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        {schedule ? (
          <Text style={styles.credit}>
            업데이트: {schedule.updatedAt} - {schedule.authorNickname}
          </Text>
        ) : null}

        <Text style={styles.poolName}>{pool?.name ?? '수영장'}</Text>

        <Text style={styles.notice}>
          실제 운영시간과 다를 수 있습니다. 꼭 문의 후 방문하세요.
        </Text>

        <View style={styles.daysRow}>
          {DAYS.map((d) => {
            const has = daysWithSchedule.has(d);
            const selected = d === selectedDay;
            return (
              <DayChip
                key={d}
                label={d}
                selected={selected}
                hasSchedule={has}
                onPress={() => setSelectedDay(d)}
              />
            );
          })}
        </View>

        <View style={styles.slotsWrap}>
          {slots.length === 0 ? (
            <Text style={styles.empty}>이 요일은 등록된 시간이 없어요.</Text>
          ) : (
            slots.map((slot, i) => (
              <View key={i} style={styles.slotChip}>
                <Text style={styles.slotChipText}>
                  {slot.start} ~ {slot.end}
                </Text>
              </View>
            ))
          )}
        </View>

        <Button
          label="시간표 수정 요청"
          variant="outline"
          size="lg"
          fullWidth
          onPress={() => navigation.navigate('ScheduleNickname', { poolId })}
          style={styles.modifyBtn}
        />
      </ScrollView>
    </ModalCard>
  );
}

interface DayChipProps {
  label: string;
  selected: boolean;
  hasSchedule: boolean;
  onPress: () => void;
}

function DayChip({ label, selected, hasSchedule, onPress }: DayChipProps) {
  // 3 states (Figma 5:14288):
  // 1) selected: solid brandBlue + white text
  // 2) has-schedule: white bg + brandBlue ring + brandBlue text
  // 3) no-schedule: light blue (#EFF6FF) bg + brandBlue text (no border)
  const containerStyle = selected
    ? styles.dayChipSelected
    : hasSchedule
      ? styles.dayChipActive
      : styles.dayChipMuted;
  const labelStyle = selected ? styles.dayChipLabelSelected : styles.dayChipLabel;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.dayChipBase, containerStyle, pressed && { opacity: 0.85 }]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text style={labelStyle}>{label}</Text>
    </Pressable>
  );
}

const DAY_CHIP_SIZE = 36;

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: tokens.space[6],
    paddingVertical: tokens.space[6],
  },
  credit: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.2,
    fontFamily: tokens.font.sansMedium,
    color: tokens.color.ink500,
    textAlign: 'right',
  },
  poolName: {
    fontSize: 22,
    lineHeight: 30,
    letterSpacing: -1,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.ink900,
    marginTop: tokens.space[2],
    textAlign: 'center',
  },
  notice: {
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: -0.2,
    fontFamily: tokens.font.sans,
    color: tokens.color.brandBlue,
    textAlign: 'center',
    marginTop: tokens.space[2],
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: tokens.space[6],
  },
  dayChipBase: {
    width: DAY_CHIP_SIZE,
    height: DAY_CHIP_SIZE,
    borderRadius: DAY_CHIP_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayChipSelected: {
    backgroundColor: tokens.color.brandBlue,
  },
  dayChipActive: {
    backgroundColor: tokens.color.bgPaper,
    borderWidth: 1.5,
    borderColor: tokens.color.brandBlue,
  },
  dayChipMuted: {
    backgroundColor: '#EFF6FF',
  },
  dayChipLabel: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.4,
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.brandBlue,
  },
  dayChipLabelSelected: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.4,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.white,
  },
  slotsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: tokens.space[6],
    minHeight: 48,
  },
  slotChip: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  slotChipText: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.4,
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.ink700,
  },
  empty: {
    ...tokens.text.bodySm,
    color: tokens.color.ink500,
    textAlign: 'center',
    paddingVertical: tokens.space[6],
    width: '100%',
  },
  modifyBtn: {
    marginTop: tokens.space[8],
  },
});
