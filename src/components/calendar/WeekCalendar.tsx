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

/** 시:분 0으로 내린 날짜 복사본 */
function floorDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function WeekCalendar({
  selectedDate,
  onSelectDate,
  markedKeys,
  minDate,
  maxDate,
  headerDivider,
}: {
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  /** 일정 있는 날짜 키(YYYY-MM-DD) set — dot 표시 */
  markedKeys?: Set<string>;
  /** 선택 가능 최소/최대 날짜 (없으면 무제한). 등록 캘린더에서만 사용. */
  minDate?: Date;
  maxDate?: Date;
  /** 헤더(오늘·월·화살표) 위아래 구분선 + 패딩. 등록 시트 전용 (Figma 122:8139). */
  headerDivider?: boolean;
}) {
  const minMs = minDate ? floorDay(minDate).getTime() : undefined;
  const maxMs = maxDate ? floorDay(maxDate).getTime() : undefined;
  const inRange = React.useCallback(
    (d: Date) => {
      const t = floorDay(d).getTime();
      if (minMs !== undefined && t < minMs) return false;
      if (maxMs !== undefined && t > maxMs) return false;
      return true;
    },
    [minMs, maxMs],
  );
  const clamp = React.useCallback(
    (d: Date) => {
      const t = floorDay(d).getTime();
      if (minMs !== undefined && t < minMs) return new Date(minMs);
      if (maxMs !== undefined && t > maxMs) return new Date(maxMs);
      return d;
    },
    [minMs, maxMs],
  );

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
    onSelectDate(clamp(d));
  };
  const goToday = () => onSelectDate(clamp(new Date()));

  // 이전/다음 주에 선택 가능한 날짜가 하나라도 있는지 (없으면 화살표 비활성).
  const prevWeekLast = new Date(weekStart);
  prevWeekLast.setDate(prevWeekLast.getDate() - 1);
  const nextWeekFirst = new Date(weekStart);
  nextWeekFirst.setDate(nextWeekFirst.getDate() + 7);
  const canPrev = inRange(prevWeekLast);
  const canNext = inRange(nextWeekFirst);

  const selKey = dateKey(selectedDate);

  return (
    <View style={styles.wrap}>
      <View style={[styles.headerRow, headerDivider && styles.headerDivider]}>
        <Pressable onPress={goToday} hitSlop={8} style={styles.todayBtn}>
          <Text style={styles.todayLabel}>오늘</Text>
        </Pressable>
        <Text style={styles.monthLabel}>
          {selectedDate.getFullYear()}년 {selectedDate.getMonth() + 1}월
        </Text>
        <View style={styles.navBtns}>
          <Pressable
            onPress={() => canPrev && shiftWeek(-1)}
            disabled={!canPrev}
            hitSlop={8}
          >
            <ChevronLeft
              size={20}
              color={canPrev ? tokens.color.ink500 : tokens.color.lineDefault}
              strokeWidth={2}
            />
          </Pressable>
          <Pressable
            onPress={() => canNext && shiftWeek(1)}
            disabled={!canNext}
            hitSlop={8}
          >
            <ChevronRight
              size={20}
              color={canNext ? tokens.color.ink500 : tokens.color.lineDefault}
              strokeWidth={2}
            />
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
          const outOfRange = !inRange(d);
          return (
            <Pressable
              key={k}
              onPress={() => !outOfRange && onSelectDate(d)}
              disabled={outOfRange}
              style={[styles.dayCell, outOfRange && styles.dayDisabled]}
            >
              <View
                style={[
                  styles.dayCircle,
                  selected && !outOfRange && styles.daySelected,
                ]}
              >
                <Text
                  style={[
                    styles.dayNum,
                    // 날짜 숫자는 요일 무관 동일 색 (토/일 틴트 제거).
                    // 오늘 날짜 별도 색 없음(선택 시만 흰색).
                    selected && !outOfRange && styles.dayNumSelected,
                  ]}
                >
                  {d.getDate()}
                </Text>
                {/* 내 일정 있는 날 — 숫자 바로 아래, 선택 원 "안쪽" 하단에
                    겹치도록 원 기준 absolute 배치 (Figma 120:4701). */}
                {markedKeys?.has(k) ? <View style={styles.dot} /> : null}
              </View>
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
  // Figma 122:8139 — 등록 시트: 헤더 위아래 #E2E8F0 구분선 + px8 py16
  headerDivider: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 16,
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
  // 요일 헤더 토/일만 색 다름 (Figma 120:3565 — Brand/50 / Destructive/50)
  sat: { color: '#3B82F6' },
  sun: { color: '#F43F5E' },
  dayCell: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 4 },
  // 선택 범위(오늘~+90일) 밖 날짜 — 비활성 표시
  dayDisabled: { opacity: 0.3 },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    // 테두리를 항상 1px 유지(평소 transparent) — RN Android에서
    // borderWidth 0↔1 토글 시 borderRadius가 풀려 사각형 되는 버그 회피.
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Figma 123:8264 — pd-mint 배경 + pd-blue 테두리(폭은 dayCircle에서 고정)
  daySelected: {
    backgroundColor: tokens.color.pdMint,
    borderColor: tokens.color.pdBlue,
  },
  dayNum: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: tokens.font.sansMedium,
    color: tokens.color.ink900,
  },
  // Figma 123:8265 — 선택 숫자는 Regular(흰색), Bold 아님
  dayNumSelected: { color: tokens.color.white, fontFamily: tokens.font.sans },
  // Figma 120:4701 — 내 일정 있는 날: 숫자 바로 아래 6px 빨간 점.
  // dayCircle 기준 absolute → 선택 원 안쪽 하단에 겹쳐 위치.
  // 선택일에도 동일 빨강(일관) — 색 토글 안 함.
  dot: {
    position: 'absolute',
    bottom: 2,
    left: '50%',
    marginLeft: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: tokens.color.red,
  },
});
