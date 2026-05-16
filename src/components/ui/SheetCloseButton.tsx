// 공통 바텀시트 닫기(X) 버튼 — Figma 110:4529 "close x".
// 24px X, 색 #1F2937(Gray/80), strokeWidth 2. 모든 시트 타이틀행 우측에서 동일 사용.
// hitSlop 8 + 접근성 라벨 "닫기" 포함 — 호출부는 onPress만 넘기면 됨.

import React from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { X } from 'lucide-react-native';

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
      <X size={24} color="#1F2937" strokeWidth={2} />
    </Pressable>
  );
}
