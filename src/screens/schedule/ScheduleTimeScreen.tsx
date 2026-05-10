// Figma: 35:395 (시작 시간 입력) / 35:454 (종료 시간 입력)
//
// 바텀 시트 + 시 / 분 2컬럼 wheel picker.
// 가운데 row가 선택된 값. snap scroll 로 wheel 효과.

import React from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Check, X } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useScheduleDraft } from '@/store/scheduleDraft';
import type { RootStackParamList } from '@/navigation/types';
import type { DayOfWeek } from '@/types/schedule';
import { tokens } from '@/styles/tokens';

const ROW_HEIGHT = 52;
const VISIBLE_ROWS = 5;
const PICKER_HEIGHT = ROW_HEIGHT * VISIBLE_ROWS;
// 위·아래 가운데 정렬 padding (2 row 분량) — 첫/마지막 항목도 가운데 올 수 있게
const PICKER_PAD = ROW_HEIGHT * Math.floor(VISIBLE_ROWS / 2);

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6시 ~ 22시
const MINUTES = [0, 10, 20, 30, 40, 50];

function formatHour(h: number) {
  if (h < 12) return `오전 ${h}시`;
  if (h === 12) return '오후 12시';
  return `오후 ${h - 12}시`;
}

function formatMinute(m: number) {
  return `${String(m).padStart(2, '0')}분`;
}

export function ScheduleTimeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ScheduleTime'>>();
  const { poolId, nickname, day, mode, startTime } = route.params;
  const isStart = mode === 'start';

  const addTimeSlot = useScheduleDraft((s) => s.addTimeSlot);

  const initialHourIndex = isStart ? HOURS.indexOf(11) : HOURS.indexOf(13);
  const initialMinuteIndex = MINUTES.indexOf(0);

  const [hourIndex, setHourIndex] = React.useState(initialHourIndex);
  const [minuteIndex, setMinuteIndex] = React.useState(initialMinuteIndex);

  const onClose = () => navigation.goBack();

  const onSubmit = () => {
    const h = HOURS[hourIndex];
    const m = MINUTES[minuteIndex];
    const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

    if (isStart) {
      navigation.replace('ScheduleTime', {
        poolId, nickname, day, mode: 'end', startTime: time,
      });
    } else {
      if (!startTime) {
        onClose();
        return;
      }
      const [sh, sm] = startTime.split(':').map((n) => parseInt(n, 10));
      const startTotal = sh * 60 + sm;
      const endTotal = h * 60 + m;
      if (endTotal <= startTotal) return;
      addTimeSlot(day as DayOfWeek, {
        start: startTime,
        end: time,
        hours: (endTotal - startTotal) / 60,
      });
      navigation.goBack();
    }
  };

  return (
    <View style={styles.root}>
      <Pressable onPress={onClose} style={styles.backdrop} />

      <SafeAreaView edges={['bottom']} style={styles.sheetWrap}>
        <View style={styles.sheet}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>
              자유수영 {isStart ? '시작' : '종료'} 시간 입력
            </Text>
            <Pressable
              onPress={onClose}
              hitSlop={8}
              style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.5 }]}
              accessibilityLabel="닫기"
            >
              <X size={24} color={tokens.color.ink900} strokeWidth={1.5} />
            </Pressable>
          </View>

          <View style={styles.pickerRow}>
            <PickerColumn
              data={HOURS}
              format={formatHour}
              selectedIndex={hourIndex}
              onIndexChange={setHourIndex}
            />
            <PickerColumn
              data={MINUTES}
              format={formatMinute}
              selectedIndex={minuteIndex}
              onIndexChange={setMinuteIndex}
            />
            {/* 가운데 selected row outline pill (양 컬럼 각각) */}
            <View pointerEvents="none" style={styles.selectionFrame}>
              <View style={styles.selectionPill} />
              <View style={styles.selectionPill} />
            </View>
          </View>

          <Pressable
            onPress={onSubmit}
            style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}
            accessibilityRole="button"
          >
            <Text style={styles.ctaLabel}>
              {isStart ? '시작 시간 등록' : '종료 시간 등록'}
            </Text>
            <Check size={18} color={tokens.color.white} strokeWidth={2.4} />
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

interface PickerColumnProps {
  data: number[];
  format: (n: number) => string;
  selectedIndex: number;
  onIndexChange: (i: number) => void;
}

function PickerColumn({ data, format, selectedIndex, onIndexChange }: PickerColumnProps) {
  const ref = React.useRef<ScrollView | null>(null);

  React.useEffect(() => {
    // 초기 선택값으로 스크롤 (mount 직후)
    const t = setTimeout(() => {
      ref.current?.scrollTo({ y: selectedIndex * ROW_HEIGHT, animated: false });
    }, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const idx = Math.round(y / ROW_HEIGHT);
    const clamped = Math.max(0, Math.min(data.length - 1, idx));
    if (clamped !== selectedIndex) onIndexChange(clamped);
  };

  return (
    <ScrollView
      ref={ref}
      style={styles.pickerCol}
      contentContainerStyle={{
        paddingTop: PICKER_PAD,
        paddingBottom: PICKER_PAD,
      }}
      showsVerticalScrollIndicator={false}
      snapToInterval={ROW_HEIGHT}
      decelerationRate="fast"
      onMomentumScrollEnd={onMomentumEnd}
    >
      {data.map((v, i) => {
        const distance = Math.abs(i - selectedIndex);
        const opacity = distance === 0 ? 1 : distance === 1 ? 0.6 : 0.25;
        return (
          <View
            key={v}
            style={styles.row}
          >
            <Text
              style={[
                styles.rowText,
                i === selectedIndex && styles.rowTextSelected,
                { opacity },
              ]}
            >
              {format(v)}
            </Text>
          </View>
        );
      })}
    </ScrollView>
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    ...tokens.shadow.pop,
  },
  sheet: {
    paddingHorizontal: tokens.space[5],
    paddingTop: tokens.space[5],
    paddingBottom: tokens.space[5],
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: tokens.space[4],
  },
  title: {
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: -0.5,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.ink900,
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerRow: {
    flexDirection: 'row',
    height: PICKER_HEIGHT,
    position: 'relative',
  },
  pickerCol: {
    flex: 1,
  },
  row: {
    height: ROW_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    fontSize: 22,
    lineHeight: 30,
    letterSpacing: -0.7,
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.ink900,
  },
  rowTextSelected: {
    color: tokens.color.brandBlue,
    fontFamily: tokens.font.sansBold,
  },
  selectionFrame: {
    position: 'absolute',
    top: PICKER_PAD,
    left: 0,
    right: 0,
    height: ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 16,
  },
  selectionPill: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: tokens.color.brandBlue,
  },
  cta: {
    marginTop: tokens.space[5],
    height: 48,
    borderRadius: tokens.radius.md,
    backgroundColor: tokens.color.brandBlue,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: tokens.space[2],
  },
  ctaLabel: {
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: -0.5,
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.white,
  },
});
