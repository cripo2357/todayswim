// Pool's day — 자유수영 시간표 자동 검증 스크립트.
//
// GitHub Actions cron(매월 1·15일)에서 실행.
// pools.schedule_source_url 채워진 풀들의 공식 페이지를 fetch → Claude(Haiku)로
// by_day 추출 → DB by_day와 diff.
//
// - 변동 없음: last_verified_at 갱신.
// - 변동 있음: issue-body.md에 markdown 적재 + GITHUB_OUTPUT has_issues=true.
// - fetch/parse 오류: 같은 issue에 오류 섹션으로 적재.
//
// LLM이 다른 시설 정보를 섞을 위험이 있어 **자동 반영 절대 X**. Issue 알림만.
// 운영자가 확인 후 UPDATE 마이그레이션으로 적용.
//
// 환경변수: SUPABASE_URL, SUPABASE_SERVICE_KEY, ANTHROPIC_API_KEY.

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'node:fs';

const REQUIRED_ENV = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'ANTHROPIC_API_KEY'];
for (const k of REQUIRED_ENV) {
  if (!process.env[k]) {
    console.error(`[fatal] missing env: ${k}`);
    process.exit(2);
  }
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일'];

function canonicalByDay(byDay) {
  if (!byDay || typeof byDay !== 'object') return {};
  const out = {};
  for (const d of WEEKDAYS) {
    if (!Array.isArray(byDay[d]) || byDay[d].length === 0) continue;
    out[d] = byDay[d]
      .map((s) => ({
        start: String(s.start),
        end: String(s.end),
        hours: typeof s.hours === 'number' ? Number(s.hours.toFixed(2)) : undefined,
      }))
      .sort((a, b) => a.start.localeCompare(b.start));
  }
  return out;
}

function validateExtracted(extracted) {
  if (!extracted || typeof extracted !== 'object') return 'not_an_object';
  if (extracted.error) return null; // 모델이 직접 보고한 오류
  if (!extracted.by_day || typeof extracted.by_day !== 'object') return 'missing_by_day';
  const hhmm = /^\d{2}:\d{2}$/;
  for (const [day, slots] of Object.entries(extracted.by_day)) {
    if (!WEEKDAYS.includes(day)) return `invalid_day_key: ${day}`;
    if (!Array.isArray(slots)) return `slots_not_array: ${day}`;
    for (const s of slots) {
      if (!hhmm.test(s.start) || !hhmm.test(s.end)) return `bad_time_format: ${day}`;
    }
  }
  return null;
}

function htmlToText(html) {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

async function extractScheduleFromUrl(pool) {
  const res = await fetch(pool.schedule_source_url, {
    headers: { 'user-agent': 'PoolsdayBot/1.0 (+verification)' },
  });
  if (!res.ok) {
    return { type: 'http_error', detail: `HTTP ${res.status}` };
  }
  const html = await res.text();
  const text = htmlToText(html).slice(0, 25000);

  const completion = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1500,
    system:
      '한국 수영장 자유수영 시간표 추출 전문가. 출력은 JSON 한 덩어리만 (설명·코드블록 X). ' +
      '자유수영(자율수영, 일일이용)만 추출 — 강습/유아강습/어린이반 제외. ' +
      '한 페이지에 여러 시설이 섞여있으면 요청된 시설 행만 추출. 못 찾으면 {"error":"no_schedule_found"}.',
    messages: [
      {
        role: 'user',
        content: `풀 "${pool.name}" (id=${pool.id}, 지역=${pool.region} ${pool.district})의 자유수영 시간표 추출.

출력 JSON 스키마:
{
  "by_day": {
    "월": [{"start":"08:00","end":"08:50","hours":0.83}],
    "토": [{"start":"07:00","end":"10:50","hours":3.83}]
  },
  "day_notes": {
    "일": "매월 셋째 주 일요일에만 운영합니다."
  }
}

규칙:
- hours = (종료 - 시작) 분/60. 50분=0.83, 1h50m=1.83, 2h50m=2.83, 3h50m=3.83.
- 운영 안 하는 요일은 키 생략.
- day_notes는 슬롯 있는 요일에만 (휴관·예외 안내).
- 연속 운영 구간은 한 슬롯으로 묶음 (50분 단위 분할 X).
- 자유수영 정보를 페이지에서 못 찾으면: {"error":"no_schedule_found"}.

페이지 텍스트:
${text}`,
      },
    ],
  });

  const responseText = completion.content[0].text;
  let parsed;
  try {
    const m = responseText.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(m ? m[0] : responseText);
  } catch {
    return { type: 'parse_error', detail: responseText.slice(0, 300) };
  }
  const validationErr = validateExtracted(parsed);
  if (validationErr) {
    return { type: 'validation_error', detail: validationErr };
  }
  if (parsed.error) {
    return { type: 'llm_no_schedule', detail: parsed.error };
  }
  return { type: 'ok', by_day: parsed.by_day, day_notes: parsed.day_notes || {} };
}

