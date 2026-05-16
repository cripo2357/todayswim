// 공통 바텀시트 디자인시스템 — 성별/달력/연월/숫자휠/일정등록 등 여러 시트가
// 동일하게 쓰던 쉘(Modal + dim 백드롭 + 슬라이드업 + 핸들 + 라운드 컨테이너
// + 타이틀행/X)을 단일 리소스로 추출. 콘텐츠만 children으로 주입.
//
// 사용: <BottomSheet visible onClose title="성별">{...}<SheetCtaButton .../></BottomSheet>
// 닫힘 처리: X/백드롭/뒤로가기 모두 onClose 호출 → 부모가 visible=false 로
// 내리면 슬라이드아웃 후 자동 unmount(애니메이션 보존).

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Animated,
  Dimensions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { X } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tokens } from '@/styles/tokens';

const SCREEN_H = Dimensions.get('window').height;

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  /** 주면 타이틀행(제목 + X) 렌더. 없으면 콘텐츠만. */
  title?: string;
  children: React.ReactNode;
  /** 내부 컨테이너 padding/gap override (기본 px16 pt24 pb24 gap24) */
  contentStyle?: StyleProp<ViewStyle>;
}

export function BottomSheet({
  visible,
  onClose,
  title,
  children,
  contentStyle,
}: BottomSheetProps) {
  const slideY = React.useRef(new Animated.Value(SCREEN_H)).current;
  const [render, setRender] = React.useState(visible);

  React.useEffect(() => {
    if (visible) {
      setRender(true);
      Animated.timing(slideY, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }).start();
    } else if (render) {
      Animated.timing(slideY, {
        toValue: SCREEN_H,
        duration: 220,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setRender(false);
      });
    }
  }, [visible, render, slideY]);

  if (!render) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable onPress={onClose} style={styles.backdrop} />
        <Animated.View
          style={[styles.sheetWrap, { transform: [{ translateY: slideY }] }]}
        >
          <SafeAreaView edges={['bottom']}>
            <View style={styles.handleWrap}>
              <View style={styles.handle} />
            </View>
            <View style={[styles.sheet, contentStyle]}>
              {title != null ? (
                <View style={styles.titleRow}>
                  <Text style={styles.title}>{title}</Text>
                  <Pressable
                    onPress={onClose}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel="닫기"
                  >
                    <X size={24} color={tokens.color.ink900} strokeWidth={1.5} />
                  </Pressable>
                </View>
              ) : null}
              {children}
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

/** 시트 하단 노란 확정 버튼(라벨 + 우측 아이콘) — 시트 공용. */
export function SheetCtaButton({
  label,
  icon,
  onPress,
  disabled,
}: {
  label: string;
  icon?: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.cta,
        disabled && styles.ctaDisabled,
        pressed && !disabled && { opacity: 0.85 },
      ]}
    >
      <Text style={[styles.ctaLabel, disabled && styles.ctaLabelDisabled]}>
        {label}
      </Text>
      {icon}
    </Pressable>
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
  sheet: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
    gap: 24,
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
