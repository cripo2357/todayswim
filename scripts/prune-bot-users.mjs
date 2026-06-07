// Pool's day — 봇 계정 정리 스크립트.
//
// 구글 Play Test Lab / 사전 출시 보고서가 만드는 자동 봇 계정
// (@cloudtestlabaccounts.com)을 auth.users에서 제거한다.
//
// 안전 원칙:
//  - 기본은 DRY-RUN (목록만 출력, 삭제 안 함). 실제 삭제는 `--apply` 필요.
//  - 봇 도메인 화이트리스트만 대상. privaterelay.appleid.com(애플 이메일가리기=진짜
//    유저)은 절대 대상 아님.
//  - profiles 행이 있으면(실사용 흔적) 건너뜀.
//
// 사용:
//   node scripts/prune-bot-users.mjs            # 미리보기
//   node scripts/prune-bot-users.mjs --apply    # 실제 삭제
//   node scripts/prune-bot-users.mjs --env dev  # dev 프로젝트 대상(기본 prod)

import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';

const BOT_DOMAINS = ['cloudtestlabaccounts.com']; // 필요 시 봇 도메인 추가
const APPLY = process.argv.includes('--apply');
const ENV = process.argv.includes('--env') ? process.argv[process.argv.indexOf('--env') + 1] : 'prod';
const SUF = ENV === 'dev' ? 'DEV' : 'PROD';

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8').split('\n').filter(l => l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);

const sb = createClient(env[`SUPABASE_URL_${SUF}`], env[`SUPABASE_SERVICE_ROLE_KEY_${SUF}`], {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: { users }, error } = await sb.auth.admin.listUsers({ perPage: 1000 });
if (error) { console.error('listUsers failed:', error.message); process.exit(1); }

const isBot = (u) => {
  const email = (u.email || '').toLowerCase();
  return BOT_DOMAINS.some(d => email.endsWith('@' + d));
};

const bots = users.filter(isBot);
console.log(`[${ENV}] 전체 ${users.length}명 중 봇 도메인 매칭 ${bots.length}명\n`);

let deleted = 0, skipped = 0;
for (const u of bots) {
  // 실사용 흔적 가드: profiles 행 있으면 보존
  const { data: prof } = await sb.from('profiles').select('id').eq('auth_uid', u.id).maybeSingle();
  if (prof) { console.log(`SKIP  ${u.email} (profile 존재: ${prof.id})`); skipped++; continue; }

  if (!APPLY) { console.log(`DRY   ${u.email}  (${u.created_at})  → 삭제 예정`); continue; }

  const { error: de } = await sb.auth.admin.deleteUser(u.id);
  if (de) console.log(`FAIL  ${u.email}: ${de.message}`);
  else { console.log(`DEL   ${u.email}`); deleted++; }
}

console.log(`\n결과: ${APPLY ? `삭제 ${deleted}` : `미리보기(삭제 안 함) ${bots.length - skipped}건 대상`}, 보존 ${skipped}`);
if (!APPLY) console.log('실제 삭제하려면: node scripts/prune-bot-users.mjs --apply');
