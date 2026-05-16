// Figma 110:4477 — 성별 입력 바텀시트. 남성/여성 2개 옵션.
// 가입(ProfileSetup)·내 정보(MyInfo) 공용.
// 쉘은 공통 BottomSheet 디자인시스템(@/components/ui/BottomSheet) 재사용 —
// 이 시트는 성별 옵션 콘텐츠만 담당.

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Check } from 'lucide-react-native';
import { tokens } from '@/styles/tokens';
import type { Gender } from '@/store/profile';
import { BottomSheet, SheetCtaButton } from '@/components/ui/BottomSheet';

interface Props {
  visible: boolean;
  value: Gender | null;
  onConfirm: (g: Gender) => void;
  onClose: () => void;
}

export function GenderSheet({ visible, value, onConfirm, onClose }: Props) {
  const [draft, setDraft] = React.useState<Gender | null>(value);

  // 열릴 때 현재 값으로 초기화(재오픈 시 stale 방지).
  React.useEffect(() => {
    if (visible) setDraft(value);
  }, [visible, value]);

  const submit = () => {
    if (draft) onConfirm(draft);
    onClose();
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="성별"
      contentStyle={styles.sheet}
    >
      <View style={styles.options}>
        <GenderOption
          label="남성"
          selected={draft === 'male'}
          onPress={() => setDraft('male')}
        />
        <GenderOption
          label="여성"
          selected={draft === 'female'}
          onPress={() => setDraft('female')}
        />
      </View>

      <SheetCtaButton
        label="선택"
        onPress={submit}
        icon={<Check size={20} color={tokens.color.black} strokeWidth={2.4} />}
      />
    </BottomSheet>
  );
}

function GenderOption({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.optionPill, selected && styles.optionPillSelected]}
    >
      <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

// Figma 110:4477 — 성별 콘텐츠 스타일 (쉘은 BottomSheet 공통)
const styles = StyleSheet.create({
  // 기본 BottomSheet gap(24) → 성별 시트는 Figma 기준 32
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
