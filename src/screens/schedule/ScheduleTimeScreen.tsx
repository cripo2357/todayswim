// Figma 35:454 — 자유수영 타임 입력 (시작/종료 통합 바텀시트).
//
// 시 + 분 wheel picker가 시작/종료 각각 한 화면. 종료 ≤ 시작이 되면 자동으로 종료를 start+10분으로 보정.

import React from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, NativeSyntheticEvent, NativeScrollEvent,
  Animated, Dimensions,
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
const VISIBLE_ROWS = 3;
const PICKER_HEIGHT = ROW_HEIGHT * VISIBLE_ROWS;
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

function indicesToMinutes(hIdx: number, mIdx: number): number {
  return HOURS[hIdx] * 60 + MINUTES[mIdx];
}

/** 분 → 가장 가까운 (hourIdx, minuteIdx). 한국 운영시간(6-22시 / 10분 단위) 범위 안에서 clamp. */
function minutesToIndices(min: number): { hIdx: number; mIdx: number } {
  const maxMin = HOURS[HOURS.length - 1] * 60 + MINUTES[MINUTES.length - 1];
  const clamped = Math.min(Math.max(min, HOURS[0] * 60), maxMin);
  const h = Math.floor(clamped / 60);
  const m = clamped - h * 60;
  // 분은 10단위로 floor
  const mFloor = Math.floor(m / 10) * 10;
  const hIdx = HOURS.indexOf(h);
  const mIdx = MINUTES.indexOf(mFloor);
  return {
    hIdx: hIdx >= 0 ? hIdx : 0,
    mIdx: mIdx >= 0 ? mIdx : 0,
  };
}

export function ScheduleTimeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ScheduleTime'>>();
  const { day } = route.params;

  const addTimeSlot = useScheduleDraft((s) => s.addTimeSlot);

  // 기본값: 시작 11:00, 종료 13:00
  const [startH, setStartH] = React.useState(HOURS.indexOf(11));
  const [startM, setStartM] = React.useState(MINUTES.indexOf(0));
  const [endH, setEndH] = React.useState(HOURS.indexOf(13));
  const [endM, setEndM] = React.useState(MINUTES.indexOf(0));

  // 휠 스크롤 제어 ref — 자동 보정 시 프로그래매틱 스크롤
  const endHRef = React.useRef<ScrollView | null>(null);
  const endMRef = React.useRef<ScrollView | null>(null);

  const startMin = indicesToMinutes(startH, startM);
  const endMin = indicesToMinutes(endH, endM);

  /**
   * 종료 ≤ 시작이면 종료를 start+10분으로 자동 보정.
   * - 사용자가 시작을 위로 올려서 종료를 침범 → 종료 따라 올라감
   * - 사용자가 종료를 아래로 내려서 시작을 침범 → 종료 다시 올라옴 (snap back)
   */
  React.useEffect(() => {
    if (endMin > startMin) return;
    const target = startMin + 10;
    const { hIdx, mIdx } = minutesToIndices(target);
    if (hIdx !== endH) {
      setEndH(hIdx);
      endHRef.current?.scrollTo({ y: hIdx * ROW_HEIGHT, animated: true });
    }
    if (mIdx !== endM) {
      setEndM(mIdx);
      endMRef.current?.scrollTo({ y: mIdx * ROW_HEIGHT, animated: true });
    }
  }, [startMin, endMin, endH, endM]);

  // 시트 슬라이드 애니메이션 — Dim은 nav fade로 즉시, 시트만 아래에서 위로.
  const SCREEN_H = Dimensions.get('window').height;
  const slideY = React.useRef(new Animated.Value(SCREEN_H)).current;

  React.useEffect(() => {
    Animated.timing(slideY, {
      toValue: 0,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [slideY]);

  const onClose = () => {
    Animated.timing(slideY, {
      toValue: SCREEN_H,
      duration: 220,
      useNativeDriver: true,
    }).start(() => navigation.goBack());
  };

  const onSubmit = () => {
    const sh = HOURS[startH];
    const sm = MINUTES[startM];
    const eh = HOURS[endH];
    const em = MINUTES[endM];
    if (endMin <= startMin) return; // 안전장치 — useEffect로 이미 보정되긴 함
    addTimeSlot(day as DayOfWeek, {
      start: `${String(sh).padStart(2, '0')}:${String(sm).padStart(2, '0')}`,
      end: `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`,
      hours: (endMin - startMin) / 60,
    });
    onClose();
  };

  return (
    <View style={styles.root}>
      <Pressable onPress={onClose} style={styles.backdrop} />

      <Animated.View style={{ transform: [{ translateY: slideY }] }}>
        <SafeAreaView edges={['bottom']} style={styles.sheetWrap}>
        {/* 상단 드래그 핸들 */}
        <View style={styles.handleWrap}>
          <View style={styles.handle} />
        </View>

        <View style={styles.sheet}>
          {/* 헤더 */}
          <View style={styles.titleRow}>
            <Text style={styles.title}>자유수영 타임 입력</Text>
            <Pressable
              onPress={onClose}
              hitSlop={8}
              style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.5 }]}
              accessibilityLabel="닫기"
            >
              <X size={24} color={tokens.color.ink900} strokeWidth={1.5} />
            </Pressable>
          </View>

          {/* 시작 시간 */}
          <PickerRow
            labelLines={['시작', '시간']}
            hourIndex={startH}
            minuteIndex={startM}
            onHourChange={setStartH}
            onMinuteChange={setStartM}
          />

          <View style={styles.divider} />

          {/* 종료 시간 */}
          <PickerRow
            labelLines={['종료', '시간']}
            hourIndex={endH}
            minuteIndex={endM}
            onHourChange={setEndH}
            onMinuteChange={setEndM}
            hourRef={endHRef}
            minuteRef={endMRef}
          />

          {/* 등록 버튼 */}
          <Pressable
            onPress={onSubmit}
            style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}
            accessibilityRole="button"
          >
            <Text style={styles.ctaLabel}>타임 등록</Text>
            <Check size={18} color={tokens.color.white} strokeWidth={2.4} />
          </Pressable>
        </View>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

