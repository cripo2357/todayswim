// 마커 합성(bake) — naver-map 커스텀 children 마커는 iOS에서 비트맵 캡처 시
// 밑에 깔린 레이어(노란 링 PNG)를 떨어뜨리거나 크기를 어긋나게 늘려서, 내 위치
// 프로필 사진이 사라지고 옆 스택 아바타가 찌그러진다. 그래서 합성 뷰를 화면
// 밖에서 한 번 캡처해 평범한 이미지(file://)로 SDK 에 넘긴다.
//
// file:// 가 양 플랫폼에서 동작함을 SDK 네이티브 소스로 검증:
//  · iOS  RNCNaverMapOverlayImageLoader.mm — url.fileURL 분기에서
//         dataWithContentsOfURL 로 직접 읽음. (data: URI 는 NSURLSession 이
//         로드 못 해 실패하므로 절대 쓰지 말 것.)
//  · Android GetOverlayImage.kt — Fresco 가 Uri.parse(file://) 직접 디코드.
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { captureRef } from 'react-native-view-shot';

export type BakeJob = {
  /** 캡처 캐시 키. 내용이 바뀌면 키도 바뀌어 재캡처(예: 사진 변경·참여자 변경). */
  key: string;
  width: number;
  height: number;
  node: React.ReactNode;
};

/** view-shot tmpfile 은 플랫폼따라 scheme 유무가 갈림 — file:// 로 정규화.
 *  (Android 는 /data/... 경로, iOS 는 file:///var/... 가 흔함) */
function normalizeFileUri(uri: string): string {
  if (uri.startsWith('file://') || uri.startsWith('http')) return uri;
  return 'file://' + uri;
}

function BakeCell({
  job,
  onBaked,
}: {
  job: BakeJob;
  onBaked: (key: string, uri: string) => void;
}) {
  const ref = React.useRef<View>(null);
  React.useEffect(() => {
    let cancelled = false;
    // 아바타 사진(원격 thumb)이 비동기 로드라 여유 후 캡처(로드 전 캡처 방지).
    const t = setTimeout(async () => {
      if (cancelled || !ref.current) return;
      try {
        // width/height 미지정 → 뷰 실제 크기 × 화면 배율로 캡처(레티나 선명).
        // SDK 쪽 width/height prop 이 표시 크기를 px→pt 로 다시 맞춘다.
        const uri = await captureRef(ref, {
          format: 'png',
          quality: 1,
          result: 'tmpfile',
        });
        if (!cancelled) onBaked(job.key, normalizeFileUri(uri));
      } catch {
        /* 캡처 실패 시 호출측 폴백(내 위치=링, 스택=숨김) 유지 */
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
    // 키가 바뀔 때만 재캡처(동일 사진·동일 스택은 1회만 구움).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job.key]);

  return (
    <View
      ref={ref}
      collapsable={false}
      style={{ width: job.width, height: job.height }}
    >
      {job.node}
    </View>
  );
}

/** 화면 밖 숨은 영역에 bake job 들을 렌더 → 각자 캡처되면 onBaked(key, fileUri).
 *  호출측은 이미 구운 키를 제외(jobs 필터)해 넘겨 재캡처를 막는다. */
export function MarkerBakery({
  jobs,
  onBaked,
}: {
  jobs: BakeJob[];
  onBaked: (key: string, uri: string) => void;
}) {
  return (
    <View pointerEvents="none" style={styles.hidden}>
      {jobs.map((j) => (
        <BakeCell key={j.key} job={j} onBaked={onBaked} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  // 화면 밖(off-screen) — 캡처는 렌더된 픽셀 기준이라 위치 무관, 사용자엔 안 보임.
  hidden: { position: 'absolute', left: -10000, top: -10000 },
});