// ──────────────────────────────────────────────────────────────────────────

const { data: pools, error: poolErr } = await supabase
  .from('pools')
  .select('id, name, region, district, schedule_source_url')
  .not('schedule_source_url', 'is', null)
  .order('id');

if (poolErr) {
  console.error('[fatal] pools fetch failed:', poolErr);
  process.exit(3);
}

const { data: schedules, error: schErr } = await supabase
  .from('schedules')
  .select('pool_id, by_day, day_notes');

if (schErr) {
  console.error('[fatal] schedules fetch failed:', schErr);
  process.exit(3);
}

const scheduleByPool = new Map(schedules.map((s) => [s.pool_id, s]));

const changes = [];
const errors = [];
const verified = [];

for (const pool of pools) {
  console.log(`[check] ${pool.id} ${pool.name}`);
  let result;
  try {
    result = await extractScheduleFromUrl(pool);
  } catch (e) {
    result = { type: 'fetch_error', detail: e?.message || String(e) };
  }

  if (result.type !== 'ok') {
    errors.push({ pool, ...result });
    continue;
  }

  const dbSch = scheduleByPool.get(pool.id);
  if (!dbSch) {
    errors.push({ pool, type: 'no_db_schedule' });
    continue;
  }

  const sameByDay =
    JSON.stringify(canonicalByDay(result.by_day)) ===
    JSON.stringify(canonicalByDay(dbSch.by_day));

  if (sameByDay) {
    const { error: updErr } = await supabase
      .from('schedules')
      .update({ last_verified_at: new Date().toISOString() })
      .eq('pool_id', pool.id);
    if (updErr) {
      errors.push({ pool, type: 'db_update_error', detail: updErr.message });
    } else {
      verified.push(pool);
    }
  } else {
    changes.push({
      pool,
      before: dbSch.by_day,
      after: result.by_day,
      before_notes: dbSch.day_notes,
      after_notes: result.day_notes,
    });
  }
}

// ──────────────────────────────────────────────────────────────────────────

const today = new Date().toISOString().slice(0, 10);

if (changes.length === 0 && errors.length === 0) {
  console.log(`[ok] ${pools.length}개 풀 모두 변동 없음. last_verified_at 갱신 완료.`);
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, 'has_issues=false\n');
  }
  process.exit(0);
}

let body = `# 풀 시간표 검증 결과 (${today})\n\n`;
body += `- 검증 대상: ${pools.length}\n`;
body += `- ✅ 변동 없음: ${verified.length}\n`;
body += `- 🔄 변경 감지: ${changes.length}\n`;
body += `- ⚠️ 오류: ${errors.length}\n\n`;

if (changes.length) {
  body += `## 🔄 시간표 변경 감지\n\n`;
  body += `LLM이 추출한 시간표가 DB와 다릅니다. **자동 적용 안 함** — 출처 페이지 직접 확인 후 UPDATE 마이그레이션 생성하세요.\n\n`;
  for (const c of changes) {
    body += `### ${c.pool.name} \`${c.pool.id}\`\n\n`;
    body += `- 출처: ${c.pool.schedule_source_url}\n\n`;
    body += `**기존 by_day:**\n\`\`\`json\n${JSON.stringify(c.before, null, 2)}\n\`\`\`\n\n`;
    body += `**감지된 by_day:**\n\`\`\`json\n${JSON.stringify(c.after, null, 2)}\n\`\`\`\n\n`;
    if (JSON.stringify(c.before_notes || {}) !== JSON.stringify(c.after_notes || {})) {
      body += `**day_notes 변화:**\n\`\`\`json\n${JSON.stringify({ before: c.before_notes, after: c.after_notes }, null, 2)}\n\`\`\`\n\n`;
    }
    body += `---\n\n`;
  }
}

if (errors.length) {
  body += `## ⚠️ 오류\n\n`;
  for (const e of errors) {
    body += `- **${e.pool.name}** \`${e.pool.id}\` — \`${e.type}\`\n`;
    if (e.detail) {
      const detail = typeof e.detail === 'string' ? e.detail : JSON.stringify(e.detail);
      body += `  - ${detail.slice(0, 300)}\n`;
    }
    body += `  - URL: ${e.pool.schedule_source_url}\n`;
  }
  body += `\n`;
  body += `> 같은 \`http_error\`나 \`fetch_error\`가 반복되면 URL이 변경됐을 가능성 — 운영자가 새 URL 찾아 \`pools.schedule_source_url\` UPDATE.\n`;
}

fs.writeFileSync('issue-body.md', body);
if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, 'has_issues=true\n');
}
console.log(body);
