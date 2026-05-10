// Figma: 5:15159 (시간표 작성하기)
//
// 요일별 섹션 헤더 + 시간 칩 flex-wrap + 40x40 추가(+) 버튼.

import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Plus, Check, X } from 'lucide-react-native';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { AppHeader } from '@/components/layout/AppHeader';
import { Button } from '@/components/ui/Button';
import { useScheduleDraft } from '@/store/scheduleDraft';
import type { RootStackParamList } from '@/navigation/types';
import type { DayOfWeek } from '@/types/schedule';
import { tokens } from '@/styles/tokens';

const DAYS: DayOfWeek[] = ['월', '화', '수', '목', '금', '토', '일'];
const DAY_LABEL: Record<DayOfWeek, string> = {
  월: '월요일',
  화: '화요일',
  수: '수요일',
  목: '목요일',
  금: '금요일',
  토: '토요일',
  일: '일요일',
};

export function ScheduleWriteScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ScheduleWrite'>>();
  const { poolId, nickname } = route.params;

  const draft = useScheduleDraft((s) => s.draft);
  const removeTimeSlot = useScheduleDraft((s) => s.removeTimeSlot);
  const reset = useScheduleDraft((s) => s.reset);

  const totalSlots = React.useMemo(() => {
    if (!draft) return 0;
    return Object.values(draft.byDay).reduce((acc, arr) => acc + (arr?.length ?? 0), 0);
  }, [draft]);

  const onAdd = (day: DayOfWeek) => {
    navigation.navigate('ScheduleTime', { poolId, nickname, day, mode: 'start' });
  };

  const onSubmit = () => {
    reset();
    navigation.navigate('ScheduleDone');
  };

  return (
    <ScreenContainer withHorizontalPadding={false}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.credit}>업데이트: 2026.10.31 - {nickname}</Text>
        <Text style={styles.poolName}>ABC 수영장</Text>
        <Text style={styles.notice}>
          다른 사용자를 위해 자유수영 시간표를 작성해주셔서 감사합니다.
        </Text>

        <View style={styles.dayList}>
          {DAYS.map((day) => {
            const slots = draft?.byDay[day] ?? [];
            return (
              <View key={day} style={styles.daySection}>
                <Text style={styles.dayTitle}>{DAY_LABEL[day]}</Text>
                <View style={styles.chipRow}>
                  {slots.map((s, i) => (
                    <Pressable
                      key={i}
                      onPress={() => removeTimeSlot(day, i)}
                      style={styles.slotChip}
                      accessibilityLabel={`${s.start}~${s.end} 삭제`}
                    >
                      <Text style={styles.slotChipText}>{s.start} ~ {s.end}</Text>
                      <X size={16} color={tokens.color.ink500} strokeWidth={2} />
                    </Pressable>
                  ))}
                  <Pressable
                    onPress={() => onAdd(day)}
                    style={styles.addBtn}
                    accessibilityLabel={`${DAY_LABEL[day]} 시간 추가`}
                  >
                    <Plus size={18} color={tokens.color.brandBlue} strokeWidth={2.2} />
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="운영자에게 시간표 등록 요청하기"
          size="lg"
          fullWidth
          disabled={totalSlots === 0}
          onPress={onSubmit}
          iconRight={
            totalSlots > 0 ? (
              <Check size={18} color={tokens.color.white} strokeWidth={2.4} />
            ) : undefined
          }
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: tokens.layout.pagePadMobile,
    paddingTop: tokens.space[8],
    paddingBottom: tokens.space[16],
  },
  credit: {
    ...tokens.text.caption,
    color: tokens.color.ink500,
    textAlign: 'right',
  },
  poolName: {
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -1.2,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.ink900,
    marginTop: tokens.space[6],
    textAlign: 'center',
  },
  notice: {
    ...tokens.text.caption,
    color: tokens.color.brandBlue,
    textAlign: 'center',
    marginTop: tokens.space[2],
  },
  dayList: {
    marginTop: tokens.space[8],
    gap: tokens.space[8],
  },
  daySection: {
    gap: tokens.space[3],
  },
  dayTitle: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.7,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.ink900,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  slotChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  slotChipText: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.6,
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.ink700,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#DBEAFE',
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
