// Pool's day — 모달 전환 직렬화 가드 (iOS 멈춤 방지, 전역 단일 출처).
//
// 문제: iOS는 RN <Modal>이 닫히는 도중 다른 Modal을 띄우면 멈춤(투명 레이어가
// 터치를 가로채 뒤로가기 제스처로만 회복). "모달 A 닫기 + 모달 B 열기"가 같은
// 순간에 일어나는 모든 핸드오프(시트→확인모달 등)에서 발생.
//
// 해결: 모든 모달 컴포넌트가 자기 `visible`을 이 훅에 통과시킨다.
//  · 어떤 모달이든 닫히면(visible true→false) 전역 lastCloseAt 기록.
//  · 다른 모달이 열릴 때(false→true) 직전 닫힘이 SERIALIZE_MS 안이면 그만큼 지연.
// → 산발적 setTimeout 없이 전역에서 모달 전환을 직렬화. 인스턴스 누락 불가.
//
// 안전: 절대 모달을 영구히 숨기지 않음(열림은 최대 SERIALIZE_MS 후 반드시 표시).
// 닫힘은 즉시 반영(지연 없음).

import React from 'react';

// 가장 최근 모달이 닫히기 시작한 시각(ms, epoch). 전역 공유.
let lastCloseAt = 0;
// 닫힘 애니메이션 여유(BottomSheet slide-out ~220ms) + 버퍼.
const SERIALIZE_MS = 320;

/**
 * 모달의 `visible`을 직렬화된 값으로 변환.
 * @param visible 부모가 제어하는 모달 표시 여부
 * @returns 실제로 Modal에 넘길 표시 여부(열림이 지연될 수 있음)
 */
export function useSerializedVisible(visible: boolean): boolean {
  const [shown, setShown] = React.useState(visible);
  const prevRef = React.useRef(visible);

  React.useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = visible;
    if (visible === prev) return; // 변화 없음

    if (!visible) {
      // 닫힘 — 전역 기록 + 즉시 반영.
      lastCloseAt = Date.now();
      setShown(false);
      return;
    }

    // 열림 — 직전 닫힘이 최근이면 그만큼 지연 후 표시.
    const wait = lastCloseAt + SERIALIZE_MS - Date.now();
    if (wait <= 0) {
      setShown(true);
      return;
    }
    const t = setTimeout(() => setShown(true), wait);
    return () => clearTimeout(t);
  }, [visible]);

  return shown;
}
