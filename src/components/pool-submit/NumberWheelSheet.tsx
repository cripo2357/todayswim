// 수영장 추가 폼에서 사용하는 휠 픽커 바텀시트 (Figma 101:4977 / 101:5025).
// 단일 휠 (single) 또는 듀얼 휠 (dual — 최저/최대 수심) 모드 지원.

import React from 'react';
import {
  View, Text, StyleSheet, Pressable, Modal, ScrollView, Animated, Dimensions,
  NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tokens } from '@/styles/tokens';
import { SheetCloseButton } from '@/components/ui/SheetCloseButton';
import IconChevronDownCircle from '@assets/icons/chevron-down-circle.svg';
import IconChartBubble from '@assets/icons/chart-bubble.svg';

const ROW_HEIGHT = 52;
const VISIBLE_ROWS = 3;
const PICKER_HEIGHT = ROW_HEIGHT * VISIBLE_ROWS;
const PICKER_PAD = ROW_HEIGHT * Math.floor(VISIBLE_ROWS / 2);

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
    color: isSel ? tokens.color.white : 'rgba(104, 144, 203, 0.4)',
    textAlign: 'center' as const,
  };
}

interface SingleProps {
  visible: boolean;
  title: string;
  ctaLabel: string;
  /** 표시값 배열 (예: [0,1,2,...]) */
  options: number[];
  /** 표시 포맷 (예: (n) => `${n}`) */
  format: (n: number) => string;
  initialIndex: number;
  onConfirm: (index: number) => void;
  onClose: () => void;
}

