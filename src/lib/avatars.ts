// 번들 프로필 아바타 — 64x64 원형 SVG 12종 (남 6 / 여 6).
// profile.photoUri 에 AvatarId('avatar-male-1' 등)를 저장하면 번들 아바타,
// 'file://' / 'http' 로 시작하면 사용자가 업로드한 사진으로 구분한다.

import type { FC } from 'react';
import type { SvgProps } from 'react-native-svg';
import type { ImageSourcePropType } from 'react-native';
import type { Gender } from '@/store/profile';

import AvatarMale1 from '@assets/avatars/avatar-male-1.svg';
import AvatarMale2 from '@assets/avatars/avatar-male-2.svg';
import AvatarMale3 from '@assets/avatars/avatar-male-3.svg';
import AvatarMale4 from '@assets/avatars/avatar-male-4.svg';
import AvatarMale5 from '@assets/avatars/avatar-male-5.svg';
import AvatarMale6 from '@assets/avatars/avatar-male-6.svg';
import AvatarFemale1 from '@assets/avatars/avatar-female-1.svg';
import AvatarFemale2 from '@assets/avatars/avatar-female-2.svg';
import AvatarFemale3 from '@assets/avatars/avatar-female-3.svg';
import AvatarFemale4 from '@assets/avatars/avatar-female-4.svg';
import AvatarFemale5 from '@assets/avatars/avatar-female-5.svg';
import AvatarFemale6 from '@assets/avatars/avatar-female-6.svg';

export type AvatarId =
  | 'avatar-male-1' | 'avatar-male-2' | 'avatar-male-3'
  | 'avatar-male-4' | 'avatar-male-5' | 'avatar-male-6'
  | 'avatar-female-1' | 'avatar-female-2' | 'avatar-female-3'
  | 'avatar-female-4' | 'avatar-female-5' | 'avatar-female-6';

export const BUNDLE_AVATARS: Record<AvatarId, FC<SvgProps>> = {
  'avatar-male-1': AvatarMale1,
  'avatar-male-2': AvatarMale2,
  'avatar-male-3': AvatarMale3,
  'avatar-male-4': AvatarMale4,
  'avatar-male-5': AvatarMale5,
  'avatar-male-6': AvatarMale6,
  'avatar-female-1': AvatarFemale1,
  'avatar-female-2': AvatarFemale2,
  'avatar-female-3': AvatarFemale3,
  'avatar-female-4': AvatarFemale4,
  'avatar-female-5': AvatarFemale5,
  'avatar-female-6': AvatarFemale6,
};

// 번들 아바타 다티어 PNG (SVG 벡터 트리 × 다수 마운트 비용 회피 —
// friends_scalability 메모리). repo SVG를 sharp로 래스터화.
// 치수 = "그 맥락 최대 표시 px × DPR(~3)": sm 64(thumb/) / md 256 / lg 512.
// scripts/avatar-thumbs.mjs 로 md/lg 재생성(sm=기존 thumb/ 유지).
export const BUNDLE_AVATAR_THUMBS: Record<AvatarId, ImageSourcePropType> = {
  'avatar-male-1': require('@assets/avatars/thumb/avatar-male-1.png'),
  'avatar-male-2': require('@assets/avatars/thumb/avatar-male-2.png'),
  'avatar-male-3': require('@assets/avatars/thumb/avatar-male-3.png'),
  'avatar-male-4': require('@assets/avatars/thumb/avatar-male-4.png'),
  'avatar-male-5': require('@assets/avatars/thumb/avatar-male-5.png'),
  'avatar-male-6': require('@assets/avatars/thumb/avatar-male-6.png'),
  'avatar-female-1': require('@assets/avatars/thumb/avatar-female-1.png'),
  'avatar-female-2': require('@assets/avatars/thumb/avatar-female-2.png'),
  'avatar-female-3': require('@assets/avatars/thumb/avatar-female-3.png'),
  'avatar-female-4': require('@assets/avatars/thumb/avatar-female-4.png'),
  'avatar-female-5': require('@assets/avatars/thumb/avatar-female-5.png'),
  'avatar-female-6': require('@assets/avatars/thumb/avatar-female-6.png'),
};

