// Figma 90:7336 — 수업 시간 입력 바텀시트.
// "{요일}요일 수업 시간" + 수업 시작/종료 각각 시(오전·오후 N시)·분 휠 +
// "수업 시간 등록" CTA. 휠 스냅 메커니즘은 NumberWheelSheet WheelColumn과 동일.

import React from 'react';
import {
  View, Text, StyleSheet, Pressable, Modal, ScrollView, Animated, Dimensions,
  type NativeSyntheticEvent, type NativeScrollEvent,
} from 'react-native';
import { AppModal } from '@/components/ui/AppModal';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { DayOfWeek } from '@/types/schedule';
import { tokens } from '@/styles/tokens';
import { SheetCloseButton } from '@/components/ui/SheetCloseButton';
import IconUniversityHat from '@assets/icons/university-hat.svg';

const ROW_HEIGHT = 52;
const VISIBLE_ROWS = 3;
const PICKER_HEIGHT = ROW_HEIGHT * VISIBLE_ROWS;
const PICKER_PAD = ROW_HEIGHT * Math.floor(VISIBLE_ROWS / 2);

const HOURS = Array.from({ length: 24 }, (_, h) => h); // 0~23
const MINUTES = [0, 10, 20, 30, 40, 50];

function hourLabel(h: number): string {
  const ampm = h < 12 ? '오전' : '오후';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${ampm} ${h12}시`;
}
const minuteLabel = (m: number) => `${String(m).padStart(2, '0')}분`;
const pad2 = (n: number) => String(n).padStart(2, '0');

// 휠 행 텍스트 스타일을 매 렌더 단일 객체로 계산.
// 조건부 style array(`[rowText, isSel && rowTextSelected]`)는 Android에서
// ScrollView 행 재사용 시 color 갱신이 누락돼 "선택인데 흰색이 안 되는"
// 버그가 간헐 발생 → 단일 객체 직접 계산 + key 토글 remount로 차단.
// (CalendarSheet.getCellTextStyle와 동일 해법)
function getWheelTextStyle(isSel: boolean) {
  return {
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.288,
    fontFamily: tokens.font.sans,
    color: isSel ? tokens.color.white : '#94A3B8',
    textAlign: 'center' as const,
  };
}

export function SwimClassTimeSheet({
  visible,
  day,
  onConfirm,
  onClose,
}: {
  visible: boolean;
  day: DayOfWeek;
  onConfirm: (start: string, end: string) => void;
  onClose: () => void;
}) {
  // 기본값: 시작 09:00 / 종료 10:00
  const [sH, setSH] = React.useState(9);
  const [sM, setSM] = React.useState(0);
  const [eH, setEH] = React.useState(10);
  const [eM, setEM] = React.useState(0);
  const slideY = React.useRef(
    new Animated.Value(Dimensions.get('window').height),
  ).current;

  React.useEffect(() => {
    if (visible) {
      setSH(9);
      setSM(0);
      setEH(10);
      setEM(0);
      Animated.timing(slideY, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }).start();
    } else {
      slideY.setValue(Dimensions.get('window').height);
    }
  }, [visible, slideY]);

  const close = () => {
    Animated.timing(slideY, {
      toValue: Dimensions.get('window').height,
      duration: 220,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const submit = () => {
    onConfirm(`${pad2(sH)}:${pad2(sM)}`, `${pad2(eH)}:${pad2(eM)}`);
    close();
  };

  return (
    <AppModal visible={visible} transparent animationType="none" onRequestClose={close}>
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
                <Text style={styles.title}>{day}요일 수업 시간</Text>
                <SheetCloseButton onPress={close} style={styles.closeBtn} />
              </View>

              <View style={styles.group}>
                <View style={styles.timeRow}>
                  <Text style={styles.rowLabel}>수업{'\n'}시작</Text>
                  <Wheel
                    data={HOURS}
                    format={hourLabel}
                    selectedIndex={sH}
                    onIndexChange={setSH}
                  />
                  <Wheel
                    data={MINUTES}
                    format={minuteLabel}
                    selectedIndex={MINUTES.indexOf(sM)}
                    onIndexChange={(i) => setSM(MINUTES[i])}
                  />
                </View>

                <View style={styles.divider} />

                <View style={styles.timeRow}>
                  <Text style={styles.rowLabel}>수업{'\n'}종료</Text>
                  <Wheel
                    data={HOURS}
                    format={hourLabel}
                    selectedIndex={eH}
                    onIndexChange={setEH}
                  />
                  <Wheel
                    data={MINUTES}
                    format={minuteLabel}
                    selectedIndex={MINUTES.indexOf(eM)}
                    onIndexChange={(i) => setEM(MINUTES[i])}
                  />
                </View>
              </View>

              <Pressable
                onPress={submit}
                style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}
                accessibilityRole="button"
                accessibilityLabel="수업 시간 등록"
              >
                <Text style={styles.ctaLabel}>수업 시간 등록</Text>
                <IconUniversityHat width={20} height={20} />
              </Pressable>
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </AppModal>
  );
}

function Wheel({
  data,
  format,
  selectedIndex,
  onIndexChange,
}: {
  data: number[];
  format: (n: number) => string;
  selectedIndex: number;
  onIndexChange: (i: number) => void;
}) {
  const ref = React.useRef<ScrollView | null>(null);
  const lastIdx = React.useRef(selectedIndex);

  React.useEffect(() => {
    const t = setTimeout(() => {
      ref.current?.scrollTo({ y: selectedIndex * ROW_HEIGHT, animated: false });
      lastIdx.current = selectedIndex;
    }, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.y / ROW_HEIGHT);
    const clamped = Math.max(0, Math.min(data.length - 1, i));
    lastIdx.current = clamped;
    if (clamped !== selectedIndex) onIndexChange(clamped);
  };

  return (
    <View style={styles.wheelCol}>
      <View pointerEvents="none" style={styles.selectionPill} />
      <ScrollView
        ref={ref}
        contentContainerStyle={{
          paddingTop: PICKER_PAD,
          paddingBottom: PICKER_PAD,
        }}
        showsVerticalScrollIndicator={false}
        snapToInterval={ROW_HEIGHT}
        decelerationRate="fast"
        nestedScrollEnabled
        onMomentumScrollEnd={onEnd}
      >
        {data.map((v, i) => {
          const isSel = i === selectedIndex;
          return (
            <View key={i} style={styles.row}>
              <Text key={isSel ? 'sel' : 'unsel'} style={getWheelTextStyle(isSel)}>
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
  handleWrap: { paddingTop: 12, alignItems: 'center' },
  handle: { width: 64, height: 5, borderRadius: 1234, backgroundColor: '#E2E8F0' },
  sheet: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 24, gap: 32 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 24,
  },
  // Figma I90:7341 — Bold 18/24 -0.144 #1F2937
  title: {
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.144,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.ink900,
  },
  closeBtn: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  group: { gap: 32 },
  // Figma 90:7343/7354 — 라벨 + 시 휠 + 분 휠, gap 32
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 32 },
  // Figma 90:7344 — Regular 24/32 -0.288 black, 2줄
  rowLabel: {
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.288,
    fontFamily: tokens.font.sans,
    color: tokens.color.black,
    textAlign: 'center',
  },
  // Figma 90:7353 — 구분선 #E2E8F0
  divider: { height: 1, backgroundColor: '#E2E8F0' },
  wheelCol: { flex: 1, height: PICKER_HEIGHT, position: 'relative' },
  // Figma 90:7347 — 가운데 pd-mint 알약 r16
  selectionPill: {
    position: 'absolute',
    top: PICKER_PAD,
    left: 0,
    right: 0,
    height: ROW_HEIGHT,
    borderRadius: 16,
    backgroundColor: tokens.color.pdMint,
  },
  row: { height: ROW_HEIGHT, alignItems: 'center', justifyContent: 'center' },
  // 휠 행 텍스트(미선택 #94A3B8 / 선택 white)는 getWheelTextStyle에서 단일
  // 객체로 계산 — Android color 잔류 버그 회피(위 함수 주석 참고).
  // Figma 90:7364 — pd-byellow r14 minH48 px20 py12 gap10
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
