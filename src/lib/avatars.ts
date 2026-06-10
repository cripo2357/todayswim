// 번들 프로필 아바타 — 원형 12종 (남 6 / 여 6).
//
// 이미지 호스팅 통일(2026-06-07): 번들 아바타도 업로드 사진과 똑같이 Supabase
// Storage(`avatars/bundle/{id}.png` md256 + `{id}_64.png` thumb64)에 산다.
// profiles.photo_uri 에는 항상 **URL** 을 저장(업로드 사진과 동일) — 번들/업로드
// 구분 분기 없음. AvatarId 는 가입 시 기본 아바타를 "어느 12개 중 하나"로 고르는
// 선택 열거에만 쓰고, 저장·렌더는 전부 URL.
//
// resolveAvatarUri 가 단일 정규화 지점: URL 은 통과, 레거시 'avatar-*' ID(옛 행)는
// 런타임에 Storage URL 로 변환(안전망). 모든 렌더 호출부는 이 헬퍼 또는 ui/Avatar
// 를 거치므로 흩어진 isBundleAvatar 분기가 없다.

import type { Gender } from '@/store/profile';

export type AvatarId =
  | 'avatar-male-1' | 'avatar-male-2' | 'avatar-male-3'
  | 'avatar-male-4' | 'avatar-male-5' | 'avatar-male-6'
  | 'avatar-female-1' | 'avatar-female-2' | 'avatar-female-3'
  | 'avatar-female-4' | 'avatar-female-5' | 'avatar-female-6';

const MALE_AVATAR_IDS: AvatarId[] = [
  'avatar-male-1', 'avatar-male-2', 'avatar-male-3',
  'avatar-male-4', 'avatar-male-5', 'avatar-male-6',
];
const FEMALE_AVATAR_IDS: AvatarId[] = [
  'avatar-female-1', 'avatar-female-2', 'avatar-female-3',
  'avatar-female-4', 'avatar-female-5', 'avatar-female-6',
];
const ALL_AVATAR_IDS: AvatarId[] = [...MALE_AVATAR_IDS, ...FEMALE_AVATAR_IDS];
const BUNDLE_AVATAR_ID_SET = new Set<string>(ALL_AVATAR_IDS);

// Storage 공개 URL 베이스 — 현재 환경(EXPO_PUBLIC_SUPABASE_URL)에서 런타임 빌드라
// dev/prod 자동 분기(URL 을 코드/마이그레이션에 박지 않음 — pool_photo_url_dev_baked).
const STORAGE_BASE = process.env.EXPO_PUBLIC_SUPABASE_URL
  ? `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/bundle`
  : '';

/** 번들 아바타 md(256) Storage URL. */
export function bundleAvatarUrl(id: AvatarId): string {
  return `${STORAGE_BASE}/${id}.png`;
}
/** 번들 아바타 thumb(64) Storage URL — size≤28 소형 노출용. */
export function bundleAvatarThumbUrl(id: AvatarId): string {
  return `${STORAGE_BASE}/${id}_64.png`;
}

/** 앱 시작 시 캐시 워밍용 — 전 번들 아바타(thumb+md) URL 목록. Image.prefetch 대상. */
export function allBundleAvatarUrls(): string[] {
  return ALL_AVATAR_IDS.flatMap((id) => [bundleAvatarThumbUrl(id), bundleAvatarUrl(id)]);
}

/** 레거시 번들 ID('avatar-male-1') 판별 — 옛 photo_uri 행 안전망용. */
export function isBundleAvatar(photoUri: string | undefined): photoUri is AvatarId {
  return !!photoUri && BUNDLE_AVATAR_ID_SET.has(photoUri);
}

/** 외부(소셜 제공자 CDN) 사진 URL 판별 — 우리 Storage(/avatars/)도 번들 ID도
 *  아닌 http(s) URL. 가입 시 우리 Storage 로 재호스팅할 대상(카카오/구글 CDN).
 *  우리 업로드/번들 URL 은 항상 '/avatars/' 를 포함하므로 그걸로 구분. */
export function isExternalAvatarUrl(value: string | undefined): boolean {
  return !!value && /^https?:\/\//.test(value) && !value.includes('/avatars/');
}

/** 아바타 표시용 이미지 URI 단일 정규화 지점.
 *  - URL(업로드·소셜·번들) → 그대로(소형이고 thumbUri 있으면 thumb 우선).
 *  - 레거시 번들 ID('avatar-*') → Storage URL 로 변환(size≤28 면 thumb).
 *  모든 렌더 호출부가 이걸 거쳐 번들/업로드 분기를 없앤다. */
export function resolveAvatarUri(
  value: string | undefined,
  opts?: { thumbUri?: string; size?: number },
): string | undefined {
  if (!value) return undefined;
  const small = (opts?.size ?? 999) <= 28;
  // 레거시 번들 ID('avatar-*') → Storage URL.
  if (BUNDLE_AVATAR_ID_SET.has(value)) {
    return small ? bundleAvatarThumbUrl(value as AvatarId) : bundleAvatarUrl(value as AvatarId);
  }
  // 번들 Storage URL: 소형이면 _64 썸네일로 자동 전환(데이터가 thumb 안 들고와도
  // 64 디코드 유지 — 맵 스택 등). startup prefetch 가 둘 다 캐시 워밍.
  if (
    small &&
    value.includes('/avatars/bundle/') &&
    value.endsWith('.png') &&
    !value.endsWith('_64.png')
  ) {
    return value.replace(/\.png$/, '_64.png');
  }
  return small && opts?.thumbUri ? opts.thumbUri : value;
}

export function avatarsForGender(gender: Gender): AvatarId[] {
  return gender === 'female' ? FEMALE_AVATAR_IDS : MALE_AVATAR_IDS;
}

/** 성별에 맞는 번들 아바타 중 하나를 기본값으로 — 가입마다 다르게 보이도록 랜덤 픽. */
export function defaultAvatarForGender(gender: Gender): AvatarId {
  const ids = avatarsForGender(gender);
  return ids[Math.floor(Math.random() * ids.length)];
}

/** 가입 기본 아바타를 저장용 URL 쌍으로 — photo_uri(md)/photo_thumb_uri(thumb). */
export function defaultAvatarUrls(gender: Gender): { url: string; thumbUrl: string } {
  const id = defaultAvatarForGender(gender);
  return { url: bundleAvatarUrl(id), thumbUrl: bundleAvatarThumbUrl(id) };
}
