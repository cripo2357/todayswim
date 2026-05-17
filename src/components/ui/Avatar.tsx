// 공통 아바타 — 원형 프로필 + 관계별 외곽선.
//
// 전역 프로필 테두리 정책(profile_border_policy 메모리): 아바타 외곽선 색 =
// 관계. 나=pd-byellow / 친구=pd-mint / 비친구=pd-gray. 모든 아바타 노출 공통.
//
// 사진 소스: 번들 아바타(AvatarId) / 업로드·소셜 URI / 없으면 기본 아이콘.
// shared_ui_library 메모리에 따라 단일 출처로 추출 — 신규 노출은 이걸 사용.
//
// Figma get_design_context 가 반복 타임아웃이라 외곽선 두께는 디자인 컨텍스트
// 미확보. 기존 CalendarTab ptAvatar(1px)와 동급으로 20px에서도 보이게 1.5
// 기본값(호출부에서 borderWidth 로 조정 가능).

import React from 'react';
import {
  View,
  Image,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { User } from 'lucide-react-native';
import { BUNDLE_AVATARS, isBundleAvatar } from '@/lib/avatars';
import { tokens } from '@/styles/tokens';

export type AvatarRelation = 'me' | 'friend' | 'other';

const BORDER: Record<AvatarRelation, string> = {
  me: tokens.color.pdByellow,
  friend: tokens.color.pdMint,
  other: tokens.color.pdGray,
};

export function Avatar({
  photoUri,
  size,
  relation,
  borderWidth = 1.5,
  style,
}: {
  /** 번들 AvatarId / 업로드·소셜 URI / undefined(기본 아이콘) */
  photoUri?: string;
  size: number;
  relation: AvatarRelation;
  borderWidth?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const inner = size - borderWidth * 2;
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth,
          borderColor: BORDER[relation],
          backgroundColor: tokens.color.bgPaper,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      {isBundleAvatar(photoUri) ? (
        React.createElement(BUNDLE_AVATARS[photoUri], {
          width: inner,
          height: inner,
        })
      ) : photoUri ? (
        <Image
          source={{ uri: photoUri }}
          style={{ width: inner, height: inner }}
        />
      ) : (
        <User
          size={Math.round(inner * 0.6)}
          color={tokens.color.ink400}
          strokeWidth={2}
        />
      )}
    </View>
  );
}
