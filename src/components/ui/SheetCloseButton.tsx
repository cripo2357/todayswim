// 공통 바텀시트/모달 닫기(X) 버튼 — Figma 122:6785 / 110:4529 "close x".
// Figma export 에셋(assets/icons/close.svg) 그대로 사용 — 24px 박스 안에
// 15.41 X 마크(채움형, #4B5563). hitSlop 8 + 접근성 라벨 "닫기" 포함.

import React from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import IconClose from '@assets/icons/close.svg';

export function SheetCloseButton({
  onPress,
  style,
}: {
  onPress: () => void;
  /** 추가 래퍼 스타일(예: 고정 24x24 정렬 박스) */
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={style}
      accessibilityRole="button"
      accessibilityLabel="닫기"
    >
      <IconClose width={24} height={24} />
    </Pressable>
  );
}
