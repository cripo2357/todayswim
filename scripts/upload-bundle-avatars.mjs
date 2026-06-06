// 번들 아바타 12종(thumb 64 + md 256)을 Supabase Storage `avatars/bundle/` 로 업로드.
//
// 배경(2026-06-07): 번들 아바타도 업로드 사진과 동일하게 Storage 호스팅으로 통일
// (앱 번들에서 PNG 제거 -248KB, photo_uri 는 항상 URL). 코드의 bundleAvatarUrl/
// bundleAvatarThumbUrl 이 가리키는 경로와 일치해야 한다:
//   avatars/bundle/{id}.png       (md 256)
//   avatars/bundle/{id}_64.png    (thumb 64)
//
// 보안(security_secret_handling): service_role 키는 코드/채팅에 없음. .env.local
//   (gitignored)에서만 읽고 절대 출력하지 않는다. 모델은 .env* 를 읽지 않는다.
//
// URL 은 공개값(anon 쪽)이라 아래 기본값으로 박혀 있음 — .env.local 엔 service_role
// 키 2줄만 추가하면 된다(값은 Supabase 대시보드 → Project Settings → API. 채팅 금지):
//   SUPABASE_SERVICE_ROLE_KEY_DEV=<service_role key>
//   SUPABASE_SERVICE_ROLE_KEY_PROD=<service_role key>
// (URL 을 바꾸려면 SUPABASE_URL_DEV / SUPABASE_URL_PROD 로 덮어쓸 수 있음.)
//
// 사용:
//   node scripts/upload-bundle-avatars.mjs          # dev 에만
//   node scripts/upload-bundle-avatars.mjs --prod   # dev 성공 후 prod 까지

import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

function loadEnv(name) {
  if (process.env[name]) return process.env[name].trim();
  for (const f of ['.env.local', '.env']) {
    const p = path.resolve(process.cwd(), f);
    if (!fs.existsSync(p)) continue;
    const line = fs
      .readFileSync(p, 'utf8')
      .split(/\r?\n/)
      .find((l) => l.trim().startsWith(`${name}=`));
    if (line) return line.slice(line.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '');
  }
  return null;
}

const SRC = 'assets/avatars';
const BUCKET = 'avatars';
// 공개 프로젝트 URL(anon 쪽이라 비밀 아님 — 앱 번들에도 인라인됨). env 로 덮어쓰기 가능.
const DEFAULT_URL = {
  DEV: 'https://hldfsstyzbnqnrlqhhtc.supabase.co',
  PROD: 'https://rwxefcbqybzsyjtpfbdt.supabase.co',
};
const ids = fs
  .readdirSync(SRC)
  .filter((f) => /^avatar-(male|female)-\d\.svg$/.test(f))
  .map((f) => f.replace(/\.svg$/, ''))
  .sort();

async function uploadEnv(label) {
  const url = loadEnv(`SUPABASE_URL_${label}`) || DEFAULT_URL[label];
  const key = loadEnv(`SUPABASE_SERVICE_ROLE_KEY_${label}`);
  if (!key) {
    console.error(
      `✗ ${label}: SUPABASE_SERVICE_ROLE_KEY_${label} 없음. .env.local 에 추가(값은 채팅 금지).`,
    );
    return false;
  }
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  let ok = 0;
  for (const id of ids) {
    const tasks = [
      { file: path.join(SRC, 'md', `${id}.png`), dest: `bundle/${id}.png` },
      { file: path.join(SRC, 'thumb', `${id}.png`), dest: `bundle/${id}_64.png` },
    ];
    for (const t of tasks) {
      if (!fs.existsSync(t.file)) {
        console.error(`  ✗ 소스 없음: ${t.file} (node scripts/avatar-thumbs.mjs 먼저 실행)`);
        return false;
      }
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(t.dest, fs.readFileSync(t.file), {
          contentType: 'image/png',
          upsert: true,
        });
      if (error) {
        console.error(`  ✗ ${t.dest}: ${error.message}`);
        return false;
      }
      ok++;
    }
  }
  console.log(`✓ ${label}: ${ok}개 업로드 (avatars/bundle/, ${ids.length}종 ×2 사이즈)`);
  return true;
}

const withProd = process.argv.slice(2).includes('--prod');

if (!(await uploadEnv('DEV'))) process.exit(1);
if (withProd && !(await uploadEnv('PROD'))) process.exit(1);
console.log('\n완료. 코드의 bundleAvatarUrl 경로(avatars/bundle/{id}.png · {id}_64.png)와 일치.');
