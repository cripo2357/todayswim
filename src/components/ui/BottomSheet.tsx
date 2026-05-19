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
  KeyboardAvoidingView,
  Platform,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tokens } from '@/styles/tokens';
import { SheetCloseButton } from './SheetCloseButton';

const SCREEN_H = Dimensions.get('window').height;

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  /** 주면 타이틀행(제목 + X) 렌더. 없으면 콘텐츠만. */
  title?: string;
  children: React.ReactNode;
  /** 내부 컨테이너 padding/gap override (기본 px16 pt24 pb24 gap24) */
  contentStyle?: StyleProp<ViewStyle>;
  /** 시트 본문 최소 높이(px) — 짧은 콘텐츠에서도 길게 고정. */
  minHeight?: number;
}

export function BottomSheet({
  visible,
  onClose,
  title,
  children,
  contentStyle,
  minHeight,
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
        {/* 입력 있는 시트(새 친구 추가 등)에서 키보드가 시트를 가리던 문제 —
            공용 쉘에서 한 번에 회피. 입력 없는 시트는 키보드 안 떠 무영향. */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.kav}
        >
          <Animated.View
            style={[styles.sheetWrap, { transform: [{ translateY: slideY }] }]}
          >
            <SafeAreaView edges={['bottom']}>
            <View style={styles.handleWrap}>
              <View style={styles.handle} />
            </View>
            <View
              style={[
                styles.sheet,
                contentStyle,
                minHeight != null ? { minHeight } : null,
              ]}
            >
              {title != null ? (
                <View style={styles.titleRow}>
                  <Text style={styles.title}>{title}</Text>
                  <SheetCloseButton onPress={onClose} />
                </View>
              ) : null}
              {children}
            </View>
          </SafeAreaView>
          </Animated.View>
        </KeyboardAvoidingView>
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
      {/* button_icon_always_visible 정책: 아이콘은 항상 표시, 비활성 시
          색만 톤다운(라벨과 동일 디스에이블 처리). 조건부 미렌더 금지. */}
      {icon != null ? (
        <View style={disabled ? styles.ctaIconDisabled : undefined}>
          {icon}
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // KAV 가 flex 컨테이너 + flex-end 여야 키보드 시 패딩/높이 변화로
  // 바닥 정렬 시트가 실제로 올라감(root 가 flex-end면 KAV 패딩이 시트를
  // 못 밀어 자동완성이 키보드에 가림). root 는 단순 풀스크린.
  root: { flex: 1 },
  kav: { flex: 1, justifyContent: 'flex-end' },
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
  // 비활성 아이콘 톤다운 — 라벨(pdGray)과 동일 정책. 아이콘 SVG 색이
  // baked라 opacity 로 일괄 톤다운(어떤 아이콘 노드든 동작).
  ctaIconDisabled: { opacity: 0.4 },
});
