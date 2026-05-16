// Figma: 5:14288 (자유수영 시간표 보기) — dark backdrop + centered card.
//
// 풀이름 + 업데이트 캡션 + 7일 day chip + 선택 요일 시간 슬롯 + "시간표 수정 요청" outline 버튼.

import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useRoute, useNavigation, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import IconWrench from '@assets/icons/wrench.svg';

import { ModalCard } from '@/components/layout/ModalCard';
import { useSchedules } from '@/hooks/useSchedules';
import { usePools } from '@/hooks/usePools';
import { useScheduleDraft } from '@/store/scheduleDraft';
import type { RootStackParamList } from '@/navigation/types';
import { isAnonNickname, type DayOfWeek } from '@/types/schedule';
import { tokens } from '@/styles/tokens';

const DAYS: DayOfWeek[] = ['월', '화', '수', '목', '금', '토', '일'];

export function ScheduleViewScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ScheduleView'>>();
  const { poolId } = route.params;

  const { data: poolsData } = usePools();
  const { data: schedulesData } = useSchedules();
  const pool = poolsData?.find((p) => p.id === poolId);
  const schedule = schedulesData?.find((s) => s.poolId === poolId);
  const initFromSchedule = useScheduleDraft((s) => s.initFromSchedule);

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
  const dayNote = schedule?.dayNotes?.[selectedDay];

  return (
    <ModalCard
      withCardPadding={false}
      onBackdropPress={() => navigation.goBack()}
      cardStyle={{ height: CARD_H, padding: 16 }}
    >
      <View style={styles.body}>
        {/* 헤더 (credit + title + notice) — Figma 5:15676 gap-24 */}
        <View style={styles.headerBlock}>
          {schedule ? (
            isAnonNickname(schedule.authorNickname) ? (
              <Text style={styles.credit}>
                <Text style={styles.creditPrefix}>업데이트: {schedule.updatedAt}</Text>
              </Text>
            ) : (
              <Text style={styles.credit}>
                <Text style={styles.creditPrefix}>업데이트: {schedule.updatedAt} - </Text>
                <Text style={styles.creditNick}>
                  {schedule.authorNickname}
                  {schedule.authorNickname === '풀스데이' ? '' : '님'}
                </Text>
              </Text>
            )
          ) : null}

          <View style={styles.titleBlock}>
            <Text
              style={styles.poolName}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.6}
            >
              {pool?.name ?? '수영장'}
            </Text>
            <Text style={styles.notice}>
              실제 운영시간과 다를 수 있습니다. 꼭 문의 후 방문하세요.
            </Text>
          </View>
        </View>

        {/* 요일 chip 컨테이너 — Figma 5:15641 흰 카드 + 그림자 */}
        <View style={styles.dayCard}>
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
        </View>

        {/* 요일별 안내 문구 — 슬롯 있는 요일에만 노출 (제약 강제, 외부에서 데이터 깨져도 방어) */}
        {dayNote && slots.length > 0 ? (
          <Text style={styles.dayNote}>{dayNote}</Text>
        ) : null}

        {/* 슬롯 영역 — 많으면 스크롤, 비어있어도 영역 유지 */}
        <ScrollView
          style={styles.slotsScroll}
          contentContainerStyle={
            slots.length === 0 ? styles.slotsEmptyWrap : styles.slotsWrap
          }
          showsVerticalScrollIndicator={false}
        >
          {slots.length === 0 ? (
            <Text style={styles.empty}>{selectedDay}요일에는 자유수영이 없습니다.</Text>
          ) : (
            slots.map((slot, i) => (
              <View key={i} style={styles.slotChip}>
                <Text style={styles.slotChipText}>
                  {slot.start} ~ {slot.end}
                </Text>
              </View>
            ))
          )}
        </ScrollView>

        {/* Figma 101:5902 — pd-blue 텍스트 + 렌치 아이콘, 보더/bg 없음 */}
        <Pressable
          onPress={() => {
            // 기존 시간표를 base로 draft 초기화 → 사용자가 수정 시작점으로
            if (schedule) {
              initFromSchedule(poolId, {
                byDay: schedule.byDay,
                dayNotes: schedule.dayNotes,
              });
            }
            navigation.navigate('ScheduleWrite', { poolId });
          }}
          style={({ pressed }) => [styles.editBtn, pressed && { opacity: 0.6 }]}
          accessibilityRole="button"
          accessibilityLabel="자유수영 시간표 수정 제안하기"
        >
          <IconWrench width={20} height={20} />
          <Text style={styles.editLabel}>자유수영 시간표 수정 제안하기</Text>
        </Pressable>
      </View>
    </ModalCard>
  );
}

// Figma 5:14289 card spec: 343×580 fixed
const CARD_H = 580;

interface DayChipProps {
  label: string;
  selected: boolean;
  hasSchedule: boolean;
  onPress: () => void;
}

