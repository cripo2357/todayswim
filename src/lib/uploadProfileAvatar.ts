// 프로필 아바타 Supabase Storage 업로드 — 가입/내 정보 공용.
//
// pickProfileImage()가 만든 512px JPEG base64를 'avatars' 버킷의
// '{auth.uid()}/avatar.jpg' 고정 경로에 upsert → 공개 URL 반환.
// 경로 고정 + upsert라 이전 아바타는 그 자리에서 덮어쓰기(누적/orphan 0).
//
// 실 Supabase 세션이 없으면(목 로그인 등) 'skipped' — 호출부는 로컬 URI를
// 유지(현행 동작, 무손실). OAuth 발효 시 자동으로 업로드 경로 활성화.
//
// 마이그레이션: supabase/migrations/0020_profile_avatars_storage.sql (push 필요).

import { decode } from 'base64-arraybuffer';
import { supabase } from './supabase';

export type UploadProfileAvatarResult =
  | { status: 'ok'; url: string }
  | { status: 'skipped' }
  | { status: 'error' };

const BUCKET = 'avatars';

export async function uploadProfileAvatar(
  base64: string | null,
): Promise<UploadProfileAvatarResult> {
  if (!base64) return { status: 'error' };

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const uid = session?.user?.id;
  if (!uid) return { status: 'skipped' };

  const path = `${uid}/avatar.jpg`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, decode(base64), {
      contentType: 'image/jpeg',
      upsert: true,
    });
  if (error) return { status: 'error' };

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  if (!data?.publicUrl) return { status: 'error' };

  // 경로 고정 → CDN이 옛 이미지를 캐싱하므로 버전 쿼리로 강제 갱신.
  return { status: 'ok', url: `${data.publicUrl}?v=${Date.now()}` };
}
