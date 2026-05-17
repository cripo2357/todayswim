// 프로필 사진 선택 공용 유틸 — 가입(ProfileImage)·내 정보(MyInfo) 공용.
// 갤러리에서 1:1 사진 선택 → 512px JPEG 리사이즈한 로컬 URI 반환.

import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

export type PickProfileImageResult =
  | {
      status: 'ok';
      uri: string;
      base64: string | null;
      /** 지도 스택 등 소형 노출용 64px JPEG base64 (avatar_thumb.jpg) */
      thumbBase64: string | null;
    }
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
    // 지도 스택은 20dp×최대29장×마커 비트맵 캡처라 512px 디코드가 느림.
    // 512 결과를 입력으로 64px JPEG q0.6 추가 산출(디코드 ~1/64).
    let thumbBase64: string | null = null;
    try {
      const thumb = await manipulateAsync(
        resized.uri,
        [{ resize: { width: 64, height: 64 } }],
        { compress: 0.6, format: SaveFormat.JPEG, base64: true },
      );
      thumbBase64 = thumb.base64 ?? null;
    } catch {
      thumbBase64 = null; // 썸네일 실패해도 본본은 진행(스택은 원본 폴백)
    }
    return {
      status: 'ok',
      uri: resized.uri,
      base64: resized.base64 ?? null,
      thumbBase64,
    };
  } catch {
    return { status: 'error' };
  }
}
