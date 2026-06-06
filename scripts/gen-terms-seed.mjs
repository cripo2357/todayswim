// 약관 시드 마이그레이션 생성기 — src/lib/termsContent.ts(TERMS_META)를 읽어
// public.terms 테이블 시드 SQL을 자동 생성한다. 5종 약관 본문을 손으로 SQL에
// 전사하지 않기 위함(전사 오류 방지). 실행: `npx tsx scripts/gen-terms-seed.mjs`
//
// 출력: supabase/migrations/0212_terms_seed_v1_0_3.sql (자급자족·멱등)
//   - 0044 스키마 가드(create table if not exists ...) 재포함 → 0044 적용 여부 무관
//   - type별 v1.0.3 upsert + is_active 교체
//
// content jsonb = 전체 TermsMeta({title, version, effectiveDate, sections}).
//   → fetch 시 그대로 TermsMeta로 사용(번들 폴백과 동일 형태).

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// termsContent.ts는 순수 모듈이라 import 가능하지만, .ts를 .mjs에서 직접
// import하려면 로더가 필요. 대신 tsx 없이도 동작하도록 동적 import 사용.
const { TERMS_META } = await import(
  pathToFileURL(join(ROOT, 'src', 'lib', 'termsContent.ts')).href
);

const VERSION = '1.0.3'; // DB 정규화 버전(앞 'v' 제거)
const EFFECTIVE_DATE = '2026-05-28';

// TermsKey(앱) → DB type + 게이트 속성
const SPEC = {
  service: { type: 'service', is_required: true, requires_consent: true },
  privacyConsent: { type: 'privacy_consent', is_required: true, requires_consent: true },
  privacyPolicy: { type: 'privacy_policy', is_required: false, requires_consent: false },
  location: { type: 'location', is_required: true, requires_consent: true },
  marketing: { type: 'marketing', is_required: false, requires_consent: true },
};

const header = `-- Pool's day — 약관 v${VERSION} 시드 (자동 생성: scripts/gen-terms-seed.mjs)
--
-- ⚠️ 손으로 수정하지 말 것. termsContent.ts 갱신 후 생성기 재실행.
-- 자급자족·멱등: 0044 스키마 가드를 재포함하므로 0044 적용 여부와 무관하게 안전.
-- content jsonb = 전체 TermsMeta({title, version, effectiveDate, sections}).
--
-- v1.0.3: Firebase Analytics 제거 + Apple 로그인 정식 반영(처리방침·수집동의·
--   이용약관 본문 변경). 위치·마케팅은 본문 변경 없으나 릴리스 버전 동기화.

-- ① 스키마 가드(0044와 동일·멱등) ------------------------------------------
create table if not exists public.terms (
  id               uuid primary key default gen_random_uuid(),
  type             text not null check (type in
                     ('service','privacy_consent','privacy_policy',
                      'location','marketing')),
  version          text not null,
  effective_date   date not null,
  content          jsonb not null,
  is_required      boolean not null default true,
  requires_consent boolean not null default true,
  is_active        boolean not null default false,
  created_at       timestamptz not null default now(),
  unique (type, version)
);
create unique index if not exists terms_one_active_per_type
  on public.terms (type) where is_active;
alter table public.terms enable row level security;
drop policy if exists terms_read_all on public.terms;
create policy terms_read_all on public.terms for select using (true);

-- ② v${VERSION} 시드 — type별 upsert + is_active 교체 -------------------------
`;

const blocks = [];
for (const [key, spec] of Object.entries(SPEC)) {
  const meta = TERMS_META[key];
  if (!meta) throw new Error(`TERMS_META에 ${key} 없음`);
  // content = 전체 메타(번들 폴백과 동일 형태). version은 정규화값으로 통일.
  const content = {
    title: meta.title,
    version: `v${VERSION}`,
    effectiveDate: meta.effectiveDate,
    sections: meta.sections,
  };
  const json = JSON.stringify(content);
  blocks.push(
    `-- ${spec.type}\n` +
    `update public.terms set is_active=false where type='${spec.type}' and version<>'${VERSION}';\n` +
    `insert into public.terms (type, version, effective_date, content, is_required, requires_consent, is_active)\n` +
    `values ('${spec.type}', '${VERSION}', '${EFFECTIVE_DATE}', $tjson$${json}$tjson$::jsonb, ${spec.is_required}, ${spec.requires_consent}, true)\n` +
    `on conflict (type, version) do update set\n` +
    `  content=excluded.content, effective_date=excluded.effective_date,\n` +
    `  is_required=excluded.is_required, requires_consent=excluded.requires_consent, is_active=true;\n`,
  );
}

const sql = header + '\n' + blocks.join('\n');
const outPath = join(ROOT, 'supabase', 'migrations', '0212_terms_seed_v1_0_3.sql');
writeFileSync(outPath, sql, 'utf8');
console.log(`생성 완료: ${outPath} (${sql.length} bytes, ${blocks.length} terms)`);
