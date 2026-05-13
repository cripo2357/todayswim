// Figma: 5:15159 (시간표 작성하기)
//
// 흐름: Map → Write(이 화면) → Time(요일별 modal) → Nickname → Done.
// 닉네임은 마지막 단계에서 받으므로 이 화면엔 닉네임 정보 없음 (credit 표시 X).

import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Check } from 'lucide-react-native';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { AppHeader } from '@/components/layout/AppHeader';
import { Button } from '@/components/ui/Button';
import { useScheduleDraft } from '@/store/scheduleDraft';
import { usePools } from '@/hooks/usePools';
import type { RootStackParamList } from '@/navigation/types';
import { type DayOfWeek } from '@/types/schedule';
import { tokens } from '@/styles/tokens';
import IconAddBlue from '@assets/icons/add-blue.svg';
import IconSlotRemove from '@assets/icons/slot-remove.svg';

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
  const { poolId } = route.params;

  const draft = useScheduleDraft((s) => s.draft);
  const initDraft = useScheduleDraft((s) => s.init);
  const removeTimeSlot = useScheduleDraft((s) => s.removeTimeSlot);

  // 다른 경로(수정 요청 등)로 진입 시 draft 자동 초기화 — addTimeSlot이 silent no-op 되는 거 방지
  React.useEffect(() => {
    if (!draft || draft.poolId !== poolId) {
      initDraft(poolId);
    }
  }, [draft, poolId, initDraft]);

  // Supabase에서 풀명 fetch (캐시 공유 — MapScreen에서 이미 로드됨)
  const { data: poolsData } = usePools();
  const pool = poolsData?.find((p) => p.id === poolId);

  const totalSlots = React.useMemo(() => {
    if (!draft) return 0;
    return Object.values(draft.byDay).reduce((acc, arr) => acc + (arr?.length ?? 0), 0);
  }, [draft]);

  const onAdd = (day: DayOfWeek) => {
    navigation.navigate('ScheduleTime', { poolId, day });
  };

  // 시간표 입력 후 → 닉네임 화면으로 이동 (마지막 단계). draft는 Nickname 화면에서 reset.
  const onSubmit = () => {
    navigation.navigate('ScheduleNickname', { poolId });
  };

  return (
    <ScreenContainer withHorizontalPadding={false}>
      {/* Figma 5:15159 — 풀명을 상단 nav 타이틀로 통합 (별도 큰 타이틀 블록 제거) */}
      <AppHeader title={pool?.name ?? ''} />

      {/* 요일별 리스트 — 스크롤 영역 */}
      <ScrollView
        style={styles.listScroll}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
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
                      <IconSlotRemove width={20} height={20} />
                    </Pressable>
                  ))}
                  <Pressable
                    onPress={() => onAdd(day)}
                    style={styles.addBtn}
                    accessibilityLabel={`${DAY_LABEL[day]} 시간 추가`}
                  >
                    <IconAddBlue width={18} height={18} />
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="운영자에게 시간표 등록 요청"
          size="lg"
          fullWidth
          disabled={totalSlots === 0}
          onPress={onSubmit}
          style={styles.submitBtn}
          iconRight={
            <Check
              size={18}
              color={totalSlots > 0 ? tokens.color.white : tokens.color.pool300}
              strokeWidth={2.4}
            />
          }
        />
      </View>
    </ScreenContainer>
  );
}

// Figma 5:15162 — 컨테이너 px-16 py-32 gap-32. 일관되게 적용.
const PAGE_PAD = 16;

const styles = StyleSheet.create({
  // 요일 리스트 — flex:1 스크롤. AppHeader 바로 아래 → 32px gap → 요일 리스트.
  listScroll: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: PAGE_PAD,
    paddingTop: tokens.space[8], // 32: header → list gap
    paddingBottom: tokens.space[8],
  },
  dayList: {
    gap: tokens.space[8], // 32: 요일 섹션 간 gap
  },
  daySection: {
    gap: tokens.space[3], // 12: 타이틀 → chips
  },
  // Figma I5:15221 — Bold 16/22 tracking -0.112 ink900
  dayTitle: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.ink900,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  // Figma 5:15703 — border #cbd5e1 1px, radius 12, px-16 py-10, gap-8
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
  // Figma 5:15705 — SemiBold 14/20, tracking -0.084, color #4b5563
  slotChipText: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansSemibold,
    color: '#4B5563',
  },
  // Figma 5:15765 — bg #DBEAFE, size 40, radius 10
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: PAGE_PAD,
    paddingTop: 12,
    paddingBottom: tokens.space[6],
    borderTopWidth: 1,
    borderTopColor: tokens.color.lineSubtle,
    backgroundColor: tokens.color.bgCream,
  },
  // Figma 5:15325 — radius 14 (Button 기본 10 override)
  submitBtn: {
    borderRadius: 14,
  },
});
