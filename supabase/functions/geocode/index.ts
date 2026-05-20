// Pool's day — Naver Geocoding 프록시 (Supabase Edge Function).
//
// 모바일 / Python import 스크립트 → 이 함수 호출 → Naver Geocoding API → 좌표 반환.
// Naver Client Secret은 Supabase 환경변수로만 보관 (NAVER_CLIENT_SECRET).
//
// 요청:  POST /functions/v1/geocode  body: { query: "서울특별시 송파구 올림픽로 25" }
// 응답:  { found: true, lat: 37.516, lng: 127.073, roadAddress: "...", jibunAddress: "..." }
//        또는 { found: false, query: "..." }
//
// 인증: Supabase anon 키 (Authorization 헤더). RLS 없이 통과 — Naver 호출 비용 제한은 NCP Console에서.

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const NAVER_CLIENT_ID = Deno.env.get('NAVER_CLIENT_ID');
const NAVER_CLIENT_SECRET = Deno.env.get('NAVER_CLIENT_SECRET');
const NAVER_GEOCODE_URL = 'https://maps.apigw.ntruss.com/map-geocode/v2/geocode';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET) {
    return jsonResponse(
      { error: 'Server config missing: NAVER_CLIENT_ID / NAVER_CLIENT_SECRET 미설정' },
      500,
    );
  }

  let body: { query?: string };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const query = (body.query ?? '').trim();
  if (!query) {
    return jsonResponse({ error: 'query parameter required' }, 400);
  }

  try {
    const url = `${NAVER_GEOCODE_URL}?query=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: {
        'X-NCP-APIGW-API-KEY-ID': NAVER_CLIENT_ID,
        'X-NCP-APIGW-API-KEY': NAVER_CLIENT_SECRET,
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      const text = await res.text();
      return jsonResponse(
        { error: 'Naver geocode upstream error', status: res.status, detail: text.slice(0, 500) },
        res.status,
      );
    }

    const data = await res.json();
    const first = data.addresses?.[0];

    if (!first) {
      return jsonResponse({ found: false, query });
    }

    const lat = parseFloat(first.y);
    const lng = parseFloat(first.x);

    // 한국 영역 검증
    const inKorea = lat >= 32 && lat <= 39 && lng >= 124 && lng <= 132;
    if (!inKorea) {
      return jsonResponse({ found: false, query, reason: 'out_of_korea_bounds' });
    }

    return jsonResponse({
      found: true,
      query,
      lat,
      lng,
      roadAddress: first.roadAddress || null,
      jibunAddress: first.jibunAddress || null,
      // Naver가 제공하는 부가 정보 (있을 때만)
      englishAddress: first.englishAddress || null,
    });
  } catch (e) {
    return jsonResponse({ error: String(e) }, 500);
  }
});
