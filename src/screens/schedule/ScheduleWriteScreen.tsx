// Figma: 5:15159 (시간표 작성하기 - 메인)
//
// 요일별 섹션 헤더 + 시간 슬롯 칩들 + "+" 추가 버튼.
// "+" 누르면 ScheduleTime 모달로 이동.

import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Plus, Check } from 'lucide-react-native';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { AppHeader } from '@/components/layout/AppHeader';
import { Button } from '@/components/ui/Button';
import { useScheduleDraft } from '@/store/scheduleDraft';
import type { RootStackParamList } from '@/navigation/types';
import type { DayOfWeek, DayPart } from '@/types/schedule';
import { tokens } from '@/styles/tokens';

const DAYS: DayOfWeek[] = ['월', '화', '수', '목', '금', '토', '일'];
const PARTS: DayPart[] = ['새벽', '오전', '오후', '저녁'];

export function ScheduleWriteScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ScheduleWrite'>>();
  const { poolId, nickname } = route.params;

  const draft = useScheduleDraft((s) => s.draft);
  const setCurrentDaySlot = useScheduleDraft((s) => s.setCurrentDaySlot);
  const removeTimeSlot = useScheduleDraft((s) => s.removeTimeSlot);
  const reset = useScheduleDraft((s) => s.reset);

  const totalSlots = React.useMemo(() => {
    if (!draft) return 0;
    return Object.values(draft.byDay).reduce((acc, arr) => acc + (arr?.length ?? 0), 0);
  }, [draft]);

  const onAdd = (day: DayOfWeek, part: DayPart) => {
    setCurrentDaySlot(day, part);
    navigation.navigate('ScheduleTime', { poolId, nickname, daySlot: { day, period: part } });
  };

  const onSubmit = () => {
    // TODO: 백엔드 전송 (지금은 더미)
    reset();
    navigation.navigate('ScheduleDone');
  };

  return (
    <ScreenContainer withHorizontalPadding={false}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.credit}>업데이트: 2026.10.31 - {nickname}</Text>
        <Text style={styles.poolName}>ABC 수영장</Text>
        <Text style={styles.notice}>다른 사용자를 위해 작성해주셔서 감사합니다.</Text>

        {DAYS.map((day) => (
          <View key={day} style={styles.section}>
            <Text style={styles.sectionTitle}>{day}요일</Text>
            <View style={styles.partGrid}>
              {PARTS.map((part) => {
                const slots = (draft?.byDay[day] ?? []).filter((s) => isInPart(s.start, part));
                return (
                  <View key={part} style={styles.partCol}>
                    <Text style={styles.partLabel}>{part}</Text>
                    {slots.map((s, i) => (
                      <Pressable
                        key={i}
                        onPress={() => removeTimeSlot(day, draft?.byDay[day]?.indexOf(s) ?? 0)}
                        style={styles.slotChip}
                      >
                        <Text style={styles.slotChipText}>{s.start}~{s.end}</Text>
                      </Pressable>
                    ))}
                    <Pressable onPress={() => onAdd(day, part)} style={styles.addBtn}>
                      <Plus size={18} color={tokens.color.ink500} strokeWidth={1.8} />
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={`등록 요청 (${totalSlots}개 슬롯)`}
          size="lg"
          fullWidth
          disabled={totalSlots === 0}
          onPress={onSubmit}
          iconRight={
            totalSlots > 0 ? <Check size={18} color={tokens.color.white} strokeWidth={2} /> : undefined
          }
        />
      </View>
    </ScreenContainer>
  );
}

/** "06:00" → 새벽/오전/오후/저녁 분류 */
function isInPart(time: string, part: DayPart): boolean {
  const h = parseInt(time.slice(0, 2), 10);
  if (part === '새벽') return h >= 4 && h < 9;
  if (part === '오전') return h >= 9 && h < 12;
  if (part === '오후') return h >= 12 && h < 18;
  return h >= 18 || h < 4;
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: tokens.layout.pagePadMobile,
    paddingTop: tokens.space[6],
    paddingBottom: tokens.space[16],
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
  section: {
    marginTop: tokens.space[8],
    paddingTop: tokens.space[4],
    borderTopWidth: 1,
    borderTopColor: tokens.color.lineSubtle,
  },
  sectionTitle: {
    ...tokens.text.h4,
    color: tokens.color.ink900,
  },
  partGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.space[3],
    marginTop: tokens.space[3],
  },
  partCol: {
    width: '47%',
    gap: tokens.space[2],
  },
  partLabel: {
    ...tokens.text.label,
    color: tokens.color.ink500,
  },
  slotChip: {
    backgroundColor: tokens.color.pool100,
    borderRadius: tokens.radius.md,
    paddingVertical: tokens.space[2],
    paddingHorizontal: tokens.space[3],
  },
  slotChipText: {
    ...tokens.text.bodySm,
    color: tokens.color.pool700,
    fontFamily: tokens.font.sansSemibold,
  },
  addBtn: {
    height: 40,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    borderColor: tokens.color.lineDefault,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    padding: tokens.layout.pagePadMobile,
    borderTopWidth: 1,
    borderTopColor: tokens.color.lineSubtle,
    backgroundColor: tokens.color.bgCream,
  },
});
