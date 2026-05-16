// 수영 일정 추가 바텀시트 — Figma 122:6779(초기) / 122:7490(풀 드롭다운) /
// 122:8027(시간슬롯+공개범위) / 125:3342(완료).
//
// 수영장은 usePools, 시간 슬롯은 useSchedules(선택 풀+요일)에서 가져옴.
// 저장은 useSwimSchedules(로컬). 친구초대/공개범위 실동작은 Phase 2.

import React from 'react';
import {
  View, Text, StyleSheet, Pressable, Modal, Animated,
  Dimensions, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, Calendar as LucideCalendar, Mail } from 'lucide-react-native';
import { usePools } from '@/hooks/usePools';
import { useSchedules } from '@/hooks/useSchedules';
import {
  useSwimSchedules,
  dateKey,
  type ScheduleVisibility,
} from '@/store/swimSchedule';
import type { DayOfWeek, TimeSlot } from '@/types/schedule';
import {
  resolveSeasonSlots,
  isSeasonTransitionMonth,
} from '@/lib/seasonSchedule';
import {
  slotConflict,
  CONFLICT_LABEL,
  type SlotConflict,
} from '@/lib/scheduleConflict';
import { tokens } from '@/styles/tokens';
import { navigationRef } from '@/navigation/navigationRef';
import { MOCK_FRIENDS } from '@/lib/mockData';
import ScheduleCompleteIllust from '@assets/illustrations/schedule-complete.svg';
import { Tooltip } from '@/components/ui/Tooltip';
import { SheetCloseButton } from '@/components/ui/SheetCloseButton';
import { SearchSelect } from '@/components/ui/SearchSelect';
import { WeekCalendar } from './WeekCalendar';

const SCREEN_H = Dimensions.get('window').height;
const DOW: DayOfWeek[] = ['일', '월', '화', '수', '목', '금', '토'];

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function toMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}
/** 선택일이 오늘이면 이미 시작 시각이 지난 슬롯 제거(과거 시간대 등록 불가). */
function filterFutureToday(list: TimeSlot[], date: Date): TimeSlot[] {
  const now = new Date();
  if (!isSameDay(date, now)) return list;
  const cut = now.getHours() * 60 + now.getMinutes();
  return list.filter((s) => toMinutes(s.start) > cut);
}

const VIS_OPTIONS: { value: ScheduleVisibility; label: string }[] = [
  { value: 'private', label: '비공개' },
  { value: 'friends', label: '친구에게만 공개' },
  { value: 'public', label: '전체 공개' },
];

