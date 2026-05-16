// 수영 일정 추가 바텀시트 — Figma 122:6779(초기) / 122:7490(풀 드롭다운) /
// 122:8027(시간슬롯+공개범위) / 125:3342(완료).
//
// 수영장은 usePools, 시간 슬롯은 useSchedules(선택 풀+요일)에서 가져옴.
// 저장은 useSwimSchedules(로컬). 친구초대/공개범위 실동작은 Phase 2.

import React from 'react';
import {
  View, Text, TextInput, StyleSheet, Pressable, Modal, Animated,
  Dimensions, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Check, Calendar as LucideCalendar, XCircle } from 'lucide-react-native';
import IconChevronDown from '@assets/icons/chevron-down.svg';
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
import { tokens } from '@/styles/tokens';
import RequestCompleteIllust from '@assets/illustrations/request-complete.svg';
import { WeekCalendar } from './WeekCalendar';

const SCREEN_H = Dimensions.get('window').height;
const DOW: DayOfWeek[] = ['일', '월', '화', '수', '목', '금', '토'];

const VIS_OPTIONS: { value: ScheduleVisibility; label: string }[] = [
  { value: 'private', label: '비공개' },
  { value: 'friends', label: '친구만' },
  { value: 'public', label: '전부 공개' },
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
  const [poolOpen, setPoolOpen] = React.useState(false);
  const [poolQuery, setPoolQuery] = React.useState('');
  const [poolId, setPoolId] = React.useState<string | null>(null);
  const [date, setDate] = React.useState(new Date());
  const [slotIdx, setSlotIdx] = React.useState<number | null>(null);
  const [visibility, setVisibility] = React.useState<ScheduleVisibility>('private');

  // 시트가 닫힘→열림으로 "전환될 때만" 1회 초기화. openedRef 가드로
  // 열린 상태에서 prefill/schedules 등이 바뀌어도 사용자 입력을 안 덮어씀.
  const openedRef = React.useRef(false);
  React.useEffect(() => {
    if (visible && !openedRef.current) {
      openedRef.current = true;
      setPhase('form');
      setPoolOpen(false);
      setPoolQuery('');
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
          const resolved = resolveSeasonSlots(sch, dow, dt);
          const i = resolved.findIndex(
            (s) => s.start === initialStart && s.end === initialEnd,
          );
          idx = i >= 0 ? i : null;
        }
      }
      setSlotIdx(idx);
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
    defaultVisibility,
  ]);

  const close = () => {
    Animated.timing(slideY, {
      toValue: SCREEN_H,
      duration: 220,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  // 수영장 선택을 강조: 검색 열렸을 땐 다른 곳을 눌러도 포커스를 풀지
  // 않는다(아래 ScrollView keyboardShouldPersistTaps="always"). 포커스는
  // 리스트에서 풀을 "선택"했을 때만 풀림(선택 시 poolOpen=false → 입력 unmount).

  const selectedPool = pools.find((p) => p.id === poolId) ?? null;
  const dow = DOW[date.getDay()];
  const schedule = poolId
    ? schedules.find((s) => s.poolId === poolId)
    : undefined;
  const slots: TimeSlot[] = resolveSeasonSlots(schedule, dow, date);

  const filteredPools = poolQuery.trim()
    ? pools.filter((p) => p.name.includes(poolQuery.trim()))
    : pools;

  const canAdd = !!selectedPool && slotIdx !== null;

  const onSubmit = async () => {
    if (!selectedPool || slotIdx === null) return;
    const slot = slots[slotIdx];
    await addSchedule({
      poolId: selectedPool.id,
      poolName: selectedPool.name,
      // 로컬 require(number)는 영속 저장 무의미 — 원격 {uri} 일 때만 URL 보관.
      poolPhotoUrl:
        selectedPool.photoUrl && typeof selectedPool.photoUrl === 'object'
          ? selectedPool.photoUrl.uri
          : undefined,
      date: dateKey(date),
      start: slot.start,
      end: slot.end,
      visibility,
    });
    setPhase('done');
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={close}>
      <View style={styles.root}>
        <Pressable onPress={close} style={styles.backdrop} />
        <Animated.View
          style={[styles.sheetWrap, { transform: [{ translateY: slideY }] }]}
        >
          <SafeAreaView edges={['bottom']}>
            <View style={styles.handleWrap}>
              <View style={styles.handle} />
            </View>

            {phase === 'done' ? (
              <DoneView onClose={close} />
            ) : (
              <View style={styles.sheet}>
                <View style={styles.titleRow}>
                  <Text style={styles.title}>수영 일정 등록</Text>
                  <Pressable onPress={close} hitSlop={8}>
                    <X size={24} color={tokens.color.ink900} strokeWidth={1.5} />
                  </Pressable>
                </View>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="always"
                  style={styles.body}
                >
                  {/* 수영장 드롭다운 */}
                  <Text style={styles.fieldLabel}>수영장</Text>
                  {/* Figma 122:7490 — 트리거는 항상 흐름에 고정,
                      검색+리스트 카드는 absolute float로 위에 겹쳐 노출
                      (자동완성이 레이아웃을 밀지 않음 → 시트 높이 불변). */}
                  <View style={styles.dropdownAnchor}>
                    <Pressable
                      onPress={() => setPoolOpen((v) => !v)}
                      style={styles.dropdown}
                    >
                      <Text
                        style={[
                          styles.dropdownText,
                          !selectedPool && styles.dropdownPlaceholder,
                        ]}
                        numberOfLines={1}
                      >
                        {selectedPool ? selectedPool.name : '수영장 이름'}
                      </Text>
                      <IconChevronDown width={20} height={20} />
                    </Pressable>

                    {poolOpen ? (
                      <View style={styles.dropdownFloat}>
                        <View style={styles.dropdownList}>
                          <View style={styles.searchBox}>
                            {/* RN Android는 TextInput placeholder에 커스텀
                                폰트 미적용 → 빈 값일 때 Text 오버레이로 고정 */}
                            <View style={styles.searchInputWrap}>
                              <TextInput
                                value={poolQuery}
                                onChangeText={setPoolQuery}
                                style={styles.searchInput}
                              />
                              {poolQuery.length === 0 ? (
                                <Text
                                  style={styles.searchPlaceholder}
                                  pointerEvents="none"
                                >
                                  수영장 이름
                                </Text>
                              ) : null}
                            </View>
                            {/* Figma 147:5413 — 입력값 있을 때만 clear 노출 */}
                            {poolQuery.length > 0 ? (
                              <Pressable
                                onPress={() => setPoolQuery('')}
                                hitSlop={8}
                                accessibilityRole="button"
                                accessibilityLabel="검색어 지우기"
                              >
                                <XCircle
                                  size={20}
                                  color="#94A3B8"
                                  strokeWidth={2}
                                />
                              </Pressable>
                            ) : null}
                          </View>
                          <ScrollView
                            style={styles.optionScroll}
                            contentContainerStyle={styles.optionListContent}
                            nestedScrollEnabled
                            keyboardShouldPersistTaps="always"
                          >
                            {filteredPools.map((p) => (
                              <Pressable
                                key={p.id}
                                onPress={() => {
                                  setPoolId(p.id);
                                  setSlotIdx(null);
                                  setPoolOpen(false);
                                }}
                                style={styles.optionItem}
                              >
                                <Text
                                  style={styles.optionText}
                                  numberOfLines={1}
                                >
                                  {p.name}
                                </Text>
                              </Pressable>
                            ))}
                            {filteredPools.length === 0 && (
                              <Text style={styles.emptyText}>
                                검색 결과가 없어요.
                              </Text>
                            )}
                          </ScrollView>
                        </View>
                      </View>
                    ) : null}
                  </View>

                  <View style={styles.calSpacer} />
                  <WeekCalendar
                    selectedDate={date}
                    onSelectDate={(d) => {
                      setDate(d);
                      setSlotIdx(null);
                    }}
                  />

                  {/* 시간 슬롯 — 영역 높이 고정(슬롯 수·풀 선택 여부와 무관)
                      → 시트 전체 높이 불변. 넘치면 내부 스크롤, 비면 중앙 안내. */}
                  <View style={styles.slotSection}>
                    {!selectedPool ? (
                      <View style={styles.slotHintWrap}>
                        <Text style={styles.emptyText}>
                          수영장을 선택하면 시간표가 표시됩니다.
                        </Text>
                      </View>
                    ) : slots.length > 0 ? (
                      <ScrollView
                        style={styles.slotScroll}
                        showsVerticalScrollIndicator={false}
                        nestedScrollEnabled
                        keyboardShouldPersistTaps="always"
                      >
                        <View style={styles.slotGrid}>
                          {slots.map((s, i) => {
                            const sel = i === slotIdx;
                            return (
                              <Pressable
                                key={`${s.start}-${s.end}-${i}`}
                                onPress={() => setSlotIdx(i)}
                                style={[
                                  styles.slot,
                                  sel && styles.slotSelected,
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.slotText,
                                    sel && styles.slotTextSelected,
                                  ]}
                                >
                                  {s.start} ~ {s.end}
                                </Text>
                              </Pressable>
                            );
                          })}
                        </View>
                      </ScrollView>
                    ) : (
                      <View style={styles.slotHintWrap}>
                        <Text style={styles.emptyText}>
                          선택한 날짜에 등록된 자유수영 시간표가 없어요.
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* 일정 공유 */}
                  <Text style={[styles.fieldLabel, { marginTop: 24 }]}>
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
            )}
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

function DoneView({ onClose }: { onClose: () => void }) {
  return (
    <View style={styles.doneWrap}>
      <RequestCompleteIllust width={240} height={200} />
      <View style={styles.doneTextBlock}>
        <Text style={styles.doneTitle}>수영 일정 등록</Text>
        <Text style={styles.doneSub}>즐거운 수영 일정이 등록되었습니다.</Text>
      </View>
      <Pressable
        onPress={onClose}
        style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}
      >
        <Text style={styles.ctaLabel}>알겠습니다</Text>
        <Check size={20} color={tokens.color.black} strokeWidth={2.4} />
      </Pressable>
    </View>
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
  sheet: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 16, gap: 16 },
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

  fieldLabel: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.ink900,
    marginBottom: 8,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    backgroundColor: tokens.color.white,
  },
  dropdownText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink900,
  },
  dropdownPlaceholder: { color: tokens.color.ink400 },
  // 트리거를 감싸는 relative 앵커. zIndex로 이후 형제(캘린더/슬롯) 위.
  dropdownAnchor: { position: 'relative', zIndex: 20 },
  // 검색+리스트 카드: 트리거 바로 아래 absolute float (레이아웃 미점유 → 시트 높이 불변).
  dropdownFloat: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 30,
    elevation: 30,
  },
  // Figma I122:7490;5626:22412 — 흰 카드, border #E2E8F0, r24, p8, gap4, Shadow/lg
  dropdownList: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 24,
    backgroundColor: tokens.color.white,
    padding: 8,
    gap: 4,
    ...tokens.shadow.lg,
  },
  // Figma 5626:22413 — 검색칸: bg #F8FAFC, 알약(rounded-full), minH40, p8, 아이콘 없음
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 40,
    padding: 8,
    borderRadius: 9999,
    backgroundColor: '#F8FAFC',
  },
  searchInputWrap: { flex: 1, justifyContent: 'center' },
  // Figma 5626:21974 — Medium 16/22 -0.112 #4B5563
  searchInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansMedium,
    color: '#4B5563',
    padding: 0,
  },
  // RN Android placeholder 커스텀 폰트 미적용 회피 — 빈 값 시 Text 오버레이.
  searchPlaceholder: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    textAlignVertical: 'center',
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansMedium,
    color: '#4B5563',
    includeFontPadding: false,
  },
  optionScroll: { maxHeight: 240 },
  optionListContent: { gap: 4 },
  // Figma 5626:22473 — 아이템: 알약, minH40, p8 (선택 시 강조는 Phase 2)
  optionItem: {
    minHeight: 40,
    padding: 8,
    borderRadius: 9999,
    justifyContent: 'center',
  },
  // Figma 5544:288 — Medium 16/22 -0.112 #4B5563
  optionText: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansMedium,
    color: '#4B5563',
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink500,
    textAlign: 'center',
    paddingVertical: 16,
  },

  calSpacer: { height: 16 },

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
  slotText: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: tokens.font.sansMedium,
    color: tokens.color.ink900,
  },
  slotTextSelected: { color: tokens.color.white },

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

  doneWrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    alignItems: 'center',
    gap: 24,
  },
  doneTextBlock: { alignItems: 'center', gap: 12 },
  doneTitle: {
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.24,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.ink900,
  },
  doneSub: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink500,
    textAlign: 'center',
  },
});