interface PickerRowProps {
  labelLines: [string, string];
  hourIndex: number;
  minuteIndex: number;
  onHourChange: (i: number) => void;
  onMinuteChange: (i: number) => void;
  hourRef?: React.MutableRefObject<ScrollView | null>;
  minuteRef?: React.MutableRefObject<ScrollView | null>;
}

function PickerRow({
  labelLines, hourIndex, minuteIndex, onHourChange, onMinuteChange, hourRef, minuteRef,
}: PickerRowProps) {
  return (
    <View style={styles.pickerRow}>
      <View style={styles.labelCol}>
        <Text style={styles.labelText}>{labelLines[0]}</Text>
        <Text style={styles.labelText}>{labelLines[1]}</Text>
      </View>
      <PickerColumn
        data={HOURS}
        format={formatHour}
        selectedIndex={hourIndex}
        onIndexChange={onHourChange}
        externalRef={hourRef}
      />
      <PickerColumn
        data={MINUTES}
        format={formatMinute}
        selectedIndex={minuteIndex}
        onIndexChange={onMinuteChange}
        externalRef={minuteRef}
        // 분 picker — 50 → 00 / 00 → 50 경계에서 시(hour) picker와 연결.
        // canPrev: 이전 시로 갈 수 있는가 (hour 인덱스 > 0)
        // canNext: 다음 시로 갈 수 있는가 (hour 인덱스 < 마지막)
        wrap={{
          canPrev: hourIndex > 0,
          canNext: hourIndex < HOURS.length - 1,
          onWrapPrev: () => onHourChange(hourIndex - 1),
          onWrapNext: () => onHourChange(hourIndex + 1),
        }}
      />
    </View>
  );
}

interface WrapConfig {
  canPrev: boolean;
  canNext: boolean;
  onWrapPrev: () => void;
  onWrapNext: () => void;
}

interface PickerColumnProps {
  data: number[];
  format: (n: number) => string;
  selectedIndex: number;
  onIndexChange: (i: number) => void;
  externalRef?: React.MutableRefObject<ScrollView | null>;
  /**
   * wrap이 설정되면 위/아래에 phantom 행을 추가.
   * - phantom prev (위) = data[last]: 스크롤 시 onWrapPrev() 호출 + 실 last 인덱스로 점프
   * - phantom next (아래) = data[0]: 스크롤 시 onWrapNext() 호출 + 실 0 인덱스로 점프
   * - canPrev/canNext가 false면 phantom으로 가도 wrap 안 일어나고 원래 위치로 bump back.
   */
  wrap?: WrapConfig;
}

