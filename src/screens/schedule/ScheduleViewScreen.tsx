// Figma: 5:14288 (시간표 조회)
//
// 풀 이름 + "업데이트: YYYY.MM.DD - 닉네임" 크레딧 + 7요일 칩 + 선택 요일의 시간 슬롯.
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { AppHeader } from '@/components/layout/AppHeader';
import { Chip } from '@/components/ui/Chip';
import { dummyPools, dummySchedules } from '@/data/dummyPools';
import type { RootStackParamList } from '@/navigation/types';
import type { DayOfWeek } from '@/types/schedule';
import { tokens } from '@/styles/tokens';

const DAYS: DayOfWeek[] = ['월', '화', '수', '목', '금', '토', '일'];

export function ScheduleViewScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'ScheduleView'>>();
  const { poolId } = route.params;

  const pool = dummyPools.find((p) => p.id === poolId);
  const schedule = dummySchedules.find((s) => s.poolId === poolId);

  const [selectedDay, setSelectedDay] = React.useState<DayOfWeek>('월');
  const slots = schedule?.byDay[selectedDay] ?? [];

  return (
    <ScreenContainer withHorizontalPadding={false}>
      <AppHeader title="자유수영 시간표" />

      <ScrollView contentContainerStyle={styles.body}>
        {/* 크레딧 */}
        {schedule ? (
          <Text style={styles.credit}>
            업데이트: {schedule.updatedAt} - {schedule.authorNickname}
          </Text>
        ) : null}

        <Text style={styles.poolName}>{pool?.name ?? '수영장'}</Text>

        <Text style={styles.notice}>실제 운영시간과 다를 수 있으니 참고만 하세요.</Text>

        {/* 7요일 칩 */}
        <View style={styles.daysRow}>
          {DAYS.map((d) => (
            <Chip
              key={d}
              label={d}
              active={d === selectedDay}
              onPress={() => setSelectedDay(d)}
            />
          ))}
        </View>

        {/* 시간 슬롯 */}
        <View style={styles.slots}>
          {slots.length === 0 ? (
            <Text style={styles.empty}>이 요일은 등록된 시간이 없어요.</Text>
          ) : (
            slots.map((slot, i) => (
              <View key={i} style={styles.slot}>
                <Text style={styles.slotTime}>
                  {slot.start} – {slot.end}
                </Text>
                {slot.hours ? (
                  <Text style={styles.slotHours}>{slot.hours}시간</Text>
                ) : null}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: tokens.layout.pagePadMobile,
    paddingTop: tokens.space[6],
    paddingBottom: tokens.space[12],
  },
  credit: { ...tokens.text.caption, color: tokens.color.ink500 },
  poolName: {
    ...tokens.text.h2,
    color: tokens.color.ink900,
    marginTop: tokens.space[3],
  },
  notice: {
    ...tokens.text.caption,
    color: tokens.color.ink500,
    marginTop: tokens.space[2],
  },
  daysRow: {
    flexDirection: 'row',
    gap: tokens.space[1],
    marginTop: tokens.space[6],
    flexWrap: 'wrap',
  },
  slots: { marginTop: tokens.space[6], gap: tokens.space[2] },
  slot: {
    backgroundColor: tokens.color.bgPaper,
    borderRadius: tokens.radius.md,
    paddingVertical: tokens.space[3],
    paddingHorizontal: tokens.space[4],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: tokens.color.lineDefault,
  },
  slotTime: {
    ...tokens.text.h4,
    color: tokens.color.ink900,
  },
  slotHours: {
    ...tokens.text.bodySm,
    color: tokens.color.pool700,
    fontFamily: tokens.font.sansSemibold,
  },
  empty: {
    ...tokens.text.body,
    color: tokens.color.ink500,
    textAlign: 'center',
    paddingVertical: tokens.space[8],
  },
});
