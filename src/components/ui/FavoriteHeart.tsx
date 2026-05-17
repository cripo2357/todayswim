// 수영장 즐겨찾기 하트 (Figma 90:5963 / 163:10650 / 147:5326).
// 등록=채워진 하트 / 해제=외곽선 하트. 탭하면 토글 + 하트 오른쪽 툴팁
// ("즐겨찾기 등록" / "즐겨찾기 해제", Figma 169:5827/103:2598) 2초 후 숨김.

import React from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Tooltip } from '@/components/ui/Tooltip';
import { useFavorites } from '@/store/favorites';
import HeartFilled from '@assets/icons/heart-filled.svg';
import HeartOutline from '@assets/icons/heart-outline.svg';

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

  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const onPress = async () => {
    const nowFav = await toggle(poolId);
    setTip(nowFav ? '즐겨찾기 등록' : '즐겨찾기 해제');
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setTip(null), 2000);
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
  // 공통 Tooltip 위치 — 하트 오른쪽, 세로 중앙. left는 호출부에서
  // size+4(하트 오른쪽 끝 + 꼬리 gap, 숫자라 폭 수렴 없음). 세로 중앙:
  // top:'50%'(하트 중앙) + marginTop -13(버블 높이 26의 절반).
  // 버블은 콘텐츠 크기(numberOfLines 1 + flexShrink 0). zIndex 10.
  // elevation은 Android halo라 미사용.
  tooltip: {
    position: 'absolute',
    top: '50%',
    marginTop: -13,
    zIndex: 10,
  },
});
