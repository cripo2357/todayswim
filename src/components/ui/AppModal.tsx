// Pool's day — RN Modal 드롭인 래퍼. iOS 모달 전환 멈춤 방지용 전역 가드 내장.
//
// 앱의 모든 모달은 react-native의 <Modal> 대신 이 <AppModal>을 쓴다. visible을
// modalGuard(useSerializedVisible)에 통과시켜, 다른 모달이 닫히는 도중 열리면
// 자동으로 직렬화(열림 지연). 호출부는 평소대로 visible만 넘기면 됨 — 핸드오프마다
// setTimeout을 붙일 필요 없음(인스턴스 누락 불가).
//
// 주의: visible을 동적 값으로 받는 모달에만 의미 있음. BottomSheet처럼 visible을
// 리터럴 true로 두고 render 상태로 게이팅하는 경우는 useSerializedVisible을 prop에
// 직접 적용(BottomSheet 내부 처리).

import React from 'react';
import { Modal, type ModalProps } from 'react-native';
import { useSerializedVisible } from './modalGuard';

export function AppModal({ visible, ...rest }: ModalProps) {
  const v = useSerializedVisible(!!visible);
  return <Modal visible={v} {...rest} />;
}
