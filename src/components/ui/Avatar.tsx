// 공통 아바타 — 원형 프로필 + 관계별 외곽선.
//
// 전역 프로필 테두리 정책(profile_border_policy 메모리): 아바타 외곽선 색 =
// 관계. 나=pd-byellow / 친구=pd-mint / 비친구=pd-gray. 모든 아바타 노출 공통.
//
// 사진 소스: 번들 아바타(AvatarId) / 업로드·소셜 URI / 없으면 기본 아이콘.
// shared_ui_library 메모리에 따라 단일 출처로 추출 — 신규 노출은 이걸 사용.
//
// 성능: 지도 스택처럼 소형·다수 노출은 thumbUri(64px avatar_thumb.jpg)를
// 우선 사용해 512px 디코드를 피한다. 썸네일 로드 실패(레거시·미존재)면
// onError 로 원본(photoUri) 1회 폴백. React.memo 로 마커 캡처 재렌더 절감.
//
// 외곽선 두께는 Figma 173-13735 가 border-0 이나 전역 정책 우선 — 얇게 1.5
// 기본(호출부 borderWidth 로 조정/0 가능).

import React from 'react';
import {
  View,
  Image,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { User } from 'lucide-react-native';
import {
  BUNDLE_AVATARS,
  BUNDLE_AVATAR_THUMBS,
  isBundleAvatar,
  type AvatarId,
} from '@/lib/avatars';
import { tokens } from '@/styles/tokens';

// 번들 PNG 래스터 네이티브 크기. 이 이하면 PNG(가벼움), 초과면 SVG(선명).
const BUNDLE_RASTER_MAX = 64;

export type AvatarRelation = 'me' | 'friend' | 'other';

const BORDER: Record<AvatarRelation, string> = {
  me: tokens.color.pdByellow,
  friend: tokens.color.pdMint,
  other: tokens.color.pdGray,
};

function AvatarBase({
  photoUri,
  thumbUri,
  size,
  relation,
  borderWidth = 1.5,
  style,
}: {
  /** 번들 AvatarId / 업로드·소셜 URI / undefined(기본 아이콘) */
  photoUri?: string;
  /** 소형 노출용 64px 썸네일. 실패 시 photoUri 폴백. */
  thumbUri?: string;
  size: number;
  relation: AvatarRelation;
  borderWidth?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const [thumbFailed, setThumbFailed] = React.useState(false);
  // 소스가 바뀌면 폴백 상태 초기화(뷰 재사용 대비).
  React.useEffect(() => {
    setThumbFailed(false);
  }, [thumbUri, photoUri]);

  const isBundle = isBundleAvatar(photoUri);
  const photoSrc = isBundle
    ? undefined
    : thumbUri && !thumbFailed
      ? thumbUri
      : photoUri;

  // Figma 173-13735: 이미지는 원을 꽉 채우고(inset-0 size-full), 관계 링은
  // 이미지를 줄이지 않는 오버레이로. 그래야 -2px 겹침이 실제로 보인다.
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: tokens.color.bgPaper,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {isBundle ? (
        size <= BUNDLE_RASTER_MAX ? (
          // 소형(스택 등): SVG 벡터 트리 대신 64px PNG — 캡처/렌더 경량.
          <Image
            source={BUNDLE_AVATAR_THUMBS[photoUri as AvatarId]}
            style={{ width: size, height: size }}
          />
        ) : (
          React.createElement(BUNDLE_AVATARS[photoUri as AvatarId], {
            width: size,
            height: size,
          })
        )
      ) : photoSrc ? (
        <Image
          source={{ uri: photoSrc }}
          style={{ width: size, height: size }}
          onError={() => {
            // 썸네일 실패(레거시·미존재) → 원본으로 1회 폴백.
            if (thumbUri && !thumbFailed) setThumbFailed(true);
          }}
        />
      ) : (
        <View
          style={{
            width: size,
            height: size,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <User
            size={Math.round(size * 0.55)}
            color={tokens.color.ink400}
            strokeWidth={2}
          />
        </View>
      )}
      {borderWidth > 0 ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            borderRadius: size / 2,
            borderWidth,
            borderColor: BORDER[relation],
          }}
        />
      ) : null}
    </View>
  );
}

/** 다수 소형 노출(지도 스택)에서 마커 비트맵 캡처 재렌더 절감. */
export const Avatar = React.memo(AvatarBase);
