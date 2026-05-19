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
  | { status: 'ok'; url: string; thumbUrl?: string }
  | { status: 'skipped' }
  | { status: 'error' };

const BUCKET = 'avatars';

export async function uploadProfileAvatar(
  base64: string | null,
  thumbBase64?: string | null,
): Promise<UploadProfileAvatarResult> {
  if (!base64) return { status: 'error' };

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const uid = session?.user?.id;
  if (!uid) {
    console.warn('[avatar] skipped — 실 Supabase 세션 없음(uid 없음)');
    return { status: 'skipped' };
  }

  const path = `${uid}/avatar.jpg`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, decode(base64), {
      contentType: 'image/jpeg',
      upsert: true,
    });
  if (error) {
    // 진단: Storage 거부 실제 사유(RLS 위반 / permission denied / 버킷 등).
    console.warn(
      '[avatar] upload error:',
      (error as { message?: string }).message ?? error,
      '| path =',
      path,
    );
    // 진단: user 세션 토큰 클레임(시크릿 아님 — payload는 누구나 디코드 가능).
    // alg=HS256 이면 레거시 서명 / RS256·ES256 이면 신규 signing key.
    // role!=authenticated 또는 sub!=uid 또는 exp 만료면 그게 원인.
    try {
      const tok = session?.access_token ?? '';
      const [h, p] = tok.split('.');
      const b64 = (s: string) =>
        decodeURIComponent(
          escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))),
        );
      const hdr = JSON.parse(b64(h));
      const cl = JSON.parse(b64(p));
      console.warn(
        '[avatar] jwt diag — alg:',
        hdr.alg,
        '| role:',
        cl.role,
        '| sub==uid:',
        cl.sub === uid,
        '| aud:',
        cl.aud,
        '| iss:',
        cl.iss,
        '| expired:',
        typeof cl.exp === 'number' && cl.exp * 1000 < Date.now(),
      );
    } catch (e) {
      console.warn('[avatar] jwt diag 실패:', String(e));
    }
    return { status: 'error' };
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  if (!data?.publicUrl) return { status: 'error' };

  const v = Date.now();

  // 소형 노출용 64px 썸네일 — 같은 폴더에 avatar_thumb.jpg upsert.
  // 실패해도 본본 성공이면 ok(스택은 원본 폴백) — 가입/변경 막지 않음.
  let thumbUrl: string | undefined;
  if (thumbBase64) {
    const thumbPath = `${uid}/avatar_thumb.jpg`;
    const { error: tErr } = await supabase.storage
      .from(BUCKET)
      .upload(thumbPath, decode(thumbBase64), {
        contentType: 'image/jpeg',
        upsert: true,
      });
    if (!tErr) {
      const { data: tData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(thumbPath);
      if (tData?.publicUrl) thumbUrl = `${tData.publicUrl}?v=${v}`;
    }
  }

  // 경로 고정 → CDN이 옛 이미지를 캐싱하므로 버전 쿼리로 강제 갱신.
  return { status: 'ok', url: `${data.publicUrl}?v=${v}`, thumbUrl };
}
