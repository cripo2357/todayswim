// 주간 캘린더 — Figma 120:3156 / 122:6779. 달력 탭 + 일정 추가 시트 공용.
// "오늘 | YYYY년 M월 | < >" 헤더 + 요일행(월~일) + 현재 주 날짜 7개.
// 선택일 mint 원, 일정 있는 날짜 아래 파란 dot.

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { tokens } from '@/styles/tokens';
import { dateKey } from '@/store/swimSchedule';

const DOW = ['월', '화', '수', '목', '금', '토', '일'];

/** 해당 날짜가 속한 주의 월요일 */
function mondayOf(d: Date): Date {
  const x = new Date(d);
  const day = x.getDay(); // 0=일
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function WeekCalendar({
  selectedDate,
  onSelectDate,
  markedKeys,
}: {
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  /** 일정 있는 날짜 키(YYYY-MM-DD) set — dot 표시 */
  markedKeys?: Set<string>;
}) {
  const weekStart = React.useMemo(() => mondayOf(selectedDate), [selectedDate]);
  const days = React.useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        return d;
      }),
    [weekStart],
  );

  const shiftWeek = (delta: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta * 7);
    onSelectDate(d);
  };
  const goToday = () => onSelectDate(new Date());

  const selKey = dateKey(selectedDate);
  const todayKey = dateKey(new Date());

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Pressable onPress={goToday} hitSlop={8} style={styles.todayBtn}>
          <Text style={styles.todayLabel}>오늘</Text>
        </Pressable>
        <Text style={styles.monthLabel}>
          {selectedDate.getFullYear()}년 {selectedDate.getMonth() + 1}월
        </Text>
        <View style={styles.navBtns}>
          <Pressable onPress={() => shiftWeek(-1)} hitSlop={8}>
            <ChevronLeft size={20} color={tokens.color.ink500} strokeWidth={2} />
          </Pressable>
          <Pressable onPress={() => shiftWeek(1)} hitSlop={8}>
            <ChevronRight size={20} color={tokens.color.ink500} strokeWidth={2} />
          </Pressable>
        </View>
      </View>

      <View style={styles.row}>
        {DOW.map((d, i) => (
          <Text
            key={d}
            style={[
              styles.dowLabel,
              i === 5 && styles.sat,
              i === 6 && styles.sun,
            ]}
          >
            {d}
          </Text>
        ))}
      </View>

      <View style={styles.row}>
        {days.map((d, i) => {
          const k = dateKey(d);
          const selected = k === selKey;
          const isToday = k === todayKey;
          return (
            <Pressable
              key={k}
              onPress={() => onSelectDate(d)}
              style={styles.dayCell}
            >
              <View style={[styles.dayCircle, selected && styles.daySelected]}>
                <Text
                  style={[
                    styles.dayNum,
                    i === 5 && !selected && styles.sat,
                    i === 6 && !selected && styles.sun,
                    selected && styles.dayNumSelected,
                    isToday && !selected && styles.dayToday,
                  ]}
                >
                  {d.getDate()}
                </Text>
              </View>
              {markedKeys?.has(k) ? (
                <View
                  style={[styles.dot, selected && styles.dotOnSelected]}
                />
              ) : (
                <View style={styles.dotPlaceholder} />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  todayBtn: { minWidth: 36 },
  todayLabel: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: tokens.font.sansMedium,
    color: tokens.color.ink500,
  },
  monthLabel: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.ink900,
  },
  navBtns: { flexDirection: 'row', gap: 16, minWidth: 36, justifyContent: 'flex-end' },
  row: { flexDirection: 'row' },
  dowLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: tokens.font.sansMedium,
    color: tokens.color.ink500,
  },
  sat: { color: tokens.color.pdMint },
  sun: { color: tokens.color.red },
  dayCell: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 4 },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daySelected: { backgroundColor: tokens.color.pdMint },
  dayNum: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: tokens.font.sansMedium,
    color: tokens.color.ink900,
  },
  dayNumSelected: { color: tokens.color.white, fontFamily: tokens.font.sansBold },
  dayToday: { color: tokens.color.pdMint, fontFamily: tokens.font.sansBold },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: tokens.color.pdBlue,
  },
  dotOnSelected: { backgroundColor: tokens.color.pdMint },
  dotPlaceholder: { width: 5, height: 5 },
});
