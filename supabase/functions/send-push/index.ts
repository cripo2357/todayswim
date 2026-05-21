// Pool's day — OS 푸시 발송 (Supabase Edge Function, P3-A4 + B.1 + 보안 강화).
//
// 호출자: 인증된 사용자(JWT 필수, P3 2026-05-22 강화) 또는 운영자(service_role).
// 클라이언트는 dispatchMessage → notifications insert 직후 자동 호출.
//
// 요청:  POST /functions/v1/send-push
//        헤더: Authorization: Bearer <user_jwt | service_role_key>
//        body: { user_ids: string[], title: string, body?: string, data?: object }
// 응답:  { sent: number, failed: number, dead: string[] }
//        dead = DeviceNotRegistered 토큰들 (자동 push_tokens DELETE)
//
// 인증 정책:
//   - Authorization 헤더 필수. 없으면 401.
//   - user JWT 또는 service_role 둘 다 허용.
//   - user JWT 검증 통과한 caller 는 누구든 user_ids 지정 가능 (Phase 3 한정 정책).
//   - 추후 강화: caller 가 친구 관계인 user_id 만 허용 (friendships JOIN),
//     또는 dispatchMessage 가 DB trigger 로 이관되어 클라가 push 직접 호출 불필요.
//
// 발송 흐름:
//   1) JWT 검증 (P3 2026-05-22 추가)
//   2) push_tokens 에서 user_ids 의 토큰 목록 fetch
//   3) Expo Push API (https://exp.host/--/api/v2/push/send) 에 batch POST
//      (Expo는 100개 chunk 권장)
//   4) 응답에서 DeviceNotRegistered → push_tokens 에서 해당 토큰 삭제
//
// Expo Push Service 는 자체 큐 + retry + FCM/APNs 프록시 처리. 우리는 그
// 위에 얇은 wrapper. 실 운영 시 rate limit (600 req/sec, 100 토큰/req) 주의.

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const CHUNK_SIZE = 100;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  user_ids?: string[];
  title?: string;
  body?: string;
  data?: Record<string, unknown>;
}

interface ExpoPushTicket {
  status: 'ok' | 'error';
  id?: string;
  message?: string;
  details?: { error?: string };
}

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
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

  // ─── 인증 검증 (P3 2026-05-22 강화) ─────────────────────────
  // Authorization 헤더 필수. user JWT 또는 service_role 키 모두 통과.
  // - user JWT: supabase.auth.getUser() 로 검증, 통과 시 caller 인증 확인
  // - service_role: 운영자 직접 호출 (Dashboard / 내부 RPC)
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return jsonResponse({ error: 'Authorization header required' }, 401);
  }

  // service_role 헤더면 그대로 통과 (운영자/내부 호출).
  // 그 외 user JWT 면 검증.
  const bearerToken = authHeader.replace(/^Bearer\s+/i, '').trim();
  const isServiceRole = bearerToken === SERVICE_ROLE_KEY;
  if (!isServiceRole) {
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const {
      data: { user },
      error: userErr,
    } = await userClient.auth.getUser();
    if (userErr || !user) {
      return jsonResponse({ error: 'Invalid or expired session' }, 401);
    }
    // user JWT 통과 → 호출 허용 (caller.id = user.id).
    // 추후 강화: user_ids 가 caller 의 친구·이력 범위 내인지 검증.
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const userIds = Array.isArray(body.user_ids) ? body.user_ids : [];
  const title = (body.title ?? '').trim();
  if (userIds.length === 0 || !title) {
    return jsonResponse(
      { error: 'user_ids (non-empty) and title required' },
      400,
    );
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // 1) 대상 사용자의 토큰 fetch
  const { data: tokens, error: tokenErr } = await admin
    .from('push_tokens')
    .select('expo_token, user_id')
    .in('user_id', userIds);
  if (tokenErr) {
    return jsonResponse({ error: tokenErr.message }, 500);
  }
  if (!tokens || tokens.length === 0) {
    return jsonResponse({ sent: 0, failed: 0, dead: [] });
  }

  type TokenRow = { expo_token: string; user_id: string };
  const allTokens = (tokens as TokenRow[]).map((t) => t.expo_token);

  let sent = 0;
  let failed = 0;
  const dead: string[] = [];

  // 2) chunk 단위 Expo Push API 호출
  for (let i = 0; i < allTokens.length; i += CHUNK_SIZE) {
    const chunk = allTokens.slice(i, i + CHUNK_SIZE);
    const messages = chunk.map((token) => ({
      to: token,
      title,
      body: body.body ?? '',
      sound: 'default',
      data: body.data ?? {},
    }));

    try {
      const res = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages),
      });
      const result = await res.json();
      const tickets: ExpoPushTicket[] = result.data ?? [];

      for (let j = 0; j < tickets.length; j++) {
        const ticket = tickets[j];
        if (ticket.status === 'ok') {
          sent++;
        } else {
          failed++;
          // 죽은 토큰 → DELETE 큐에 추가.
          if (ticket.details?.error === 'DeviceNotRegistered') {
            dead.push(chunk[j]);
          }
        }
      }
    } catch (e) {
      failed += chunk.length;
      // 네트워크 실패 — 살아있을 수도 있어서 dead 에 추가 안 함.
      console.error('expo push chunk failed:', e);
    }
  }

  // 3) 죽은 토큰 정리.
  if (dead.length > 0) {
    await admin.from('push_tokens').delete().in('expo_token', dead);
  }

  return jsonResponse({ sent, failed, dead });
});