export function AddScheduleSheet({
  visible,
  onClose,
  initialPoolId,
  initialDate,
  initialStart,
  initialEnd,
}: {
  visible: boolean;
  onClose: () => void;
  /** 시간표 더블탭 진입 시 프리필 — 없으면 빈 상태(수동 추가). */
  initialPoolId?: string;
  initialDate?: Date;
  /** 더블탭한 슬롯 타임 — 해당 타임을 기본 선택(시즌/날짜 해석 후 일치 시). */
  initialStart?: string;
  initialEnd?: string;
}) {
  const { data: pools = [] } = usePools();
  const { data: schedules = [] } = useSchedules();
  const addSchedule = useSwimSchedules((s) => s.add);
  const mySchedules = useSwimSchedules((s) => s.schedules);

  // 일정 공유 기본값 = 가장 최근 등록 일정의 공개범위(없으면 비공개).
  const defaultVisibility = React.useMemo<ScheduleVisibility>(() => {
    if (mySchedules.length === 0) return 'private';
    return mySchedules.reduce((a, b) =>
      a.createdAt >= b.createdAt ? a : b,
    ).visibility;
  }, [mySchedules]);

  const slideY = React.useRef(new Animated.Value(SCREEN_H)).current;
  const [phase, setPhase] = React.useState<'form' | 'done'>('form');
  // 수영장 콤보박스(SearchSelect)는 자체적으로 열림/검색 상태 보유 —
  // 시트가 닫힘→열림 전환될 때 key를 바꿔 remount(닫힘·검색어 초기화).
  const [comboKey, setComboKey] = React.useState(0);
  const [poolId, setPoolId] = React.useState<string | null>(null);
  const [date, setDate] = React.useState(new Date());
  const [slotIdx, setSlotIdx] = React.useState<number | null>(null);
  const [visibility, setVisibility] = React.useState<ScheduleVisibility>('private');

  // 충돌 슬롯 탭 시 5초 툴팁 (tipIdx = 해당 슬롯 인덱스).
  const [tipIdx, setTipIdx] = React.useState<number | null>(null);
  const [tipText, setTipText] = React.useState('');
  const tipTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const showTip = React.useCallback((idx: number, text: string) => {
    setTipIdx(idx);
    setTipText(text);
    if (tipTimer.current) clearTimeout(tipTimer.current);
    tipTimer.current = setTimeout(() => setTipIdx(null), 5000);
  }, []);
  const clearTip = React.useCallback(() => {
    if (tipTimer.current) clearTimeout(tipTimer.current);
    setTipIdx(null);
  }, []);
  React.useEffect(
    () => () => {
      if (tipTimer.current) clearTimeout(tipTimer.current);
    },
    [],
  );

  // 시트가 닫힘→열림으로 "전환될 때만" 1회 초기화. openedRef 가드로
  // 열린 상태에서 prefill/schedules 등이 바뀌어도 사용자 입력을 안 덮어씀.
  const openedRef = React.useRef(false);
  React.useEffect(() => {
    if (visible && !openedRef.current) {
      openedRef.current = true;
      setPhase('form');
      setComboKey((k) => k + 1);
      const pid = initialPoolId ?? null;
      const dt = initialDate ?? new Date();
      setPoolId(pid);
      setDate(dt);
      // 더블탭으로 넘어온 타임이면 그 날짜의 시즌 해석된 슬롯 목록에서
      // start·end 일치 항목을 기본 선택. 없으면 미선택(수동 추가 포함).
      // 단, 시즌 전환 직전 달(KBS=5·9월)에는 기본 선택 없이 —
      // 두 시즌이 겹치는 시기라 사용자가 한 번 더 생각하고 직접 고르게.
      let idx: number | null = null;
      if (pid && initialStart && initialEnd) {
        const sch = schedules.find((s) => s.poolId === pid);
        const dow = DOW[dt.getDay()];
        const transition = isSeasonTransitionMonth(
          sch?.slotGroups?.[dow],
          dt.getMonth() + 1,
        );
        if (!transition) {
          const resolved = filterFutureToday(
            resolveSeasonSlots(sch, dow, dt),
            dt,
          );
          const i = resolved.findIndex(
            (s) => s.start === initialStart && s.end === initialEnd,
          );
          // 충돌(이미 등록/중복) 슬롯이면 자동 선택하지 않음.
          if (
            i >= 0 &&
            !slotConflict(mySchedules, {
              poolId: pid,
              date: dateKey(dt),
              start: initialStart,
              end: initialEnd,
            })
          ) {
            idx = i;
          }
        }
      }
      setSlotIdx(idx);
      setTipIdx(null);
      setVisibility(defaultVisibility);
      Animated.timing(slideY, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }).start();
    } else if (!visible && openedRef.current) {
      openedRef.current = false;
      slideY.setValue(SCREEN_H);
    }
  }, [
    visible,
    slideY,
    initialPoolId,
    initialDate,
    initialStart,
    initialEnd,
    schedules,
    mySchedules,
    defaultVisibility,
  ]);

  const close = () => {
    Animated.timing(slideY, {
      toValue: SCREEN_H,
      duration: 220,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  // 친구가 0명이면 "이 일정에 친구 초대하기" 미노출 (Figma 125:3342).
  const hasFriends = MOCK_FRIENDS.length > 0;
  // 방금 등록한 일정 스냅샷(초대 화면에 넘길 확정 일정 정보).
  const submittedRef = React.useRef<{
    poolName: string;
    poolPhotoUrl?: string;
    date: string;
    start: string;
  } | null>(null);
  // 전역 시트는 NavigationContainer 바깥 → useNavigation 불가, ref로 이동.
  const goInviteFriends = () => {
    const s = submittedRef.current;
    if (s && navigationRef.isReady()) {
      navigationRef.navigate('InviteFriends', s);
    }
    close();
  };

  // 등록 가능 날짜 범위: 오늘 ~ +90일 (과거·먼 미래 차단).
  const calMin = React.useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const calMax = React.useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 90);
    return d;
  }, []);

  const selectedPool = pools.find((p) => p.id === poolId) ?? null;
  const dow = DOW[date.getDay()];
  const schedule = poolId
    ? schedules.find((s) => s.poolId === poolId)
    : undefined;
  // 오늘이면 이미 지난 시간대 슬롯은 미노출(등록 불가).
  const slots: TimeSlot[] = filterFutureToday(
    resolveSeasonSlots(schedule, dow, date),
    date,
  );

  const canAdd = !!selectedPool && slotIdx !== null;

  const onSubmit = async () => {
    if (!selectedPool || slotIdx === null) return;
    const slot = slots[slotIdx];
    // 로컬 require(number)는 영속 저장 무의미 — 원격 {uri} 일 때만 URL 보관.
    const photoUrl =
      selectedPool.photoUrl && typeof selectedPool.photoUrl === 'object'
        ? selectedPool.photoUrl.uri
        : undefined;
    await addSchedule({
      poolId: selectedPool.id,
      poolName: selectedPool.name,
      poolPhotoUrl: photoUrl,
      date: dateKey(date),
      start: slot.start,
      end: slot.end,
      visibility,
    });
    submittedRef.current = {
      poolName: selectedPool.name,
      poolPhotoUrl: photoUrl,
      date: dateKey(date),
      start: slot.start,
    };
    setPhase('done');
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={close}>
      {phase === 'done' ? (
        /* Figma 125:3342 — 중앙 정렬 축하 카드(바텀시트 아님) */
        <View style={styles.doneRoot}>
          <Pressable onPress={close} style={styles.backdrop} />
          <View style={styles.doneCard}>
            <View style={styles.doneIllustWrap}>
              <ScheduleCompleteIllust width={311} height={228} />
            </View>
            <View style={styles.doneTextBlock}>
              <Text style={styles.doneTitle}>수영 일정 등록</Text>
              <Text style={styles.doneSub}>
                즐거운 수영 일정이 등록되었습니다.
              </Text>
            </View>
            {/* Figma 150:5947 — 버튼 그룹 col gap-24 */}
            <View style={styles.doneActions}>
              <Pressable
                onPress={close}
                style={({ pressed }) => [
                  styles.doneBtn,
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text style={styles.doneBtnLabel}>알겠습니다</Text>
                <Check size={20} color={tokens.color.black} strokeWidth={2.4} />
              </Pressable>
              {/* Figma 150:5949 — 친구 0명이면 미노출 */}
              {hasFriends ? (
                <Pressable
                  onPress={goInviteFriends}
                  style={({ pressed }) => [
                    styles.inviteBtn,
                    pressed && { opacity: 0.6 },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="이 일정에 친구 초대하기"
                >
                  {/* Figma 150:5949 — line 스타일 편지 아이콘, 라벨과 동일 pd-blue */}
                  <Mail size={20} color={tokens.color.pdBlue} strokeWidth={2} />
                  <Text style={styles.inviteLabel}>
                    이 일정에 친구 초대하기
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.root}>
          <Pressable onPress={close} style={styles.backdrop} />
          <Animated.View
            style={[styles.sheetWrap, { transform: [{ translateY: slideY }] }]}
          >
            <SafeAreaView edges={['bottom']}>
              <View style={styles.handleWrap}>
                <View style={styles.handle} />
              </View>

              <View style={styles.sheet}>
                <View style={styles.titleRow}>
                  <Text style={styles.title}>수영 일정 추가</Text>
                  <SheetCloseButton onPress={close} />
                </View>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="always"
                  style={styles.body}
                >
                  {/* 수영장 드롭다운 — 공통 SearchSelect(검색+float 리스트).
                      시트 닫힘→열림 시 comboKey 변경으로 remount(상태 초기화). */}
                  <Text style={styles.fieldLabel}>수영장</Text>
                  <SearchSelect
                    key={comboKey}
                    items={pools}
                    value={selectedPool}
                    onChange={(p) => {
                      setPoolId(p.id);
                      setSlotIdx(null);
                    }}
                    keyOf={(p) => p.id}
                    labelOf={(p) => p.name}
                    placeholder="수영장 이름"
                  />

                  {/* Figma 122:8031 — 캘린더 위 "시간표" 섹션 라벨 */}
                  <Text style={[styles.fieldLabel, { marginTop: 24 }]}>
                    시간표
                  </Text>
                  <WeekCalendar
                    selectedDate={date}
                    onSelectDate={(d) => {
                      setDate(d);
                      setSlotIdx(null);
                      clearTip();
                    }}
                    minDate={calMin}
                    maxDate={calMax}
                    headerDivider
                  />

                  {/* 시간 슬롯 — 영역 높이 고정(슬롯 수·풀 선택 여부와 무관)
                      → 시트 전체 높이 불변. 충돌 슬롯은 비활성+탭 시 5초 툴팁.
                      ScrollView 미사용(툴팁 클리핑 회피, 슬롯 수 적음). */}
                  <View style={styles.slotSection}>
                    {!selectedPool ? (
                      <View style={styles.slotHintWrap}>
                        <Text style={styles.emptyText}>
                          수영장을 선택하면 시간표가 표시됩니다.
                        </Text>
                      </View>
                    ) : slots.length > 0 ? (
                      <View style={styles.slotGrid}>
                        {slots.map((s, i) => {
                          const conflict: SlotConflict = slotConflict(
                            mySchedules,
                            {
                              poolId: selectedPool.id,
                              date: dateKey(date),
                              start: s.start,
                              end: s.end,
                            },
                          );
                          const sel = i === slotIdx && !conflict;
                          return (
                            <Pressable
                              key={`${s.start}-${s.end}-${i}`}
                              onPress={() => {
                                if (conflict) {
                                  showTip(i, CONFLICT_LABEL[conflict]);
                                  return;
                                }
                                clearTip();
                                setSlotIdx(i);
                              }}
                              style={[
                                styles.slot,
                                conflict === 'duplicate' && styles.slotDup,
                                conflict === 'overlap' && styles.slotOverlap,
                                sel && styles.slotSelected,
                              ]}
                            >
                              {tipIdx === i ? (
                                <Tooltip
                                  label={tipText}
                                  style={styles.slotTip}
                                />
                              ) : null}
                              <Text
                                style={[
                                  styles.slotText,
                                  conflict && styles.slotTextDisabled,
                                  sel && styles.slotTextSelected,
                                ]}
                              >
                                {s.start} ~ {s.end}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    ) : (
                      <View style={styles.slotHintWrap}>
                        <Text style={styles.emptyText}>
                          선택한 날짜에 지금 신청 가능한 타임이 없습니다.
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* 일정 공유 — Figma 125:3802: Bold #1F2937 (수영장/시간표보다 진함) */}
                  <Text style={[styles.shareLabel, { marginTop: 24 }]}>
                    일정 공유
                  </Text>
                  <View style={styles.radioRow}>
                    {VIS_OPTIONS.map((o) => {
                      const sel = visibility === o.value;
                      return (
                        <Pressable
                          key={o.value}
                          onPress={() => setVisibility(o.value)}
                          style={styles.radioItem}
                        >
                          <View
                            style={[styles.radio, sel && styles.radioSelected]}
                          >
                            {sel && <View style={styles.radioDot} />}
                          </View>
                          <Text style={styles.radioLabel}>{o.label}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </ScrollView>

                <Pressable
                  onPress={onSubmit}
                  disabled={!canAdd}
                  style={({ pressed }) => [
                    styles.cta,
                    !canAdd && styles.ctaDisabled,
                    pressed && canAdd && { opacity: 0.85 },
                  ]}
                >
                  <Text
                    style={[
                      styles.ctaLabel,
                      !canAdd && styles.ctaLabelDisabled,
                    ]}
                  >
                    수영 일정 추가
                  </Text>
                  <LucideCalendar
                    size={20}
                    color={canAdd ? tokens.color.black : tokens.color.pdGray}
                    strokeWidth={2}
                  />
                </Pressable>
              </View>
            </SafeAreaView>
          </Animated.View>
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  sheetWrap: {
    backgroundColor: tokens.color.bgPaper,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: SCREEN_H * 0.9,
    ...tokens.shadow.pop,
  },
  handleWrap: { paddingTop: 12, alignItems: 'center' },
  handle: { width: 64, height: 5, borderRadius: 1234, backgroundColor: '#E2E8F0' },
  // 하단 버튼 ~ 시트 하단: DS 원칙 24px(+ safe-area). BottomSheet 공통과 일치.
  sheet: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 24, gap: 16 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.144,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.ink900,
  },
  body: { maxHeight: SCREEN_H * 0.62 },

  // Figma 122:7490/122:8031 — 수영장·시간표 라벨: SemiBold 14/20 -0.084 #4B5563
  fieldLabel: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansSemibold,
    color: '#4B5563',
    marginBottom: 8,
  },
  // Figma 125:3802 — 일정 공유 라벨만 Bold 14/20 -0.084 #1F2937 (더 진함)
  shareLabel: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansBold,
    color: '#1F2937',
    marginBottom: 8,
  },
  // 슬롯 안내 문구(수영장/날짜 미선택 등) — Figma 5544:288 톤.
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink500,
    textAlign: 'center',
    paddingVertical: 16,
  },


  // 높이 고정(슬롯 ~3행 기준) → 시트 전체 높이 불변. 넘치면 내부 스크롤.
  slotSection: { marginTop: 16, height: 156 },
  slotScroll: { flex: 1 },
  slotHintWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slot: {
    width: '48%',
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    backgroundColor: tokens.color.white,
  },
  slotSelected: {
    backgroundColor: tokens.color.pdMint,
    borderColor: tokens.color.pdMint,
  },
  // Figma 122:8215 — 이미 등록한 일정: pd-blue 채움
  slotDup: {
    backgroundColor: tokens.color.pdBlue,
    borderColor: tokens.color.pdBlue,
  },
  // Figma 122:8225 — 다른 일정과 중복: pd-gray 채움
  slotOverlap: {
    backgroundColor: tokens.color.pdGray,
    borderColor: tokens.color.pdGray,
  },
  slotText: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: tokens.font.sansMedium,
    color: tokens.color.ink900,
  },
  slotTextSelected: { color: tokens.color.white },
  // Figma — 충돌 슬롯 텍스트 pd-bgray
  slotTextDisabled: { color: tokens.color.pdBgray },
  // 슬롯 위 absolute 툴팁(아래 화살표가 슬롯 상단을 가리킴)
  slotTip: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    right: 0,
    zIndex: 50,
    // 버튼에 2px 더 가깝게 (툴팁이 너무 높던 것 보정).
    transform: [{ translateY: 2 }],
  },

  radioRow: { flexDirection: 'row', gap: 20 },
  radioItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: tokens.color.pdMint },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: tokens.color.pdMint,
  },
  radioLabel: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink900,
  },

  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 48,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: tokens.color.pdByellow,
    marginTop: 8,
  },
  ctaDisabled: { backgroundColor: tokens.color.pdBgray },
  ctaLabel: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.black,
  },
  ctaLabelDisabled: { color: tokens.color.pdGray },

  // Figma 125:3342 — 중앙 정렬 축하 모달
  doneRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  // Figma 125:3343 — 흰 카드 w343 r32 p16, 섹션 gap 32
  doneCard: {
    width: '100%',
    maxWidth: 343,
    backgroundColor: tokens.color.white,
    borderRadius: 32,
    padding: 16,
    gap: 32,
    alignItems: 'center',
    overflow: 'hidden',
    ...tokens.shadow.pop,
  },
  // Figma 125:3484 — 일러스트 프레임 h228, 전체폭
  doneIllustWrap: {
    width: '100%',
    height: 228,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  // Figma 125:3767 — 타이틀/서브 gap 16, 가운데
  doneTextBlock: { width: '100%', alignItems: 'center', gap: 16 },
  // Figma 125:3768 — Bold 24/32 -0.288 #1F2937
  doneTitle: {
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.288,
    fontFamily: tokens.font.sansBold,
    color: '#1F2937',
    textAlign: 'center',
  },
  // Figma 125:3769 — Regular 16/26(1.6) #4B5563
  doneSub: {
    fontSize: 16,
    lineHeight: 26,
    fontFamily: tokens.font.sans,
    color: '#4B5563',
    textAlign: 'center',
  },
  // Figma 125:3773 — 풀폭 byellow 버튼 r14 minH48 px20 py12 gap10
  doneBtn: {
    flexDirection: 'row',
    width: '100%',
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: tokens.color.pdByellow,
  },
  // Figma I125:3773;5588:18178 — SemiBold 16/22 -0.112 black
  doneBtnLabel: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.black,
  },
  // Figma 150:5947 — 버튼 그룹: 전체폭 세로 gap 24, 가운데
  doneActions: { width: '100%', alignItems: 'center', gap: 24 },
  // Figma 150:5949 — 아이콘 20 + 텍스트, gap 8, 가운데 (보더/bg 없음)
  inviteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  // Figma I150:5949;5603:17351 — SemiBold 14/20 -0.084 pd-blue
  inviteLabel: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.pdBlue,
  },
});
