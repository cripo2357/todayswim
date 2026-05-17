// 요일 선택 시트 — Figma 179:7209.
// BottomSheet "요일 선택" + 단일선택 요일 리스트 + "요일 선택" CTA.
// 레슨 슬롯 추가 시 요일 먼저 고른 뒤 SwimClassTimeSheet(시간) 진입.

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { BottomSheet, SheetCtaButton } from '@/components/ui/BottomSheet';
import { DAY_ORDER } from '@/lib/swimClass';
import type { DayOfWeek } from '@/types/schedule';
import { tokens } from '@/styles/tokens';

export function SwimClassDaySheet({
  visible,
  initialDay,
  onConfirm,
  onClose,
}: {
  visible: boolean;
  initialDay?: DayOfWeek;
  onConfirm: (day: DayOfWeek) => void;
  onClose: () => void;
}) {
  const [sel, setSel] = React.useState<DayOfWeek>(initialDay ?? '월');
  React.useEffect(() => {
    if (visible) setSel(initialDay ?? '월');
  }, [visible, initialDay]);

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="요일 선택"
      contentStyle={styles.sheet}
    >
      <View style={styles.list}>
        {DAY_ORDER.map((d) => {
          const active = d === sel;
          return (
            <Pressable
              key={d}
              onPress={() => setSel(d)}
              style={[styles.row, active && styles.rowActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.rowText, active && styles.rowTextActive]}>
                {d}요일
              </Text>
            </Pressable>
          );
        })}
      </View>
      <SheetCtaButton
        label="요일 선택"
        icon={<Check size={20} color={tokens.color.black} strokeWidth={2.4} />}
        onPress={() => {
          onConfirm(sel);
          onClose();
        }}
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheet: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 24, gap: 32 },
  list: { gap: 8 },
  // Figma 179:7217 — 행 48, 가운데 20px
  row: {
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowActive: { backgroundColor: tokens.color.pdMint },
  rowText: {
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: -0.2,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink700,
  },
  rowTextActive: {
    color: tokens.color.white,
    fontFamily: tokens.font.sansSemibold,
  },
});
