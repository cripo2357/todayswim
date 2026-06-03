// 마이그레이션 배포 — dev 먼저 검증 → prod 순차 push (link 전환 불필요).
//
// 정책(supabase_dev_prod_split): 항상 dev 먼저 적용해 검증한 뒤 prod.
// 이 스크립트는 --db-url 로 환경을 직접 지정하므로 `supabase link` 전환이 필요 없다.
//
// 보안: connection string(비번 포함)은 코드에 없음. .env.local(gitignored)에서만 읽고,
//       절대 출력하지 않는다(supabase CLI 로그에도 URL 미노출 위해 stdio만 상속).
//       모델은 .env* 를 읽지 않는다(geocode-kakao.mjs 와 동일 원칙).
//
// .env.local 에 아래 두 줄(값은 Supabase 대시보드 → Project Settings → Database
//   → Connection string(URI). 비번 포함. 채팅에 붙여넣지 말 것):
//   SUPABASE_DB_URL_DEV=postgresql://postgres.hldfsst...:<pw>@...pooler.supabase.com:6543/postgres
//   SUPABASE_DB_URL_PROD=postgresql://postgres.rwxefc...:<pw>@...pooler.supabase.com:6543/postgres
//
// 사용:
//   node scripts/db-deploy.mjs            # dev 에만 적용(안전 기본)
//   node scripts/db-deploy.mjs --prod     # dev 적용 성공 시 prod 까지 순차 적용
//   node scripts/db-deploy.mjs --dry-run  # 적용될 마이그레이션만 출력(실제 변경 X)

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

function loadUrl(name) {
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

const args = process.argv.slice(2);
const withProd = args.includes('--prod');
const dryRun = args.includes('--dry-run');

// 환경 라벨만 출력하고 URL 자체는 절대 찍지 않는다.
function push(label, url) {
  if (!url) {
    console.error(`✗ ${label}: connection string 없음. .env.local 에 SUPABASE_DB_URL_${label} 추가 필요.`);
    console.error('  (Supabase 대시보드 → Project Settings → Database → Connection string. 채팅 금지)');
    return false;
  }
  console.log(`\n▶ ${label} 에 db push${dryRun ? ' (dry-run)' : ''} …`);
  const cliArgs = ['supabase', 'db', 'push', '--db-url', url, '--yes'];
  if (dryRun) cliArgs.push('--dry-run');
  // stdio 상속: CLI 출력은 보이되 URL 인자는 우리가 콘솔에 안 찍음.
  const r = spawnSync('npx', cliArgs, { stdio: 'inherit', shell: process.platform === 'win32' });
  if (r.status !== 0) {
    console.error(`✗ ${label} 적용 실패 (exit ${r.status}). 이후 단계 중단.`);
    return false;
  }
  console.log(`✓ ${label} 완료`);
  return true;
}

const devUrl = loadUrl('SUPABASE_DB_URL_DEV');
const prodUrl = loadUrl('SUPABASE_DB_URL_PROD');

// 1) dev 먼저 — 실패하면 prod 로 진행하지 않는다.
if (!push('DEV', devUrl)) process.exit(1);

// 2) --prod 일 때만 prod. dry-run 은 dev 만으로 충분(prod 도 보고 싶으면 --prod 동반).
if (withProd) {
  if (!push('PROD', prodUrl)) process.exit(1);
} else if (!dryRun) {
  console.log('\n(prod 미적용. prod 까지 올리려면: node scripts/db-deploy.mjs --prod)');
}

console.log('\n배포 완료.');
