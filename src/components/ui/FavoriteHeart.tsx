// 수영장 즐겨찾기 하트 (Figma 90:5963 / 163:10650 / 147:5326).
// 등록=채워진 하트 / 해제=외곽선 하트. 탭하면 토글 + 하트 아래 툴팁
// ("즐겨찾기 등록" / "즐겨찾기 해제") — 유일한 아래툴팁(Figma 171:6779).
// 유지 5초, 새 툴팁 노출 시 기존(다른 하트 포함) 즉시 숨김.

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
    hideActiveFavTip?.(); // 새 툴팁 노출 → 기존 즐겨찾기 툴팁 즉시 숨김
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
      {/* 아래툴팁 — 버블이 하트 아래, 삼각형이 버블 위에서 하트를 가리킴 */}
      {tip ? (
        <Tooltip
          label={tip}
          placement="bottom"
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
  // 하트 아래 가운데 — wrapper width 200 + marginLeft -100 + left=size/2
  // (좁은 부모서 폭 수렴해 라벨 깨지는 것 방지). top:'100%'+marginTop 4.
  // zIndex 10. (카드에선 textCol zIndex로 섬네일 위에 노출)
  tooltip: {
    position: 'absolute',
    top: '100%',
    marginTop: 4,
    marginLeft: -100,
    width: 200,
    zIndex: 10,
  },
});
