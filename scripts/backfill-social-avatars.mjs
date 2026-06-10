// 기존 소셜 가입자 프로필 사진 백필 — 제공자 CDN URL(카카오/구글) 사진을
// 우리 Supabase Storage(avatars/{auth_uid}/avatar.jpg)로 옮기고 photo_uri 정규화.
//
// 배경: 소셜 가입자는 photo_uri 가 제공자 CDN URL 그대로였다(클라 재호스팅은
// 신규 가입부터 적용 — 8b5676b). 이 스크립트는 그 이전 가입자를 일괄 정리.
//
// 안전:
//  · 대상 = photo_uri 가 http(s) 이면서 '/avatars/' 미포함(=외부 CDN). 우리
//    Storage/번들/레거시ID 는 제외. 정규화 후엔 '/avatars/' 포함이라 재실행 시 skip(멱등).
//  · CDN fetch 실패(만료/차단)면 그 사용자는 건너뛰고 로그만(원 URL 유지).
//  · Node 에 이미지 리사이즈 라이브러리가 없어 원본 바이트 그대로 업로드(소셜
//    썸네일은 보통 작음 ~110px). thumb 는 null → resolveAvatarUri 가 md 로 폴백.
//  · 기본은 DRY-RUN(쓰기 없음). 실제 적용은 `--apply`.
//  · service_role 키는 .env.local 에서만 읽고 출력 안 함(security_secret_handling).
//
// 사용:
//   node scripts/backfill-social-avatars.mjs            # dry-run (대상만 출력)
//   node scripts/backfill-social-avatars.mjs --apply    # prod 적용

import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';

function envFrom(file, name) {
  if (!fs.existsSync(file)) return null;
  const line = fs.readFileSync(file, 'utf8').split(/\r?\n/)
    .find((l) => l.trim().startsWith(name + '='));
  return line ? line.slice(line.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '') : null;
}

const url = envFrom('.env.local', 'SUPABASE_URL_PROD') || 'https://rwxefcbqybzsyjtpfbdt.supabase.co';
const key = envFrom('.env.local', 'SUPABASE_SERVICE_ROLE_KEY_PROD');
if (!key) { console.error('SUPABASE_SERVICE_ROLE_KEY_PROD 없음 (.env.local)'); process.exit(1); }

const APPLY = process.argv.slice(2).includes('--apply');
const BUCKET = 'avatars';
const sb = createClient(url, key, { auth: { persistSession: false } });

function isExternal(u) {
  return !!u && /^https?:\/\//.test(u) && !u.includes('/avatars/');
}

const { data: rows, error } = await sb
  .from('profiles')
  .select('id, nickname, auth_uid, photo_uri, photo_thumb_uri')
  .order('created_at', { ascending: false });
if (error) { console.error(error.message); process.exit(1); }

const targets = (rows ?? []).filter((r) => isExternal(r.photo_uri));
console.log(`전체 ${rows.length}행 중 외부 CDN 사진 ${targets.length}명${APPLY ? ' (APPLY)' : ' (DRY-RUN)'}\n`);

let ok = 0, skip = 0, fail = 0;
for (const r of targets) {
  const tag = `${r.nickname ?? '?'} (${r.id})`;
  if (!r.auth_uid) { console.log(`  - SKIP ${tag}: auth_uid 없음`); skip++; continue; }
  if (!APPLY) { console.log(`  · ${tag}: ${r.photo_uri}`); continue; }

  try {
    const res = await fetch(r.photo_uri);
    if (!res.ok) { console.log(`  ✗ FAIL ${tag}: HTTP ${res.status}`); fail++; continue; }
    const ct = res.headers.get('content-type') || 'image/jpeg';
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length === 0) { console.log(`  ✗ FAIL ${tag}: 빈 응답`); fail++; continue; }

    const path = `${r.auth_uid}/avatar.jpg`;
    const { error: upErr } = await sb.storage.from(BUCKET).upload(path, buf, {
      contentType: ct.startsWith('image/') ? ct : 'image/jpeg',
      upsert: true,
    });
    if (upErr) { console.log(`  ✗ FAIL ${tag}: upload ${upErr.message}`); fail++; continue; }

    const { data: pub } = sb.storage.from(BUCKET).getPublicUrl(path);
    const newUrl = `${pub.publicUrl}?v=${Date.now()}`;
    const { error: updErr } = await sb
      .from('profiles')
      .update({ photo_uri: newUrl, photo_thumb_uri: null })
      .eq('id', r.id);
    if (updErr) { console.log(`  ✗ FAIL ${tag}: update ${updErr.message}`); fail++; continue; }

    console.log(`  ✓ OK   ${tag} → avatars/${r.auth_uid}/avatar.jpg (${buf.length}B)`);
    ok++;
  } catch (e) {
    console.log(`  ✗ FAIL ${tag}: ${String(e).slice(0, 80)}`);
    fail++;
  }
}

if (APPLY) console.log(`\n완료 — OK ${ok} / SKIP ${skip} / FAIL ${fail}`);
else console.log(`\n(DRY-RUN) 적용하려면 --apply`);
