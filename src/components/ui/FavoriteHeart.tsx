// 수영장 즐겨찾기 하트 (Figma 90:5963 / 163:10650 / 147:5326).
// 등록=채워진 하트 / 해제=외곽선 하트. 탭하면 토글 + 하트 오른쪽 툴팁
// ("즐겨찾기 등록" / "즐겨찾기 해제", Figma 169:5827/103:2598) 2초 후 숨김.

import React from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Tooltip } from '@/components/ui/Tooltip';
import { useFavorites } from '@/store/favorites';
import HeartFilled from '@assets/icons/heart-filled.svg';
import HeartOutline from '@assets/icons/heart-outline.svg';

// 한 번에 하나의 즐겨찾기 툴팁만 — 새 툴팁이 뜨면 직전 것 즉시 숨김
// (인스턴스마다 state가 분리돼 있어 모듈 레벨 코디네이터로 단일화).
let hideActiveFavTip: (() => void) | null = null;

export function FavoriteHeart({
  poolId,
  size = 20,
  style,
}: {
  poolId: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const isFav = useFavorites((s) => s.ids.includes(poolId));
  const toggle = useFavorites((s) => s.toggle);
  const [tip, setTip] = React.useState<string | null>(null);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = React.useCallback(() => {
    setTip(null);
    if (timer.current) clearTimeout(timer.current);
    if (hideActiveFavTip === hide) hideActiveFavTip = null;
  }, []);

  React.useEffect(() => hide, [hide]); // 언마운트 시 정리

  const onPress = async () => {
    const nowFav = await toggle(poolId);
    // 새 툴팁 노출 → 기존(다른 하트 포함) 즐겨찾기 툴팁 즉시 숨김
    hideActiveFavTip?.();
    setTip(nowFav ? '즐겨찾기 등록' : '즐겨찾기 해제');
    hideActiveFavTip = hide;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(hide, 5000); // 유지 5초
  };

  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={isFav ? '즐겨찾기 해제' : '즐겨찾기 등록'}
      accessibilityState={{ selected: isFav }}
      style={[styles.wrap, { width: size, height: size }, style]}
    >
      {/* 하트 오른쪽에 뜨는 툴팁 — placement='right'(Figma 169:5827/
          103:2598): 버블이 하트 오른쪽, 삼각형(꼬리)이 버블 왼쪽에서
          하트를 가리킴. 세로는 하트 중앙 정렬. */}
      {tip ? (
        <Tooltip
          label={tip}
          placement="right"
          style={[styles.tooltip, { left: size + 4 }]}
        />
      ) : null}
      {isFav ? (
        <HeartFilled width={size} height={size} />
      ) : (
        <HeartOutline width={size} height={size} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // 공통 Tooltip 위치 — 하트 오른쪽, 세로 중앙.
  // width 200 필수: absolute+left가 좁은 부모(20px)에 폭 수렴 → 라벨이
  // truncate되어 안 보이던 문제 방지(=top/bottom 툴팁이 쓰던 값과 동일).
  // alignItems flex-start: 기본 center를 덮어 버블을 wrap 왼쪽(하트 옆)에
  // 붙임. left=size+8 → 회전 꼬리 끝이 하트 오른쪽 끝에 닿음(≈8.5px 돌출).
  // 세로 중앙: top:'50%'(하트 중앙) + marginTop -13(버블 높이 26 절반).
  // left는 호출부에서 size+4 (size 가변이라 인라인 — 사용자 조정: 기준
  // size+8에서 왼쪽 4px). marginTop -14 = 세로중앙(-13) + 위 2px - 아래 1px.
  tooltip: {
    position: 'absolute',
    top: '50%',
    marginTop: -14,
    width: 200,
    alignItems: 'flex-start',
    zIndex: 10,
  },
});
