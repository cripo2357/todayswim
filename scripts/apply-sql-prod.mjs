// 일회성: 단일 SQL 파일을 PROD DB에 직접 실행(풀 데이터 prod 직접관리 정책).
// 비밀값(connection string) 절대 출력 안 함. 사용: node scripts/apply-sql-prod.mjs <file.sql>
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
if (!file) { console.error('사용: node scripts/apply-sql-prod.mjs <file.sql>'); process.exit(1); }
const sql = fs.readFileSync(path.resolve(process.cwd(), file), 'utf8');

let url = load('SUPABASE_DB_URL_PROD');
if (!url) { console.error('✗ SUPABASE_DB_URL_PROD 없음(.env.local)'); process.exit(1); }
// 단일 멱등 배치 → session pooler(5432)로 (db-deploy.mjs와 동일 원칙).
url = url.replace(/:6543\b/, ':5432');

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await client.connect();
try {
  await client.query('begin');
  await client.query(sql);
  await client.query('commit');
  console.log('✓ PROD 적용 완료:', path.basename(file));
} catch (e) {
  await client.query('rollback').catch(() => {});
  console.error('✗ 적용 실패(rollback):', e.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
