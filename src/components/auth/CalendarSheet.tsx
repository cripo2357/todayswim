// Figma 110:3753 — 달력 picker 바텀시트 (생년월일 선택용).
// 110:3764 연/월 휠 (월 헤더 탭하면 변경 가능).

import React from 'react';
import {
  View, Text, StyleSheet, Pressable, Modal, Animated, Dimensions,
  ScrollView, NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import IconCalendar from '@assets/icons/calendar-form.svg';
import IconMoon from '@assets/icons/moon.svg';
import { tokens } from '@/styles/tokens';
import { SheetCloseButton } from '@/components/ui/SheetCloseButton';

interface Props {
  visible: boolean;
  /** 초기값 ISO YYYY-MM-DD. 없으면 오늘. */
  initial?: string;
  onConfirm: (iso: string) => void;
  onClose: () => void;
}

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

// 월 grid — 1일이 무슨 요일인지 + 마지막 날 계산.
// 필요한 행만 (5 또는 6) 채워서 시트가 화면을 넘지 않도록 함.
function getMonthGrid(year: number, month: number) {
  // month는 0-indexed (Jan=0).
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  // 월=0 ... 일=6 으로 정렬 (JS Date.getDay: Sun=0, Mon=1)
  const startWeekday = (firstDay.getDay() + 6) % 7;
  const daysInMonth = lastDay.getDate();
  const prevLastDay = new Date(year, month, 0).getDate();

  const cells: { day: number; inMonth: boolean }[] = [];
  // 앞 prev month
  for (let i = startWeekday - 1; i >= 0; i--) {
    cells.push({ day: prevLastDay - i, inMonth: false });
  }
  // 현재 month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, inMonth: true });
  }
  // 다음 달 패딩 — 7의 배수까지만 (5주 또는 6주).
  const totalCells = Math.ceil(cells.length / 7) * 7;
  let nextDay = 1;
  while (cells.length < totalCells) {
    cells.push({ day: nextDay++, inMonth: false });
  }
  return cells;
}

// 셀 텍스트 스타일을 매 렌더 단일 객체로 계산 — 조건부 style array는 isSel toggle 시
// Android에서 white color가 잔류하는 버그가 있어 직접 계산이 안전.
function getCellTextStyle(isSel: boolean, inMonth: boolean) {
  return {
    fontSize: 14,
    fontFamily: isSel ? tokens.font.sansSemibold : tokens.font.sans,
    color: isSel
      ? tokens.color.white
      : inMonth
        ? tokens.color.ink900
        : tokens.color.ink400,
  } as const;
}

