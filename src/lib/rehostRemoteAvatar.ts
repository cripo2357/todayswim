// 외부(소셜 제공자 CDN) 프로필 사진을 우리 Supabase Storage 로 재호스팅.
//
// 배경: 카카오/구글 소셜 가입자의 photo_uri 는 제공자 CDN URL(예:
// k.kakaocdn.net/.../img_110x110.jpg)이 그대로 저장돼 왔다. 제공자가 사진을
// 바꾸거나 URL 이 회전하면 깨지고, 썸네일도 없어 소형 노출에서 원본을 로드한다.
// 업로드 사진과 동일하게 우리 Storage(avatars/{uid}/avatar.jpg)로 옮겨 통일·내구.
//
// 동작: 원격 URL → manipulateAsync 로 JPEG 재인코딩(md, 업스케일 방지 위해
// 리사이즈 없이 native 해상도 유지 — 소셜 썸네일은 보통 작다) + 64px thumb 산출
// → uploadProfileAvatar 로 avatars/{uid}/ 에 upsert. 실패 시 호출부가 원 URL 폴백.

import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import {
  uploadProfileAvatar,
  type UploadProfileAvatarResult,
} from './uploadProfileAvatar';

export async function rehostRemoteAvatar(
  remoteUrl: string,
): Promise<UploadProfileAvatarResult> {
  try {
    // md — 업스케일 방지로 resize 없이 재인코딩만(EXIF 제거 부수효과 포함).
    const md = await manipulateAsync(remoteUrl, [], {
      compress: 0.85,
      format: SaveFormat.JPEG,
      base64: true,
    });
    if (!md.base64) return { status: 'error' };

    // thumb 64px — 소형 노출(지도 스택 등). 실패해도 md 성공이면 업로드 진행.
    let thumbBase64: string | null = null;
    try {
      const thumb = await manipulateAsync(
        md.uri,
        [{ resize: { width: 64 } }],
        { compress: 0.6, format: SaveFormat.JPEG, base64: true },
      );
      thumbBase64 = thumb.base64 ?? null;
    } catch {
      thumbBase64 = null;
    }

    return await uploadProfileAvatar(md.base64, thumbBase64);
  } catch {
    return { status: 'error' };
  }
}
