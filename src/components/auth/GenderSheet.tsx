// Figma 110:4477 — 성별 입력 바텀시트. 남성/여성 2개 옵션.
// 가입(ProfileSetup)·내 정보(MyInfo) 공용. CalendarSheet와 동일한 추출 패턴.

import React from 'react';
import {
  View, Text, StyleSheet, Pressable, Modal, Animated, Dimensions,
} from 'react-native';
import { X, Check } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tokens } from '@/styles/tokens';
import type { Gender } from '@/store/profile';

interface Props {
  visible: boolean;
  value: Gender | null;
  onConfirm: (g: Gender) => void;
  onClose: () => void;
}

export function GenderSheet({ visible, value, onConfirm, onClose }: Props) {
  const [draft, setDraft] = React.useState<Gender | null>(value);
  const slideY = React.useRef(new Animated.Value(Dimensions.get('window').height)).current;

  React.useEffect(() => {
    if (visible) {
      setDraft(value);
      Animated.timing(slideY, { toValue: 0, duration: 280, useNativeDriver: true }).start();
    } else {
      slideY.setValue(Dimensions.get('window').height);
    }
  }, [visible, value, slideY]);

  const close = () => {
    Animated.timing(slideY, {
      toValue: Dimensions.get('window').height,
      duration: 220,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const submit = () => {
    if (draft) onConfirm(draft);
    close();
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
                <Text style={styles.title}>성별</Text>
                <Pressable onPress={close} hitSlop={8}>
                  <X size={24} color={tokens.color.ink900} strokeWidth={1.5} />
                </Pressable>
              </View>

              <View style={styles.options}>
                <GenderOption label="남성" selected={draft === 'male'} onPress={() => setDraft('male')} />
                <GenderOption label="여성" selected={draft === 'female'} onPress={() => setDraft('female')} />
              </View>

              <Pressable
                onPress={submit}
                style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}
              >
                <Text style={styles.ctaLabel}>선택</Text>
                <Check size={20} color={tokens.color.black} strokeWidth={2.4} />
              </Pressable>
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

function GenderOption({
  label, selected, onPress,
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

// Figma 110:4477 — 성별 바텀시트 스타일
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
    height: 24,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.144,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.ink900,
  },
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
