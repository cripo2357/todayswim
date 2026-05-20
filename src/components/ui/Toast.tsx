// 공통 토스트 카드 — Figma 225:3670.
//
// 흰 카드(p12, r16) + 1px pd-gray 보더. 콘텐츠 영역(좌측 flex) + 선택 액션
// 버튼(pd-byellow) + 선택 닫기 X. 카드 자체는 presentation만 — 표시/숨김·
// 위치·타이머는 호출부 책임([shared_ui_library] 패턴).
//
// 사용 예
//   <Toast title="..." message="..." onClose={...} />
//   <Toast title="..." action={{ label: '확인', onPress: ... }} onClose={...} />
//
// 향후 글로벌 호출이 필요해지면 ToastProvider/useToast 레이어를 같은 파일에
// 추가(현재는 카드 1종으로 충분).

import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { tokens } from '@/styles/tokens';
import IconClose from '@assets/icons/close.svg';

export interface ToastAction {
  label: string;
  onPress: () => void;
}

export function Toast({
  title,
  message,
  action,
  onClose,
  style,
}: {
  title: string;
  /** 보조 문구 — 없으면 제목만 렌더 */
  message?: string;
  /** 우측 노란 버튼 — 없으면 표시 X */
  action?: ToastAction;
  /** 닫기(X) 콜백 — 없으면 X 표시 X */
  onClose?: () => void;
  /** 위치 지정(absolute 등). 카드 자체는 width 미지정 — caller가 부여. */
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {message ? (
          <Text style={styles.message} numberOfLines={2}>
            {message}
          </Text>
        ) : null}
      </View>
      {action ? (
        <Pressable
          onPress={action.onPress}
          accessibilityRole="button"
          accessibilityLabel={action.label}
          style={({ pressed }) => [
            styles.actionBtn,
            pressed && styles.actionBtnPressed,
          ]}
        >
          <Text style={styles.actionLabel} numberOfLines={1}>
            {action.label}
          </Text>
        </Pressable>
      ) : null}
      {onClose ? (
        <Pressable
          onPress={onClose}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="닫기"
        >
          <IconClose width={20} height={20} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  // Figma 225:3670 — bg white, border 1px pd-gray, r16, p12, gap12, row center
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: tokens.color.bgPaper,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: tokens.color.pdGray,
  },
  // 좌측 텍스트 컬럼 — flex 1, gap 6, center
  content: { flex: 1, gap: 6, justifyContent: 'center', minWidth: 0 },
  // Title — Bold 16/22 -0.112 #1F2937 ([figma_color_token_mismatch] 리터럴)
  title: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansBold,
    color: '#1F2937',
  },
  // Supporting text — Medium 14/20 -0.084 #4B5563
  message: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansMedium,
    color: '#4B5563',
  },
  // Button — pd-byellow bg, r12, px16 py10, SemiBold 14/20 black
  actionBtn: {
    backgroundColor: tokens.color.pdByellow,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnPressed: { opacity: 0.7 },
  actionLabel: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.black,
  },
});
