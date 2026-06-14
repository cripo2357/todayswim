// 신규 등록분(>=POOL_0752) 요금 백필. prices.json(이름→요금) 기준 UPDATE.
// 사용: node scripts/update-pool-prices.mjs <prices.json> [--apply]
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
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
const apply = process.argv.includes('--apply');
if (!file) { console.error('사용: node scripts/update-pool-prices.mjs <prices.json> [--apply]'); process.exit(1); }
const rows = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), file), 'utf8'));
const sb = createClient(load('SUPABASE_URL_PROD'), load('SUPABASE_SERVICE_ROLE_KEY_PROD'));

// 신규 배치 풀(이름→id)
const { data: pools } = await sb.from('pools').select('id,name').gte('id', 'POOL_0752').limit(500);
const nameToId = new Map(pools.map((p) => [p.name, p.id]));

let matched = 0, skipped = 0, unmatched = [], updates = [];
for (const r of rows) {
  const allNull = r.price_weekday == null && r.price_weekend == null && r.price_monthly == null;
  if (allNull) { skipped++; continue; }
  const id = nameToId.get(r.name);
  if (!id) { unmatched.push(r.name); continue; }
  matched++;
  updates.push({ id, name: r.name, patch: { price_weekday: r.price_weekday ?? null, price_weekend: r.price_weekend ?? null, price_monthly: r.price_monthly ?? null } });
}
console.log(`매칭 ${matched} · 전부null(건너뜀) ${skipped} · 미매칭 ${unmatched.length}`);
if (unmatched.length) console.log('미매칭(prod에 없음): ' + unmatched.join(', '));
console.log('\n--- 적용할 요금 (' + (apply ? 'APPLY' : 'DRY-RUN') + ') ---');
for (const u of updates) console.log(`${u.id} ${u.name}  평일${u.patch.price_weekday}/주말${u.patch.price_weekend}/월${u.patch.price_monthly}`);
if (!apply) { console.log('\n(dry-run — 적용하려면 --apply)'); process.exit(0); }
let ok = 0;
for (const u of updates) {
  const { error } = await sb.from('pools').update(u.patch).eq('id', u.id);
  if (error) { console.error('✗', u.id, error.message); continue; }
  ok++;
}
console.log(`\n✓ ${ok}건 요금 업데이트 완료`);