export const BUNDLE_AVATAR_MD: Record<AvatarId, ImageSourcePropType> = {
  'avatar-male-1': require('@assets/avatars/md/avatar-male-1.png'),
  'avatar-male-2': require('@assets/avatars/md/avatar-male-2.png'),
  'avatar-male-3': require('@assets/avatars/md/avatar-male-3.png'),
  'avatar-male-4': require('@assets/avatars/md/avatar-male-4.png'),
  'avatar-male-5': require('@assets/avatars/md/avatar-male-5.png'),
  'avatar-male-6': require('@assets/avatars/md/avatar-male-6.png'),
  'avatar-female-1': require('@assets/avatars/md/avatar-female-1.png'),
  'avatar-female-2': require('@assets/avatars/md/avatar-female-2.png'),
  'avatar-female-3': require('@assets/avatars/md/avatar-female-3.png'),
  'avatar-female-4': require('@assets/avatars/md/avatar-female-4.png'),
  'avatar-female-5': require('@assets/avatars/md/avatar-female-5.png'),
  'avatar-female-6': require('@assets/avatars/md/avatar-female-6.png'),
};

export const BUNDLE_AVATAR_LG: Record<AvatarId, ImageSourcePropType> = {
  'avatar-male-1': require('@assets/avatars/lg/avatar-male-1.png'),
  'avatar-male-2': require('@assets/avatars/lg/avatar-male-2.png'),
  'avatar-male-3': require('@assets/avatars/lg/avatar-male-3.png'),
  'avatar-male-4': require('@assets/avatars/lg/avatar-male-4.png'),
  'avatar-male-5': require('@assets/avatars/lg/avatar-male-5.png'),
  'avatar-male-6': require('@assets/avatars/lg/avatar-male-6.png'),
  'avatar-female-1': require('@assets/avatars/lg/avatar-female-1.png'),
  'avatar-female-2': require('@assets/avatars/lg/avatar-female-2.png'),
  'avatar-female-3': require('@assets/avatars/lg/avatar-female-3.png'),
  'avatar-female-4': require('@assets/avatars/lg/avatar-female-4.png'),
  'avatar-female-5': require('@assets/avatars/lg/avatar-female-5.png'),
  'avatar-female-6': require('@assets/avatars/lg/avatar-female-6.png'),
};

/** 표시 size(px)에 맞는 번들 PNG 티어 소스. sm≤64 / md≤160 / lg.
 *  SVG(BUNDLE_AVATARS)는 더 이상 노출 경로 아님 — 다수 마운트 비용 회피. */
export function bundleAvatarPng(
  id: AvatarId,
  size: number,
): ImageSourcePropType {
  if (size <= 64) return BUNDLE_AVATAR_THUMBS[id];
  if (size <= 160) return BUNDLE_AVATAR_MD[id];
  return BUNDLE_AVATAR_LG[id];
}

const MALE_AVATAR_IDS: AvatarId[] = [
  'avatar-male-1', 'avatar-male-2', 'avatar-male-3',
  'avatar-male-4', 'avatar-male-5', 'avatar-male-6',
];
const FEMALE_AVATAR_IDS: AvatarId[] = [
  'avatar-female-1', 'avatar-female-2', 'avatar-female-3',
  'avatar-female-4', 'avatar-female-5', 'avatar-female-6',
];

export function avatarsForGender(gender: Gender): AvatarId[] {
  return gender === 'female' ? FEMALE_AVATAR_IDS : MALE_AVATAR_IDS;
}

/** 성별에 맞는 번들 아바타 중 하나를 기본값으로 — 가입마다 다르게 보이도록 랜덤 픽. */
export function defaultAvatarForGender(gender: Gender): AvatarId {
  const ids = avatarsForGender(gender);
  return ids[Math.floor(Math.random() * ids.length)];
}

export function isBundleAvatar(photoUri: string | undefined): photoUri is AvatarId {
  return !!photoUri && photoUri in BUNDLE_AVATARS;
}