function PickerColumn({ data, format, selectedIndex, onIndexChange, externalRef, wrap }: PickerColumnProps) {
  const innerRef = React.useRef<ScrollView | null>(null);
  const setRef = (node: ScrollView | null) => {
    innerRef.current = node;
    if (externalRef) externalRef.current = node;
  };

  // wrap 활성 시 [last, ...data, first] 구성. 실 인덱스 → 표시 인덱스는 +1 offset.
  const displayItems = wrap
    ? [data[data.length - 1], ...data, data[0]]
    : data;
  const offset = wrap ? 1 : 0;

  React.useEffect(() => {
    // mount 직후 선택값으로 스크롤
    const t = setTimeout(() => {
      innerRef.current?.scrollTo({ y: (selectedIndex + offset) * ROW_HEIGHT, animated: false });
    }, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const displayIdx = Math.round(y / ROW_HEIGHT);

    if (wrap) {
      // phantom prev (위)
      if (displayIdx === 0) {
        if (wrap.canPrev) {
          wrap.onWrapPrev();
          // 실 last 인덱스(표시 idx = data.length)로 점프 — 화면상 같은 값이라 비주얼 변화 없음
          innerRef.current?.scrollTo({ y: data.length * ROW_HEIGHT, animated: false });
          onIndexChange(data.length - 1);
        } else {
          // 경계 — 원래 자리(표시 idx = 1, 실 0)로 복귀
          innerRef.current?.scrollTo({ y: 1 * ROW_HEIGHT, animated: true });
          if (selectedIndex !== 0) onIndexChange(0);
        }
        return;
      }
      // phantom next (아래)
      if (displayIdx === data.length + 1) {
        if (wrap.canNext) {
          wrap.onWrapNext();
          // 실 0 인덱스(표시 idx = 1)로 점프
          innerRef.current?.scrollTo({ y: 1 * ROW_HEIGHT, animated: false });
          onIndexChange(0);
        } else {
          // 경계 — 원래 자리(표시 idx = data.length, 실 last)로 복귀
          innerRef.current?.scrollTo({ y: data.length * ROW_HEIGHT, animated: true });
          if (selectedIndex !== data.length - 1) onIndexChange(data.length - 1);
        }
        return;
      }
      // 정상 — 표시 idx → 실 idx = displayIdx - 1
      const realIdx = displayIdx - 1;
      if (realIdx !== selectedIndex) onIndexChange(realIdx);
    } else {
      const clamped = Math.max(0, Math.min(data.length - 1, displayIdx));
      if (clamped !== selectedIndex) onIndexChange(clamped);
    }
  };

  return (
    <View style={styles.pickerCol}>
      {/* 가운데 selected pill — 가운데 row 자리에 절대 위치, scroll과 무관 */}
      <View pointerEvents="none" style={styles.selectionPill} />
      <ScrollView
        ref={setRef}
        contentContainerStyle={{
          paddingTop: PICKER_PAD,
          paddingBottom: PICKER_PAD,
        }}
        showsVerticalScrollIndicator={false}
        snapToInterval={ROW_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={onMomentumEnd}
      >
        {displayItems.map((v, i) => {
          // wrap 모드일 때 phantom 여부 — 시각적으로 같은 값이지만 isSelected는 실 인덱스 기준.
          const isPhantom = wrap && (i === 0 || i === displayItems.length - 1);
          const realIdx = wrap ? i - offset : i;
          const isSelected = !isPhantom && realIdx === selectedIndex;
          return (
            <View key={`${v}-${i}`} style={styles.row}>
              <Text
                style={[
                  styles.rowText,
                  isSelected && styles.rowTextSelected,
                ]}
              >
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
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  sheetWrap: {
    backgroundColor: tokens.color.bgPaper,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    ...tokens.shadow.pop,
  },
  // Figma 5:15377 — bottom popup drawer handle
  handleWrap: {
    paddingTop: 12,
    paddingBottom: 0,
    alignItems: 'center',
  },
  handle: {
    width: 64,
    height: 5,
    borderRadius: 1234,
    backgroundColor: '#E2E8F0',
  },
  sheet: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
    gap: 32,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 24,
  },
  // Figma I35:459 — Bold 18/24 tracking -0.144 ink900
  title: {
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.144,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.ink900,
  },
  closeBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
  },
  // Figma 57:596 — Regular 24/32 tracking -0.288 black, 2-line "시작\n시간"
  labelCol: {
    alignItems: 'center',
  },
  labelText: {
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.288,
    fontFamily: tokens.font.sans,
    color: tokens.color.black,
    textAlign: 'center',
  },
  pickerCol: {
    flex: 1,
    height: PICKER_HEIGHT,
    position: 'relative',
  },
  // Figma 35:464 — bg #EFF6FF, border #2563EB 1px, radius 16, h 52
  selectionPill: {
    position: 'absolute',
    top: PICKER_PAD,
    left: 0,
    right: 0,
    height: ROW_HEIGHT,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  row: {
    height: ROW_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Figma I35:462 — Regular 24/32 tracking -0.288 ink400 (unselected)
  rowText: {
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.288,
    fontFamily: tokens.font.sans,
    color: '#94A3B8',
    textAlign: 'center',
  },
  // Figma I35:464 — selected: #2563EB
  rowTextSelected: {
    color: '#2563EB',
  },
  // Figma 57:619 — 구분선
  divider: {
    height: 1,
    backgroundColor: tokens.color.lineDefault,
  },
  // Figma 35:529 — #007AFF, radius 14, min-h 48, px-20 py-12, gap 10
  cta: {
    minHeight: 48,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: tokens.color.brandBlue,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  // Figma 35:531 — SemiBold 16/22 tracking -0.112 white
  ctaLabel: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.white,
  },
});
