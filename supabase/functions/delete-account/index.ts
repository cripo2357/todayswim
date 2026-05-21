// Pool's day — 회원 탈퇴 (Supabase Edge Function).
//
// 클라이언트는 service_role 권한이 없어 auth.users 삭제 불가 → 이 함수가 단일
// 게이트. 호출자는 본인 세션의 JWT 를 Authorization 헤더로 넘긴다.
//
// 요청:  POST /functions/v1/delete-account
//        헤더: Authorization: Bearer <user_jwt>
// 응답:  { deleted: true, uid }
//        실패 시 { error: "..." } + 4xx/5xx
//
// 처리 순서 (실패해도 후속은 계속 — best-effort 정리):
//   1) JWT 검증으로 호출자 신원(uid) 확인
//   2) Storage `avatars/{uid}/` 파일 모두 삭제 (avatar.jpg, avatar_thumb.jpg)
//   3) profiles row 삭제 (auth_uid = uid)
//      → CASCADE 로 donations 자동 삭제 (0069 FK)
//      → donation_payments.profile_id 는 ON DELETE SET NULL 로 보존 (0070, 회계 5년)
//   4) auth.users row 삭제 (admin API)
//
// 보존(즉시 삭제 X):
//   - notifications (탈퇴 후 90일 보존 — 약관 §3, 재가입 부정이용 방지)
//   - profile_nicknames (탈퇴 후 90일 보존 — 닉네임 squat 방지)
//   - donation_payments (회계·세무 5년 — 국세기본법)
//   - pool_submissions / schedule_submissions (익명화 후 공익적 보존)
//
// ※ 90일 후 자동 파기는 별도 cron/예약 함수가 필요(P3 후속).

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  if (!SUPABASE_URL || !ANON_KEY || !SERVICE_ROLE_KEY) {
    return jsonResponse(
      {
        error:
          'Server config missing: SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY',
      },
      500,
    );
  }

  // ─── 1) JWT 검증 ─────────────────────────────────────────────
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return jsonResponse({ error: 'Authorization header required' }, 401);
  }

  // anon 키 + 호출자 JWT 로 client 만들어 본인 세션 확인.
  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const {
    data: { user },
    error: userErr,
  } = await userClient.auth.getUser();
  if (userErr || !user) {
    return jsonResponse({ error: 'Invalid session' }, 401);
  }

  const uid = user.id;

  // ─── 2~4) service_role admin client 로 본격 삭제 ────────────
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const errors: Array<{ step: string; message: string }> = [];

  // 2) Storage — avatars/{uid}/ 폴더 파일 일괄 삭제.
  //    list() → remove([paths]) 두 단계. 본인 폴더라 권한 OK(service_role).
  try {
    const { data: files, error: listErr } = await admin.storage
      .from('avatars')
      .list(uid);
    if (listErr) {
      errors.push({ step: 'storage.list', message: listErr.message });
    } else if (files && files.length > 0) {
      const paths = files.map((f) => `${uid}/${f.name}`);
      const { error: removeErr } = await admin.storage
        .from('avatars')
        .remove(paths);
      if (removeErr) {
        errors.push({ step: 'storage.remove', message: removeErr.message });
      }
    }
  } catch (e) {
    errors.push({ step: 'storage', message: String(e) });
  }

  // 3a) Tombstone — profile DELETE 전에 user_code + nicknames 보존(P3-B.2).
  //     90일 후 cleanup_expired_data() 가 이 tombstone 으로 notifications +
  //     profile_nicknames 일괄 파기. 약관·개인정보처리방침 §3 의 "탈퇴 후 90일"
  //     정확 적용.
  try {
    const { data: prof } = await admin
      .from('profiles')
      .select('id, nickname')
      .eq('auth_uid', uid)
      .maybeSingle();
    const profileRow = prof as { id: string; nickname: string | null } | null;
    if (profileRow?.id) {
      const { error: tombErr } = await admin
        .from('deleted_users')
        .upsert(
          {
            user_code: profileRow.id,
            nicknames: profileRow.nickname ? [profileRow.nickname] : [],
          },
          { onConflict: 'user_code' },
        );
      if (tombErr) {
        errors.push({ step: 'tombstone', message: tombErr.message });
      }
    }
  } catch (e) {
    errors.push({ step: 'tombstone', message: String(e) });
  }

  // 3b) profiles 삭제 → CASCADE 로 donations 자동 삭제.
  //     auth_uid 컬럼은 0059 마이그레이션에서 추가됨.
  try {
    const { error: profileErr } = await admin
      .from('profiles')
      .delete()
      .eq('auth_uid', uid);
    if (profileErr) {
      errors.push({ step: 'profiles.delete', message: profileErr.message });
    }
  } catch (e) {
    errors.push({ step: 'profiles', message: String(e) });
  }

  // 4) auth.users row 삭제 — admin API.
  try {
    const { error: authErr } = await admin.auth.admin.deleteUser(uid);
    if (authErr) {
      errors.push({ step: 'auth.deleteUser', message: authErr.message });
    }
  } catch (e) {
    errors.push({ step: 'auth', message: String(e) });
  }

  // 일부 단계 실패라도 핵심(auth.users 삭제) 이 성공했으면 성공으로 본다.
  // 핵심 실패 시 500.
  const authStepFailed = errors.some((e) => e.step.startsWith('auth'));
  if (authStepFailed) {
    return jsonResponse(
      { deleted: false, uid, errors },
      500,
    );
  }

  return jsonResponse({ deleted: true, uid, errors });
});
