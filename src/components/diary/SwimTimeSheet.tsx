// 수영 시간 입력 바텀시트 — Figma 372:10661.
// 수영 시작/종료 각각 시(오전·오후 N시)·분(10분 단위) 휠 + "수영 시간 등록" CTA.
// 휠 메커니즘은 SwimClassTimeSheet와 동일.

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Animated,
  Dimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { AppModal } from '@/components/ui/AppModal';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Clock } from 'lucide-react-native';
import { tokens } from '@/styles/tokens';
import { SheetCloseButton } from '@/components/ui/SheetCloseButton';

const ROW_HEIGHT = 52;
const VISIBLE_ROWS = 3;
const PICKER_HEIGHT = ROW_HEIGHT * VISIBLE_ROWS;
const PICKER_PAD = ROW_HEIGHT * Math.floor(VISIBLE_ROWS / 2);

const HOURS = Array.from({ length: 24 }, (_, h) => h);
const MINUTES = [0, 10, 20, 30, 40, 50];

function hourLabel(h: number): string {
  const ampm = h < 12 ? '오전' : '오후';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${ampm} ${h12}시`;
}
const minuteLabel = (m: number) => `${String(m).padStart(2, '0')}분`;
const pad2 = (n: number) => String(n).padStart(2, '0');

function parseHM(t: string): { h: number; mIdx: number } {
  const [hh, mm] = (t ?? '').split(':').map(Number);
  const h = Number.isFinite(hh) ? Math.max(0, Math.min(23, hh)) : 9;
  const m = Number.isFinite(mm) ? mm : 0;
  let mIdx = 0;
  let best = Infinity;
  MINUTES.forEach((mv, i) => {
    const d = Math.abs(mv - m);
    if (d < best) {
      best = d;
      mIdx = i;
    }
  });
  return { h, mIdx };
}

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

export function SwimTimeSheet({
  visible,
  initialStart,
  initialEnd,
  onConfirm,
  onClose,
}: {
  visible: boolean;
  initialStart: string;
  initialEnd: string;
  onConfirm: (start: string, end: string) => void;
  onClose: () => void;
}) {
  const [sH, setSH] = React.useState(9);
  const [sM, setSM] = React.useState(0);
  const [eH, setEH] = React.useState(10);
  const [eM, setEM] = React.useState(0);
  const slideY = React.useRef(
    new Animated.Value(Dimensions.get('window').height),
  ).current;

  React.useEffect(() => {
    if (visible) {
      const s = parseHM(initialStart);
      const e = parseHM(initialEnd);
      setSH(s.h);
      setSM(MINUTES[s.mIdx]);
      setEH(e.h);
      setEM(MINUTES[e.mIdx]);
      Animated.timing(slideY, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }).start();
    } else {
      slideY.setValue(Dimensions.get('window').height);
    }
  }, [visible, initialStart, initialEnd, slideY]);

  const close = () => {
    Animated.timing(slideY, {
      toValue: Dimensions.get('window').height,
      duration: 220,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  // 종료 시각은 시작보다 늦어야 함(같거나 앞서면 등록 불가).
  const invalid = eH * 60 + eM <= sH * 60 + sM;

  const submit = () => {
    if (invalid) return;
    onConfirm(`${pad2(sH)}:${pad2(sM)}`, `${pad2(eH)}:${pad2(eM)}`);
    close();
  };

  return (
    <AppModal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={close}
    >
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
                <Text style={styles.title}>수영 시간</Text>
                <SheetCloseButton onPress={close} style={styles.closeBtn} />
              </View>

              <View style={styles.group}>
                <View style={styles.timeRow}>
                  <Text style={styles.rowLabel}>수영{'\n'}시작</Text>
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
                  <Text style={styles.rowLabel}>수영{'\n'}종료</Text>
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

              {invalid ? (
                <Text style={styles.errorText}>
                  종료 시각은 시작 시각보다 늦어야 해요.
                </Text>
              ) : null}

              <Pressable
                onPress={submit}
                disabled={invalid}
                style={({ pressed }) => [
                  styles.cta,
                  invalid && styles.ctaDisabled,
                  pressed && !invalid && { opacity: 0.85 },
                ]}
                accessibilityRole="button"
                accessibilityLabel="수영 시간 등록"
              >
                <Text
                  style={[styles.ctaLabel, invalid && styles.ctaLabelDisabled]}
                >
                  수영 시간 등록
                </Text>
                <Clock
                  size={20}
                  color={invalid ? tokens.color.pdGray : tokens.color.black}
                  strokeWidth={2}
                />
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

  React.useEffect(() => {
    const t = setTimeout(() => {
      ref.current?.scrollTo({ y: selectedIndex * ROW_HEIGHT, animated: false });
    }, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.y / ROW_HEIGHT);
    const clamped = Math.max(0, Math.min(data.length - 1, i));
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
              <Text
                key={isSel ? 'sel' : 'unsel'}
                style={getWheelTextStyle(isSel)}
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
  handleWrap: { paddingTop: 12, alignItems: 'center' },
  handle: {
    width: 64,
    height: 5,
    borderRadius: 1234,
    backgroundColor: '#E2E8F0',
  },
  sheet: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 24, gap: 32 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 24,
  },
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
  group: { gap: 32 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 32 },
  rowLabel: {
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.288,
    fontFamily: tokens.font.sans,
    color: tokens.color.black,
    textAlign: 'center',
  },
  divider: { height: 1, backgroundColor: '#E2E8F0' },
  wheelCol: { flex: 1, height: PICKER_HEIGHT, position: 'relative' },
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
  errorText: {
    marginTop: -16,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: tokens.font.sans,
    color: tokens.color.red,
    textAlign: 'center',
  },
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
  ctaDisabled: { backgroundColor: tokens.color.pdBgray },
  ctaLabel: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.black,
  },
  ctaLabelDisabled: { color: tokens.color.pdGray },
});