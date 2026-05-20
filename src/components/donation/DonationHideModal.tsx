// 후원 비공개 확인 — Figma 239:3426.
//
// 공통 ConfirmToast([[toast_pattern]]) 위임. 후원 컨텍스트 텍스트만 박아 둠.
// 동작: hidden=true 토글(실질적 삭제 효과 — 본인 포함 모든 화면에서 미노출,
// DB 이력은 보존). UI 텍스트의 "삭제" 늬앙스는 사용자 인지와 일치.

import React from 'react';
import { ConfirmToast } from '@/components/ui/ConfirmToast';

export function DonationHideModal({
  visible,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <ConfirmToast
      visible={visible}
      onClose={onClose}
      onConfirm={onConfirm}
      title="후원 비공개"
      message="후원 내용을 삭제하겠습니까?"
      ctaLabel="비공개"
      ctaAccessibilityLabel="후원 비공개로 전환"
    />
  );
}
