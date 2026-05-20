// 공통 토스트 카드 — Figma 225:3670.
//
// 흰 카드(p12, r16) + 1px pd-gray 보더. 콘텐츠 + 선택 액션 버튼(pd-byellow).
// 위치(상/하단·여백)는 호출부 style prop으로 지정 — 카드 자체는 폭/위치 미지정.
//
// 닫힘 정책(라이브러리 내장):
//  · action 있음 → 사용자가 버튼 탭해야 닫힘(자동 미사라짐).
//  · action 없음 → autoDismissMs(기본 3000) 후 자동 사라짐.
//  · 두 경로 모두 onDismiss 호출 → 부모가 mount 해제.
//
// 사용 예
//   // 단순 안내(자동 사라짐)
//   <Toast title="..." message="..." onDismiss={...} />
//   // 확인 필요(버튼 탭해야 닫힘)
//   <Toast title="..." action={{ label: '확인' }} onDismiss={...} />
//   // 액션 + 추가 처리(예: 되돌리기) — onPress 후 자동으로 닫힘
//   <Toast title="..." action={{ label: '되돌리기', onPress: undo }} onDismiss={...} />

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

export interface ToastAction {
  label: string;
  /** 탭 시 추가 동작 — 없으면 그냥 닫기. onPress 후 항상 onDismiss로 닫힘. */
  onPress?: () => void;
}

interface ToastProps {
  title: string;
  /** 보조 문구 — 없으면 제목만 렌더 */
  message?: string;
  /** 우측 노란 버튼 — 있으면 탭해야 닫힘(자동 미사라짐). */
  action?: ToastAction;
  /** 닫힘 콜백(액션 탭 또는 자동 사라짐). 부모가 토스트 mount 해제. */
  onDismiss: () => void;
  /** 자동 사라짐 시간(ms). action 있으면 무시. 기본 3000. */
  autoDismissMs?: number;
  /** 위치 지정(absolute 등). 카드 자체는 width 미지정 — caller가 부여. */
  style?: StyleProp<ViewStyle>;
}

export function Toast({
  title,
  message,
  action,
  onDismiss,
  autoDismissMs = 3000,
  style,
}: ToastProps) {
  // action 없을 때만 자동 사라짐. action 있으면 사용자가 탭해야 닫힘(정책).
  React.useEffect(() => {
    if (action) return;
    const t = setTimeout(onDismiss, autoDismissMs);
    return () => clearTimeout(t);
  }, [action, autoDismissMs, onDismiss]);

  const handleAction = () => {
    action?.onPress?.();
    onDismiss();
  };

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
          onPress={handleAction}
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
