// 공통 아바타 — 원형 프로필 + 관계별 외곽선.
//
// 전역 프로필 테두리 정책(profile_border_policy 메모리): 아바타 외곽선 색 =
// 관계. 나=pd-byellow / 친구=pd-mint / 비친구=pd-gray. 모든 아바타 노출 공통.
//
// 사진 소스: 아바타 URL(번들·업로드·소셜) / 레거시 번들 ID / 없으면 기본 아이콘.
// shared_ui_library 메모리에 따라 단일 출처로 추출 — 신규 노출은 이걸 사용.
//
// 성능·통일: 모든 아바타를 resolveAvatarUri 로 단일 URI 정규화(번들/업로드 분기
// 없음). 번들 아바타도 Storage 호스팅(avatar_uri_handling·profile_avatar_storage
// 메모리). ≤28 소형 노출(맵 스택·mini)만 thumbUri(64px) 우선해 큰 이미지 디코드
// 회피, 실패 시 onError 로 원본 1회 폴백. 친구행48·요청40·검색32는 본본(256/512)
// 다운샘플. React.memo 로 마커/리스트 재렌더 절감.
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
import { resolveAvatarUri } from '@/lib/avatars';
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

  // 모든 아바타(번들·업로드·소셜·레거시ID)를 단일 URI 로 정규화 — 분기 없음.
  // 64px 썸네일은 ≤28 소형 노출(맵 스택·mini)에서만 우선, 실패 시 원본 폴백.
  const photoSrc = resolveAvatarUri(photoUri, {
    thumbUri: thumbFailed ? undefined : thumbUri,
    size,
  });

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
      {photoSrc ? (
        <Image
          source={{ uri: photoSrc }}
          style={{ width: size, height: size }}
          resizeMode="cover"
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
