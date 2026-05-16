// 프로필 사진 선택 공용 유틸 — 가입(ProfileImage)·내 정보(MyInfo) 공용.
// 갤러리에서 1:1 사진 선택 → 512px JPEG 리사이즈한 로컬 URI 반환.

import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

export type PickProfileImageResult =
  | { status: 'ok'; uri: string; base64: string | null }
  | { status: 'canceled' }
  | { status: 'denied' }
  | { status: 'error' };

export async function pickProfileImage(): Promise<PickProfileImageResult> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return { status: 'denied' };

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });
  if (result.canceled) return { status: 'canceled' };

  const asset = result.assets[0];
  if (!asset?.uri) return { status: 'error' };

  try {
    // 원본이 수 MB일 수 있어 프로필용 512px / JPEG q0.72로 축소.
    // 1:1 크롭(allowsEditing+aspect)된 입력이라 결과는 ~512x512, 장당 ≤~80KB.
    // base64는 Storage 업로드(uploadProfileAvatar)용 — 재인코딩으로 EXIF도 제거됨.
    const resized = await manipulateAsync(
      asset.uri,
      [{ resize: { width: 512 } }],
      { compress: 0.72, format: SaveFormat.JPEG, base64: true },
    );
    return { status: 'ok', uri: resized.uri, base64: resized.base64 ?? null };
  } catch {
    return { status: 'error' };
  }
}
