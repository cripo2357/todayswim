// 공통 아바타 — 원형 프로필 + 관계별 외곽선.
//
// 전역 프로필 테두리 정책(profile_border_policy 메모리): 아바타 외곽선 색 =
// 관계. 나=pd-byellow / 친구=pd-mint / 비친구=pd-gray. 모든 아바타 노출 공통.
//
// 사진 소스: 번들 아바타(AvatarId) / 업로드·소셜 URI / 없으면 기본 아이콘.
// shared_ui_library 메모리에 따라 단일 출처로 추출 — 신규 노출은 이걸 사용.
//
// 성능: 번들 아바타는 SVG 벡터 트리 대신 표시 size에 맞는 PNG 티어
// (sm64/md256/lg512, bundleAvatarPng)로 — 다수 동시 마운트 비용 회피
// (friends_scalability 메모리). 업로드 사진은 ≤28 소형 노출(맵 스택·mini)
// 시에만 thumbUri(64px) 우선해 512 디코드 회피, 실패 시 onError 로
// photoUri 1회 폴백. 친구행48·요청40·검색32는 본본(512)을 다운샘플 —
// 64 썸네일을 늘려 쓰는 회귀 방지. React.memo 로 마커/리스트 재렌더 절감.
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
  bundleAvatarPng,
  isBundleAvatar,
  type AvatarId,
} from '@/lib/avatars';
import { tokens } from '@/styles/tokens';

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
  /** 소형 노출용 64px 썸네일. size≤28일 때만 우선 사용, 실패 시 photoUri 폴백. */
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
  // 64px 썸네일은 ≤28 소형 노출(맵 스택·mini)에서만 우선 — 그보다 큰
  // 디스플레이(친구행48 등)에서 64를 늘리면 흐릿. 본본(512)을 RN 다운샘플.
  const useThumb = size <= 28 && !!thumbUri && !thumbFailed;
  const photoSrc = isBundle ? undefined : useThumb ? thumbUri : photoUri;

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
        // 번들 아바타: 표시 size에 맞는 PNG 티어(sm/md/lg) — SVG 벡터
        // 트리 다수 마운트 비용 회피(friends_scalability).
        <Image
          source={bundleAvatarPng(photoUri as AvatarId, size)}
          style={{ width: size, height: size }}
        />
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
