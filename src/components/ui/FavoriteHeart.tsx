// 수영장 즐겨찾기 하트 (Figma 90:5963 / 163:10650 / 147:5326).
// 등록=채워진 하트 / 해제=외곽선 하트. 탭하면 토글 + 하트 위 툴팁
// ("즐겨찾기 등록" / "즐겨찾기 해제") 2초 노출 후 자동 숨김.

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
      {/* 공통 Tooltip 라이브러리 표준(PoolBottomCard/PoolListScreen과 동일):
          placement='top' — 버블이 하트 위, 아래 방향 삼각형(꼬리)이 하트를
          가리킴. 위치 규칙도 라이브러리 표준(bottom:'100%' + width200 +
          ml-100 + left=대상중앙)으로 styles.tooltip에서. */}
      {tip ? (
        <Tooltip
          label={tip}
          placement="top"
          style={[styles.tooltip, { left: size / 2 }]}
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
  // 공통 Tooltip 위치 — 라이브러리 표준(PoolBottomCard/PoolListScreen과
  // 완전 동일): 하트 위 가운데. bottom:'100%' + marginBottom 4(gap) +
  // wrapper width 200 + marginLeft -100 + left=대상중앙(size/2), zIndex 10.
  // placement='top'이라 삼각형(꼬리)이 버블 하단에서 하트를 가리킴(아래 방향).
  // elevation은 Android halo라 미사용.
  tooltip: {
    position: 'absolute',
    bottom: '100%',
    marginBottom: 4,
    marginLeft: -100,
    width: 200,
    zIndex: 10,
  },
});
