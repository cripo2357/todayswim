// 목록에서 단일 선택하는 공통 바텀시트 — 성별 시트(Figma 110:4477)
// 디자인을 일반화. BottomSheet 쉘 + 옵션 풀(pill) 리스트 + 확정 버튼.
//
// 사용: <OptionSheet title="성별" value={g} options={[{value,label},...]}
//                     onConfirm={setG} visible onClose />
// "어디서든 목록 단일선택" 시 이 컴포넌트 재사용.

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Check } from 'lucide-react-native';
import { tokens } from '@/styles/tokens';
import { BottomSheet, SheetCtaButton } from './BottomSheet';

export interface Option<T> {
  value: T;
  label: string;
}

interface OptionSheetProps<T extends string | number> {
  visible: boolean;
  onClose: () => void;
  title: string;
  options: Option<T>[];
  /** 현재 선택값 (열릴 때 draft 초기화 기준). 없으면 미선택. */
  value: T | null;
  onConfirm: (v: T) => void;
  /** 확정 버튼 라벨 (기본 "선택") */
  ctaLabel?: string;
  /** 확정 버튼 우측 아이콘 (기본 Check) */
  ctaIcon?: React.ReactNode;
  /** true면 확인 버튼을 안 눌러도 시트가 닫힐 때(딤 탭/스와이프 포함)
   *  현재 선택을 확정한다. (성별 시트 등 — 닫기=선택 적용) */
  commitOnClose?: boolean;
}

export function OptionSheet<T extends string | number>({
  visible,
  onClose,
  title,
  options,
  value,
  onConfirm,
  ctaLabel = '선택',
  ctaIcon,
  commitOnClose = false,
}: OptionSheetProps<T>) {
  const [draft, setDraft] = React.useState<T | null>(value);

  // 열릴 때 현재 값으로 초기화(재오픈 시 stale 방지).
  React.useEffect(() => {
    if (visible) setDraft(value);
  }, [visible, value]);

  const submit = () => {
    if (draft == null) return;
    const v = draft;
    // 시트를 먼저 닫고, onConfirm 은 닫힘 애니메이션 후 호출.
    // iOS는 RN Modal이 닫히는 도중 새 Modal을 띄우면 멈춤(투명 레이어가 터치를
    // 가로채 뒤로가기로만 회복) — onConfirm이 또 다른 모달(확인 등)을 열 수 있어
    // 전환을 직렬화한다. (BottomSheet 닫힘 ~220ms → 300ms 여유)
    onClose();
    setTimeout(() => onConfirm(v), 300);
  };

  // 닫기 경로(딤 탭/스와이프/뒤로) — commitOnClose면 변경된 선택을 확정.
  const handleClose = () => {
    if (commitOnClose && draft != null && draft !== value) {
      onConfirm(draft);
    }
    onClose();
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={handleClose}
      title={title}
      contentStyle={styles.sheet}
    >
      <View style={styles.options}>
        {options.map((o) => {
          const selected = draft === o.value;
          return (
            <Pressable
              key={String(o.value)}
              onPress={() => setDraft(o.value)}
              style={[styles.optionPill, selected && styles.optionPillSelected]}
            >
              <Text
                style={[
                  styles.optionLabel,
                  selected && styles.optionLabelSelected,
                ]}
              >
                {o.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <SheetCtaButton
        label={ctaLabel}
        onPress={submit}
        disabled={draft == null}
        icon={
          ctaIcon ?? (
            <Check size={20} color={tokens.color.black} strokeWidth={2.4} />
          )
        }
      />
    </BottomSheet>
  );
}

// Figma 110:4477 — 옵션 리스트 스타일 (쉘은 BottomSheet 공통)
const styles = StyleSheet.create({
  // 기본 BottomSheet gap(24) → 옵션 시트는 Figma 기준 32
  sheet: { gap: 32 },
  // Figma 110:4484 — gap 8, 옵션 풀폭
  options: { gap: 8 },
  // Figma 110:4487/4488 — h48, px16 py10, radius 14, 텍스트 중앙
  optionPill: {
    height: 48,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  optionPillSelected: { backgroundColor: tokens.color.pdMint },
  // Figma Text xl/Regular — 20/28, ls -0.2, 미선택 #4B5563
  optionLabel: {
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: -0.2,
    fontFamily: tokens.font.sans,
    color: '#4B5563',
    textAlign: 'center',
  },
  optionLabelSelected: { color: tokens.color.white },
});