export function CalendarSheet({ visible, initial, onConfirm, onClose }: Props) {
  const initDate = React.useMemo(() => {
    if (initial) {
      const [y, m, d] = initial.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    return new Date();
  }, [initial]);

  const [year, setYear] = React.useState(initDate.getFullYear());
  const [month, setMonth] = React.useState(initDate.getMonth()); // 0-indexed
  const [selected, setSelected] = React.useState({
    year: initDate.getFullYear(),
    month: initDate.getMonth(),
    day: initDate.getDate(),
  });
  const [showYearMonth, setShowYearMonth] = React.useState(false);

  const slideY = React.useRef(new Animated.Value(Dimensions.get('window').height)).current;
  React.useEffect(() => {
    if (visible) {
      // 재오픈 시 initial을 반영해 stale state 방지.
      setYear(initDate.getFullYear());
      setMonth(initDate.getMonth());
      setSelected({
        year: initDate.getFullYear(),
        month: initDate.getMonth(),
        day: initDate.getDate(),
      });
      Animated.timing(slideY, { toValue: 0, duration: 280, useNativeDriver: true }).start();
    } else {
      slideY.setValue(Dimensions.get('window').height);
    }
  }, [visible, slideY, initDate]);

  const close = () => {
    Animated.timing(slideY, {
      toValue: Dimensions.get('window').height,
      duration: 220,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const cells = React.useMemo(() => getMonthGrid(year, month), [year, month]);

  const goToToday = () => {
    const t = new Date();
    setYear(t.getFullYear());
    setMonth(t.getMonth());
  };
  const goPrev = () => {
    if (month === 0) { setYear(year - 1); setMonth(11); } else setMonth(month - 1);
  };
  const goNext = () => {
    if (month === 11) { setYear(year + 1); setMonth(0); } else setMonth(month + 1);
  };

  const onSubmit = () => {
    const iso = `${selected.year}-${String(selected.month + 1).padStart(2, '0')}-${String(selected.day).padStart(2, '0')}`;
    onConfirm(iso);
    close();
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={close}>
      <View style={styles.root}>
        <Pressable onPress={close} style={styles.backdrop} />
        <Animated.View style={[styles.sheetWrap, { transform: [{ translateY: slideY }] }]}>
          <SafeAreaView edges={['bottom']}>
            <View style={styles.handleWrap}><View style={styles.handle} /></View>
            <View style={styles.sheet}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>달력</Text>
                <SheetCloseButton onPress={close} />
              </View>

              <View style={styles.divider} />

              <View style={styles.navRow}>
                <Pressable onPress={goToToday} hitSlop={4}>
                  <Text style={styles.navText}>오늘</Text>
                </Pressable>
                <Pressable onPress={() => setShowYearMonth(true)} style={styles.monthBtn} hitSlop={6}>
                  <Text style={styles.monthLabel}>{year}년 {month + 1}월</Text>
                </Pressable>
                <View style={styles.navArrows}>
                  <Pressable onPress={goPrev} hitSlop={6} style={styles.arrowBtn}>
                    <ChevronLeft size={20} color={tokens.color.ink900} strokeWidth={2} />
                  </Pressable>
                  <Pressable onPress={goNext} hitSlop={6} style={styles.arrowBtn}>
                    <ChevronRight size={20} color={tokens.color.ink900} strokeWidth={2} />
                  </Pressable>
                </View>
              </View>

              {/* 요일 헤더 */}
              <View style={styles.weekHeaderRow}>
                {DAY_LABELS.map((d, i) => (
                  <Text
                    key={d}
                    style={[
                      styles.weekHeaderLabel,
                      // Figma 120:3565 — 토 Brand/50, 일 Destructive/50 (전 캘린더 공통)
                      i === 5 && { color: '#3B82F6' },
                      i === 6 && { color: '#F43F5E' },
                    ]}
                  >
                    {d}
                  </Text>
                ))}
              </View>

              {/* 5/6주 grid — row 단위로 묶어서 셀은 flex:1 (width %는 sub-pixel rounding 버그) */}
              <View style={styles.grid}>
                {Array.from({ length: cells.length / 7 }, (_, rowIdx) => (
                  <View key={rowIdx} style={styles.gridRow}>
                    {cells.slice(rowIdx * 7, rowIdx * 7 + 7).map((c, colIdx) => {
                      const isSel =
                        c.inMonth &&
                        selected.year === year &&
                        selected.month === month &&
                        selected.day === c.day;
                      return (
                        <Pressable
                          key={colIdx}
                          onPress={() => {
                            if (c.inMonth) setSelected({ year, month, day: c.day });
                          }}
                          android_ripple={null}
                          style={styles.cell}
                        >
                          {isSel ? (
                            <View style={styles.cellRing}>
                              <View style={styles.cellFill}>
                                <Text
                                  key="sel"
                                  style={getCellTextStyle(true, c.inMonth)}
                                >
                                  {c.day}
                                </Text>
                              </View>
                            </View>
                          ) : (
                            <View style={styles.cellInner}>
                              <Text
                                key="unsel"
                                style={getCellTextStyle(false, c.inMonth)}
                              >
                                {c.day}
                              </Text>
                            </View>
                          )}
                        </Pressable>
                      );
                    })}
                  </View>
                ))}
              </View>

              <Pressable
                onPress={onSubmit}
                style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}
              >
                <Text style={styles.ctaLabel}>날짜 선택</Text>
                <IconCalendar width={20} height={20} />
              </Pressable>
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>

      {/* 연/월 wheel (Figma 110:3764) */}
      <YearMonthSheet
        visible={showYearMonth}
        year={year}
        month={month}
        onConfirm={(y, m) => { setYear(y); setMonth(m); }}
        onClose={() => setShowYearMonth(false)}
      />
    </Modal>
  );
}

// =============== YearMonthSheet ===============
const ROW_HEIGHT = 52;
const VISIBLE_ROWS = 5;
const PICKER_HEIGHT = ROW_HEIGHT * VISIBLE_ROWS;
const PICKER_PAD = ROW_HEIGHT * Math.floor(VISIBLE_ROWS / 2);

function YearMonthSheet({
  visible, year, month, onConfirm, onClose,
}: {
  visible: boolean;
  year: number;
  month: number;
  onConfirm: (y: number, m: number) => void;
  onClose: () => void;
}) {
  const currentYear = new Date().getFullYear();
  const YEARS = React.useMemo(
    () => Array.from({ length: 121 }, (_, i) => currentYear - 100 + i),
    [currentYear],
  );
  const MONTHS = React.useMemo(() => Array.from({ length: 12 }, (_, i) => i), []);

  const initYearIdx = Math.max(0, YEARS.indexOf(year));
  const [yIdx, setYIdx] = React.useState(initYearIdx);
  const [mIdx, setMIdx] = React.useState(month);

  const slideY = React.useRef(new Animated.Value(Dimensions.get('window').height)).current;

  React.useEffect(() => {
    if (visible) {
      setYIdx(Math.max(0, YEARS.indexOf(year)));
      setMIdx(month);
      Animated.timing(slideY, { toValue: 0, duration: 280, useNativeDriver: true }).start();
    } else {
      slideY.setValue(Dimensions.get('window').height);
    }
  }, [visible, year, month, slideY, YEARS]);

  const close = () => {
    Animated.timing(slideY, {
      toValue: Dimensions.get('window').height,
      duration: 220,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const submit = () => {
    onConfirm(YEARS[yIdx], MONTHS[mIdx]);
    close();
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={close}>
      <View style={styles.root}>
        <Pressable onPress={close} style={styles.backdrop} />
        <Animated.View style={[styles.sheetWrap, { transform: [{ translateY: slideY }] }]}>
          <SafeAreaView edges={['bottom']}>
            <View style={styles.handleWrap}><View style={styles.handle} /></View>
            <View style={styles.sheet}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>연도와 월</Text>
                <SheetCloseButton onPress={close} />
              </View>

              <View style={styles.ymRow}>
                <WheelColumn
                  data={YEARS}
                  format={(n) => `${n}년`}
                  selectedIndex={yIdx}
                  onIndexChange={setYIdx}
                />
                <WheelColumn
                  data={MONTHS}
                  format={(n) => `${n + 1}월`}
                  selectedIndex={mIdx}
                  onIndexChange={setMIdx}
                />
              </View>

              <Pressable
                onPress={submit}
                style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}
              >
                <Text style={styles.ctaLabel}>월 선택</Text>
                <IconMoon width={20} height={20} />
              </Pressable>
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

function WheelColumn({
  data, format, selectedIndex, onIndexChange,
}: {
  data: number[];
  format: (n: number) => string;
  selectedIndex: number;
  onIndexChange: (i: number) => void;
}) {
  const ref = React.useRef<ScrollView | null>(null);
  const lastIdxRef = React.useRef(selectedIndex);

  React.useEffect(() => {
    const t = setTimeout(() => {
      ref.current?.scrollTo({ y: selectedIndex * ROW_HEIGHT, animated: false });
      lastIdxRef.current = selectedIndex;
    }, 0);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (lastIdxRef.current !== selectedIndex) {
      ref.current?.scrollTo({ y: selectedIndex * ROW_HEIGHT, animated: true });
      lastIdxRef.current = selectedIndex;
    }
  }, [selectedIndex]);

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const i = Math.round(y / ROW_HEIGHT);
    const clamped = Math.max(0, Math.min(data.length - 1, i));
    lastIdxRef.current = clamped;
    if (clamped !== selectedIndex) onIndexChange(clamped);
  };

  return (
    <View style={styles.wheelCol}>
      <View pointerEvents="none" style={styles.wheelPill} />
      <ScrollView
        ref={ref}
        contentContainerStyle={{ paddingTop: PICKER_PAD, paddingBottom: PICKER_PAD }}
        showsVerticalScrollIndicator={false}
        snapToInterval={ROW_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={onMomentumEnd}
      >
        {data.map((v, i) => {
          const isSel = i === selectedIndex;
          return (
            <View key={i} style={styles.wheelRow}>
              <Text style={[styles.wheelText, isSel && styles.wheelTextSelected]}>
                {format(v)}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15, 23, 42, 0.4)' },
  sheetWrap: {
    backgroundColor: tokens.color.bgPaper,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    ...tokens.shadow.pop,
  },
  handleWrap: { paddingTop: 12, alignItems: 'center' },
  handle: { width: 64, height: 5, borderRadius: 1234, backgroundColor: '#E2E8F0' },
  sheet: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 24, gap: 20 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 24,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.144,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.ink900,
  },
  divider: { height: 1, backgroundColor: tokens.color.lineDefault },

  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navText: { fontSize: 14, color: tokens.color.ink500, fontFamily: tokens.font.sansSemibold },
  monthBtn: { paddingHorizontal: 8 },
  monthLabel: { fontSize: 16, fontFamily: tokens.font.sansBold, color: tokens.color.ink900 },
  navArrows: { flexDirection: 'row', gap: 12 },
  arrowBtn: { padding: 4 },

  weekHeaderRow: { flexDirection: 'row' },
  weekHeaderLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.ink500,
    paddingVertical: 8,
  },
  grid: { flexDirection: 'column' },
  gridRow: { flexDirection: 'row' },
  cell: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // 선택된 날짜 — borderWidth 대신 38x38 pdBlue 원 안에 36x36 pdMint 원 중첩.
  // Android의 borderWidth+borderRadius 사각형 버그를 원천 차단.
  cellRing: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: tokens.color.pdBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellFill: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: tokens.color.pdMint,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 연·월 휠
  ymRow: { flexDirection: 'row', gap: 16, height: PICKER_HEIGHT },
  wheelCol: { flex: 1, height: PICKER_HEIGHT, position: 'relative' },
  wheelPill: {
    position: 'absolute',
    top: PICKER_PAD,
    left: 0,
    right: 0,
    height: ROW_HEIGHT,
    borderRadius: 16,
    backgroundColor: tokens.color.pdMint,
  },
  wheelRow: { height: ROW_HEIGHT, alignItems: 'center', justifyContent: 'center' },
  wheelText: {
    fontSize: 22,
    lineHeight: 30,
    fontFamily: tokens.font.sans,
    color: 'rgba(104, 144, 203, 0.4)',
    textAlign: 'center',
  },
  wheelTextSelected: { color: tokens.color.white },

  cta: {
    minHeight: 48,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: tokens.color.pdByellow,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  ctaLabel: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.black,
  },
});
