// 일회성: 단일 SQL 파일을 지정 환경(DEV/PROD) DB에 직접 실행.
// 스키마 마이그레이션을 풀 마이그레이션 딸림 없이 단건 적용할 때(0296 등).
// 멱등 파일에만 사용. 비밀값(connection string) 절대 출력 안 함.
// 사용: node scripts/apply-sql-env.mjs <file.sql> <DEV|PROD>
import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';

function load(name) {
  if (process.env[name]) return process.env[name].trim();
  for (const f of ['.env.local', '.env']) {
    const p = path.resolve(process.cwd(), f);
    if (!fs.existsSync(p)) continue;
    const line = fs.readFileSync(p, 'utf8').split(/\r?\n/).find((l) => l.trim().startsWith(`${name}=`));
    if (line) return line.slice(line.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '');
  }
  return null;
}

const file = process.argv[2];
const target = (process.argv[3] || '').toUpperCase();
if (!file || (target !== 'DEV' && target !== 'PROD')) {
  console.error('사용: node scripts/apply-sql-env.mjs <file.sql> <DEV|PROD>');
  process.exit(1);
}
const sql = fs.readFileSync(path.resolve(process.cwd(), file), 'utf8');
let url = load(`SUPABASE_DB_URL_${target}`);
if (!url) { console.error(`✗ SUPABASE_DB_URL_${target} 없음(.env.local)`); process.exit(1); }
url = url.replace(/:6543\b/, ':5432');

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await client.connect();
try {
  await client.query('begin');
  await client.query(sql);
  await client.query('commit');
  console.log(`✓ ${target} 적용 완료:`, path.basename(file));
} catch (e) {
  await client.query('rollback').catch(() => {});
  console.error('✗ 적용 실패(rollback):', e.message);
  process.exitCode = 1;
} finally {
  await client.end();
}