/** 단일 휠 — 레인 개수 등 */
export function SingleWheelSheet({
  visible, title, ctaLabel, options, format, initialIndex, onConfirm, onClose,
}: SingleProps) {
  const [idx, setIdx] = React.useState(initialIndex);
  const slideY = React.useRef(new Animated.Value(Dimensions.get('window').height)).current;

  React.useEffect(() => {
    if (visible) {
      setIdx(initialIndex);
      Animated.timing(slideY, { toValue: 0, duration: 280, useNativeDriver: true }).start();
    } else {
      slideY.setValue(Dimensions.get('window').height);
    }
  }, [visible, initialIndex, slideY]);

  const close = () => {
    Animated.timing(slideY, {
      toValue: Dimensions.get('window').height,
      duration: 220,
      useNativeDriver: true,
    }).start(() => onClose());
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
                <Text style={styles.title}>{title}</Text>
                <SheetCloseButton onPress={close} style={styles.closeBtn} />
              </View>

              <View style={styles.singleWheelRow}>
                <WheelColumn
                  data={options}
                  format={format}
                  selectedIndex={idx}
                  onIndexChange={setIdx}
                />
              </View>

              <Pressable
                onPress={() => { onConfirm(idx); close(); }}
                style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}
              >
                <Text style={styles.ctaLabel}>{ctaLabel}</Text>
                <IconChevronDownCircle width={20} height={20} />
              </Pressable>
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

interface DualProps {
  visible: boolean;
  title: string;
  ctaLabel: string;
  options: number[];
  format: (n: number) => string;
  leftLabel: string;
  rightLabel: string;
  leftInitialIndex: number;
  rightInitialIndex: number;
  onConfirm: (leftIndex: number, rightIndex: number) => void;
  onClose: () => void;
}

/** 듀얼 휠 — 최저/최대 수심 동시 입력 */
export function DualWheelSheet({
  visible, title, ctaLabel, options, format, leftLabel, rightLabel,
  leftInitialIndex, rightInitialIndex, onConfirm, onClose,
}: DualProps) {
  const [leftIdx, setLeftIdx] = React.useState(leftInitialIndex);
  const [rightIdx, setRightIdx] = React.useState(rightInitialIndex);
  const slideY = React.useRef(new Animated.Value(Dimensions.get('window').height)).current;

  React.useEffect(() => {
    if (visible) {
      setLeftIdx(leftInitialIndex);
      setRightIdx(rightInitialIndex);
      Animated.timing(slideY, { toValue: 0, duration: 280, useNativeDriver: true }).start();
    } else {
      slideY.setValue(Dimensions.get('window').height);
    }
  }, [visible, leftInitialIndex, rightInitialIndex, slideY]);

  const close = () => {
    Animated.timing(slideY, {
      toValue: Dimensions.get('window').height,
      duration: 220,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  // 최저 ≤ 최대 보정 — 최저 올라가면 최대 자동 따라감
  React.useEffect(() => {
    if (leftIdx > rightIdx) setRightIdx(leftIdx);
  }, [leftIdx, rightIdx]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={close}>
      <View style={styles.root}>
        <Pressable onPress={close} style={styles.backdrop} />
        <Animated.View style={[styles.sheetWrap, { transform: [{ translateY: slideY }] }]}>
          <SafeAreaView edges={['bottom']}>
            <View style={styles.handleWrap}><View style={styles.handle} /></View>
            <View style={styles.sheet}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>{title}</Text>
                <SheetCloseButton onPress={close} style={styles.closeBtn} />
              </View>

              {/* Figma 101:5025 — 세로 스택: 얕은 수심 / 구분선 / 깊은 수심.
                  각 행 = 좌측 2줄 라벨 + 가로 휠 (gap 32). */}
              <View style={styles.dualGroup}>
                <View style={styles.depthRow}>
                  <Text style={styles.rowLabel}>{leftLabel.split(' ').join('\n')}</Text>
                  <View style={styles.depthWheelWrap}>
                    <WheelColumn
                      data={options}
                      format={format}
                      selectedIndex={leftIdx}
                      onIndexChange={setLeftIdx}
                    />
                  </View>
                </View>

                <View style={styles.depthDivider} />

                <View style={styles.depthRow}>
                  <Text style={styles.rowLabel}>{rightLabel.split(' ').join('\n')}</Text>
                  <View style={styles.depthWheelWrap}>
                    <WheelColumn
                      data={options}
                      format={format}
                      selectedIndex={rightIdx}
                      onIndexChange={setRightIdx}
                    />
                  </View>
                </View>
              </View>

              <Pressable
                onPress={() => { onConfirm(leftIdx, rightIdx); close(); }}
                style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}
              >
                <Text style={styles.ctaLabel}>{ctaLabel}</Text>
                <IconChartBubble width={20} height={20} />
              </Pressable>
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

/** 휠 컬럼 — 위/아래 마진으로 가운데 행이 선택되도록 패딩 처리 */
function WheelColumn({
  data, format, selectedIndex, onIndexChange,
}: {
  data: number[];
  format: (n: number) => string;
  selectedIndex: number;
  onIndexChange: (i: number) => void;
}) {
  const ref = React.useRef<ScrollView | null>(null);
  const lastScrollIdxRef = React.useRef(selectedIndex);

  React.useEffect(() => {
    const t = setTimeout(() => {
      ref.current?.scrollTo({ y: selectedIndex * ROW_HEIGHT, animated: false });
      lastScrollIdxRef.current = selectedIndex;
    }, 0);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 외부에서 selectedIndex가 강제로 바뀌면 (예: 듀얼 휠 보정) 휠 위치도 따라감.
  React.useEffect(() => {
    if (lastScrollIdxRef.current !== selectedIndex) {
      ref.current?.scrollTo({ y: selectedIndex * ROW_HEIGHT, animated: true });
      lastScrollIdxRef.current = selectedIndex;
    }
  }, [selectedIndex]);

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const i = Math.round(y / ROW_HEIGHT);
    const clamped = Math.max(0, Math.min(data.length - 1, i));
    lastScrollIdxRef.current = clamped;
    if (clamped !== selectedIndex) onIndexChange(clamped);
  };

  return (
    <View style={styles.wheelCol}>
      <View pointerEvents="none" style={styles.selectionPill} />
      <ScrollView
        ref={ref}
        contentContainerStyle={{ paddingTop: PICKER_PAD, paddingBottom: PICKER_PAD }}
        showsVerticalScrollIndicator={false}
        snapToInterval={ROW_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={onMomentumEnd}
      >
        {data.map((v, i) => {
          const isSelected = i === selectedIndex;
          return (
            <View key={i} style={styles.row}>
              <Text key={isSelected ? 'sel' : 'unsel'} style={getWheelTextStyle(isSelected)}>
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
  title: {
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.144,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.ink900,
  },
  closeBtn: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  singleWheelRow: { alignItems: 'center' },
  // Figma 101:5031 — 두 행(얕은/깊은) + 구분선, 섹션 gap 32
  dualGroup: { gap: 32 },
  // Figma 101:5032/5043 — 좌측 라벨 + 가로 휠, gap 32
  depthRow: { flexDirection: 'row', alignItems: 'center', gap: 32 },
  depthWheelWrap: { flex: 1 },
  // Figma 101:5033/5044 — Regular 24/32 -0.288 black, 2줄(얕은\n수심)
  rowLabel: {
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.288,
    fontFamily: tokens.font.sans,
    color: tokens.color.black,
    textAlign: 'center',
  },
  // Figma 101:5042 — 구분선 #E2E8F0
  depthDivider: { height: 1, backgroundColor: '#E2E8F0' },
  wheelCol: {
    width: '100%',
    height: PICKER_HEIGHT,
    position: 'relative',
  },
  // pd-mint 배경 + 보더 없음
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
  // 휠 행 텍스트는 getWheelTextStyle에서 단일 객체로 계산
  // — Android color 잔류 버그 회피(위 함수 주석 참고).
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
