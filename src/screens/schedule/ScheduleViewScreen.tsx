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
import { dateKey } from '@/store/swimSchedule';
import { useAddScheduleIntent } from '@/store/addScheduleIntent';
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
  const groups = schedule?.slotGroups?.[selectedDay];
  const hasGroups = !!groups && groups.length > 0;

  // 칩 2열을 슬롯 영역 폭에 "딱 맞게" — 영역폭 실측 후
  // 칩폭 = floor((영역폭 − 가운데여백) / 2). floor로 합이 영역폭을
  // 넘지 않게 해 1열로 무너지는 것 방지. 가운데 여백은 Figma 10 유지.
  const SLOT_GAP = 10;
  const [slotAreaW, setSlotAreaW] = React.useState(0);
  const chipW =
    slotAreaW > 0 ? Math.floor((slotAreaW - SLOT_GAP) / 2) : 146;

  const setIntent = useAddScheduleIntent((s) => s.setIntent);
  const lastTapRef = React.useRef<{ key: string; t: number } | null>(null);

  // 요일 → 다음 발생일(오늘이 그 요일이면 오늘). JS getDay: 일=0..토=6.
  const nextDateForWeekday = (day: DayOfWeek): Date => {
    const idx: Record<DayOfWeek, number> = {
      일: 0, 월: 1, 화: 2, 수: 3, 목: 4, 금: 5, 토: 6,
    };
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + ((idx[day] - d.getDay() + 7) % 7));
    return d;
  };

  // 더블탭 → 풀+날짜만 잡아 의도 set 후 시간표 모달만 닫는다.
  // 화면 이동 없음 — 루트의 GlobalAddScheduleSheet가 의도를 소비해 그 자리에서
  // 등록 시트를 띄움. 타임은 시트에서 날짜(시즌)에 맞춰 다시 고름(KBS 등 일관).
  const openRegister = () => {
    if (!pool) return;
    const d = nextDateForWeekday(selectedDay);
    setIntent({ poolId, date: dateKey(d) });
    navigation.goBack(); // 시간표 모달만 닫음 (지도 등 현재 화면 유지)
  };

  // 빠르게 두 번 탭(같은 슬롯, 300ms 내) → 등록 플로우 진입.
  const onSlotTap = (key: string) => {
    const now = Date.now();
    const last = lastTapRef.current;
    if (last && last.key === key && now - last.t < 300) {
      lastTapRef.current = null;
      openRegister();
    } else {
      lastTapRef.current = { key, t: now };
    }
  };

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
              {'타임을 빠르게 두 번 터치하면 일정으로 등록할 수 있습니다.\n자유수영 시간표는 참고용이니, 꼭 문의 후 방문하세요.'}
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
          onLayout={(e) => setSlotAreaW(e.nativeEvent.layout.width)}
          contentContainerStyle={
            slots.length === 0 && !hasGroups
              ? styles.slotsEmptyWrap
              : hasGroups
                ? styles.slotGroupsWrap
                : styles.slotsWrap
          }
          showsVerticalScrollIndicator={false}
        >
          {slots.length === 0 && !hasGroups ? (
            <Text style={styles.empty}>{selectedDay}요일에는 자유수영이 없습니다.</Text>
          ) : hasGroups ? (
            (groups ?? []).map((g, gi) => (
              <View key={gi} style={styles.slotGroup}>
                {g.label ? (
                  <Text style={styles.groupLabel}>{g.label}</Text>
                ) : null}
                <View style={styles.slotsWrap}>
                  {g.slots.map((slot, i) => (
                    <Pressable
                      key={i}
                      onPress={() => onSlotTap(`${selectedDay}-g${gi}-${i}`)}
                      style={({ pressed }) => [
                        styles.slotChip,
                        { width: chipW },
                        pressed && styles.slotChipPressed,
                      ]}
                    >
                      <Text style={styles.slotChipText} numberOfLines={1}>
                        {slot.start} ~ {slot.end}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ))
          ) : (
            slots.map((slot, i) => (
              <Pressable
                key={i}
                onPress={() => onSlotTap(`${selectedDay}-${i}`)}
                style={({ pressed }) => [
                  styles.slotChip,
                  { width: chipW },
                  pressed && styles.slotChipPressed,
                ]}
              >
                <Text style={styles.slotChipText} numberOfLines={1}>
                  {slot.start} ~ {slot.end}
                </Text>
              </Pressable>
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
  // Figma 144:3610 — flex-wrap gap-10, items-start
  slotsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    alignItems: 'flex-start',
  },
  slotsEmptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Figma 144:3611 — 2열(폭은 영역 실측으로 동적 계산), border #cbd5e1 r12, px16 py10, 중앙 정렬
  slotChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  // Figma I5:15658;5588:20562 — SemiBold 14/20 tracking -0.084 #4b5563
  slotChipText: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansSemibold,
    color: '#4B5563',
  },
  slotChipPressed: { opacity: 0.6 },
  // Figma 144:3796 — 계절/변형 그룹 간 세로 gap 20
  slotGroupsWrap: {
    gap: 20,
  },
  // Figma 144:3744 — 그룹: 캡션(전체폭) + 칩 wrap, 사이 gap 10
  slotGroup: {
    width: '100%',
    gap: 10,
  },
  // Figma 144:3778 — Regular 12/16 tracking -0.06, rgba(27,31,38,0.72)
  groupLabel: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.06,
    fontFamily: tokens.font.sans,
    color: 'rgba(27, 31, 38, 0.72)',
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