function DayChip({ label, selected, hasSchedule, onPress }: DayChipProps) {
  // Figma 90:3396 4-state:
  // 1) no-schedule 비선택 (월/금/일): bg pd-blue 40%, pd-blue 글자, 보더 X
  // 2) no-schedule + selected (토): bg pd-blue 40%, pd-blue 글자, 1px pd-blue 보더
  // 3) has-schedule 비선택 (화/수): bg pd-mint, 흰 글자, 보더 X
  // 4) has-schedule + selected (목): bg pd-mint, pd-byellow 글자, 1px pd-blue 보더
  const containerStyle = [
    styles.dayChipBase,
    hasSchedule ? styles.dayChipActive : styles.dayChipMuted,
    selected && styles.dayChipSelectedRing,
  ];
  const labelStyle = !hasSchedule
    ? styles.dayChipLabelMuted
    : selected
      ? styles.dayChipLabelSelected
      : styles.dayChipLabelActive;
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

const DAY_CHIP_SIZE = 35;

const styles = StyleSheet.create({
  body: {
    flex: 1,
    gap: 16, // Figma 5:14290 gap-16
  },
  // Figma 5:15676 — header gap-24 (credit ↔ title block)
  headerBlock: {
    gap: 24,
  },
  // Figma 57:789 — title gap-5 (poolName ↔ notice)
  titleBlock: {
    gap: 5,
  },
  // Figma 5:15668 — parent SemiBold default, color ink900, right-aligned
  credit: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.06,
    color: tokens.color.ink900,
    textAlign: 'right',
  },
  creditPrefix: {
    fontFamily: tokens.font.sans, // Regular
  },
  creditNick: {
    fontFamily: tokens.font.sansSemibold, // 닉네임 강조
  },
  // Figma 57:787 — Bold 30/38 tracking -0.39 ink900
  poolName: {
    fontSize: 30,
    lineHeight: 38,
    letterSpacing: -0.39,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.ink900,
    textAlign: 'center',
  },
  // Figma 5:15673 — Regular 12/16 tracking -0.06 rgba(27,31,38,0.72)
  notice: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.06,
    fontFamily: tokens.font.sans,
    color: 'rgba(27, 31, 38, 0.72)',
    textAlign: 'center',
  },
  // Figma 5:15641 — 흰 카드 p-16 rounded-16 그림자.
  // Figma의 옅은 2겹 shadow (.02/.03)는 RN 단일 shadow + cream 페이지 위에서 거의 안 보임.
  // 영역 시각화를 위해 ink 베이스 0.08 alpha + offset 8/radius 16 + Android elevation 강화.
  dayCard: {
    backgroundColor: tokens.color.bgPaper,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  // Figma 5:15643 — size 35, rounded-full
  dayChipBase: {
    width: DAY_CHIP_SIZE,
    height: DAY_CHIP_SIZE,
    borderRadius: DAY_CHIP_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Figma 100:11384 — has-schedule: bg pd-mint
  dayChipActive: {
    backgroundColor: tokens.color.pdMint,
  },
  // Figma 100:11382 — no-schedule: bg pd-blue 40%
  dayChipMuted: {
    backgroundColor: 'rgba(104, 144, 203, 0.4)',
  },
  // Figma 100:11388/11392 — selected overlay: 1px pd-blue 보더 (bg는 hasSchedule 따라 다름)
  dayChipSelectedRing: {
    borderWidth: 1,
    borderColor: tokens.color.pdBlue,
  },
  // Medium 16/22 -0.112
  dayChipLabelSelected: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansMedium,
    color: tokens.color.pdByellow,
    textAlign: 'center',
  },
  dayChipLabelActive: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansMedium,
    color: tokens.color.white,
    textAlign: 'center',
  },
  dayChipLabelMuted: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansMedium,
    color: tokens.color.pdBlue,
    textAlign: 'center',
  },
  // 요일별 안내 문구 — Figma 90:3387, 가운데 정렬 작은 회색 텍스트
  dayNote: {
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: -0.06,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink500,
    textAlign: 'center',
  },
  slotsScroll: {
    flex: 1,
  },
  // Figma 5:14530 — flex-wrap gap-10
  slotsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  slotsEmptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Figma 90:3413 — 126×40 고정. border #cbd5e1 radius 12. 가운데 정렬.
  slotChip: {
    width: 126,
    height: 40,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Figma I5:15658;5588:20562 — SemiBold 14/20 tracking -0.084 #4b5563
  slotChipText: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansSemibold,
    color: '#4B5563',
  },
  empty: {
    ...tokens.text.bodySm,
    color: tokens.color.ink500,
    textAlign: 'center',
  },
  // Figma 101:5902 — gap-10, items-center, no border/bg, content-sized 가운데
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    alignSelf: 'center',
  },
  // SemiBold 16/22 -0.112 pd-blue
  editLabel: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.pdBlue,
  },
});
