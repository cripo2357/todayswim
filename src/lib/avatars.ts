// 번들 프로필 아바타 — 원형 12종 (남 6 / 여 6).
// profile.photoUri 에 AvatarId('avatar-male-1' 등)를 저장하면 번들 아바타,
// 'file://' / 'http' 로 시작하면 사용자가 업로드한 사진으로 구분한다.
//
// 렌더는 PNG 2티어(thumb 64 / md 256)로 통일 — SVG 노출 경로는 전부 제거됨
// (2026-06-07). 번들 최대 표시 ~76px이라 md(256)면 3배 디스플레이까지 선명해
// SVG(원본 328KB·다수 마운트 비용)가 불필요했음. 모든 호출부는 bundleAvatarPng
// 또는 ui/Avatar 를 사용(BUNDLE_AVATARS SVG 맵 삭제).

import type { ImageSourcePropType } from 'react-native';
import type { Gender } from '@/store/profile';

export type AvatarId =
  | 'avatar-male-1' | 'avatar-male-2' | 'avatar-male-3'
  | 'avatar-male-4' | 'avatar-male-5' | 'avatar-male-6'
  | 'avatar-female-1' | 'avatar-female-2' | 'avatar-female-3'
  | 'avatar-female-4' | 'avatar-female-5' | 'avatar-female-6';

// 번들 아바타 다티어 PNG (SVG 벡터 트리 × 다수 마운트 비용 회피 —
// friends_scalability 메모리). repo SVG를 sharp로 래스터화.
// 치수 = "그 맥락 최대 표시 px × DPR(~3)": sm 64(thumb/) / md 256. (lg 512는
// 미사용이라 제거 2026-06-07 — 앱 최대 아바타 표시 ~76px이라 md로 충분.)
// scripts/avatar-thumbs.mjs 로 md 재생성(sm=기존 thumb/ 유지).
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

/** 표시 size(px)에 맞는 번들 PNG 티어 소스. sm≤28(맵 스택 20·mini 24) /
 *  md(그 외 — 검색 32·요청 40·친구행 48·프로필 76·픽커 116 등).
 *  번들 아바타의 유일한 렌더 경로(SVG 맵 제거 2026-06-07) — 모든 노출이 이걸
 *  쓰거나 ui/Avatar 경유. 임계값 ≤64는 회귀였음 — 친구행48이 sm(64)로
 *  떨어져 3x 디스플레이에서 흐릿했음. 친구행은 md(256)가 정상 티어. */
export function bundleAvatarPng(
  id: AvatarId,
  size: number,
): ImageSourcePropType {
  if (size <= 28) return BUNDLE_AVATAR_THUMBS[id];
  // md(256)면 앱 최대 표시(프로필 ~76px=물리 ~228)까지 선명. lg(512)는 미사용이라 제거(2026-06-07).
  return BUNDLE_AVATAR_MD[id];
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
  return !!photoUri && photoUri in BUNDLE_AVATAR_MD;
}
