// 검토 완료된 풀 dossier(JSON)를 prod에 일괄 등록한다.
// 정책: pool_db_prod_only / pool_must_have_schedule / pool_name_no_spaces / schedule_source_url_required.
//
// 사용: node scripts/register-pools-batch.mjs <reviewed.json> [--apply]
//   --apply 없으면 dry-run(좌표 조회 + 계획만 출력, DB 쓰기 X).
//
// 입력 JSON = 풀 객체 배열. 각 객체:
// {
//   name, region, district, address,
//   type:"indoor"|"outdoor", ownership:"public",
//   phone?, website?, lane_count?, pool_length?, depth_min?, depth_max?,
//   free_swim_available:true,
//   price_weekday?, price_weekend?, price_monthly?, price_per_sat?, price_per_sun?,
//   schedule_source_url,                       // 필수
//   by_day_en:[{day:"mon".."sun", slots:[{start:"HH:MM",end:"HH:MM",weeks?:[1..5]}]}],
//   day_notes?: { "월": "...", ... },           // 한글 요일 키
//   lat?, lng?                                  // 주어지면 geocode 생략
// }

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

const DAY_EN_KO = { mon: '월', tue: '화', wed: '수', thu: '목', fri: '금', sat: '토', sun: '일' };

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + (m || 0);
}
function slotHours(start, end) {
  return Math.round(((toMinutes(end) - toMinutes(start)) / 60) * 10) / 10;
}

// by_day_en → 한글 요일 키 { "월": [{start,end,hours,weeks?}], ... }
function buildByDay(byDayEn) {
  const out = {};
  for (const { day, slots } of byDayEn || []) {
    const ko = DAY_EN_KO[day];
    if (!ko) throw new Error(`unknown day key: ${day}`);
    out[ko] = (slots || []).map((s) => {
      const slot = { start: s.start, end: s.end, hours: slotHours(s.start, s.end) };
      if (Array.isArray(s.weeks) && s.weeks.length) slot.weeks = s.weeks;
      return slot;
    });
  }
  return out;
}

const KEY = load('KAKAO_REST_KEY');
async function geocode(name, address) {
  // 주소 우선(지역 정확) → 실패 시 시설명 키워드. 동명시설 교차매칭(예: 광주 동구↔울산 동구) 방지.
  for (const [q, kind] of [[address, 'address'], [name, 'keyword']]) {
    if (!q) continue;
    const base = kind === 'keyword'
      ? 'https://dapi.kakao.com/v2/local/search/keyword.json'
      : 'https://dapi.kakao.com/v2/local/search/address.json';
    const res = await fetch(`${base}?query=${encodeURIComponent(q)}&size=5`, {
      headers: { Authorization: `KakaoAK ${KEY}` },
    });
    if (!res.ok) continue;
    const docs = (await res.json()).documents ?? [];
    if (docs.length) {
      const top = docs[0];
      return { lat: Number(top.y), lng: Number(top.x), via: kind, label: top.road_address?.address_name || top.address_name || top.place_name };
    }
  }
  return null;
}

async function main() {
  const file = process.argv[2];
  const apply = process.argv.includes('--apply');
  if (!file) { console.error('사용: node scripts/register-pools-batch.mjs <reviewed.json> [--apply]'); process.exit(1); }
  const pools = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), file), 'utf8'));
  if (!Array.isArray(pools)) { console.error('입력은 풀 객체 배열이어야 함'); process.exit(1); }

  const sb = createClient(load('SUPABASE_URL_PROD'), load('SUPABASE_SERVICE_ROLE_KEY_PROD'));

  // 현재 max id
  const { data: ids } = await sb.from('pools').select('id').order('id', { ascending: false }).limit(1);
  let next = Number(ids[0].id.replace('POOL_', ''));
  // 기존 이름/주소(중복 pre-check)
  const { data: existing } = await sb.from('pools').select('name,address').limit(5000);
  const seen = new Set(existing.map((p) => (p.name || '').replace(/\s/g, '')));

  const plan = [];
  for (const p of pools) {
    const cleanName = (p.name || '').replace(/\s/g, '');
    if (!cleanName) { console.warn('SKIP(이름없음):', JSON.stringify(p)); continue; }
    if (seen.has(cleanName)) { console.warn('SKIP(중복):', cleanName); continue; }
    if (!p.schedule_source_url) { console.warn('SKIP(시간표출처 없음):', cleanName); continue; }
    if (!p.by_day_en || !p.by_day_en.length) { console.warn('SKIP(by_day 없음):', cleanName); continue; }

    let { lat, lng } = p;
    let via = 'provided';
    if (lat == null || lng == null) {
      const g = await geocode(cleanName, p.address);
      if (!g) { console.warn('SKIP(좌표실패):', cleanName); continue; }
      ({ lat, lng } = g); via = `kakao:${g.via}`;
    }

    next += 1;
    const id = `POOL_${String(next).padStart(4, '0')}`;
    const poolRow = {
      id, name: cleanName, region: p.region, district: p.district || null, address: p.address,
      lat, lng, type: p.type || 'indoor', ownership: p.ownership || 'public',
      phone: p.phone || null, website: p.website || null,
      lane_count: p.lane_count ?? null, pool_length: p.pool_length ?? null,
      depth_min: p.depth_min ?? null, depth_max: p.depth_max ?? null,
      facilities: [], has_schedule: true, free_swim_available: p.free_swim_available !== false,
      has_kids_pool: p.has_kids_pool ?? false, has_diving_pool: p.has_diving_pool ?? false, is_hotel_pool: false,
      price_weekday: p.price_weekday ?? null, price_weekend: p.price_weekend ?? null,
      price_monthly: p.price_monthly ?? null, price_per_sat: p.price_per_sat ?? null, price_per_sun: p.price_per_sun ?? null,
      schedule_source_url: p.schedule_source_url, is_active: true,
    };
    const nowIso = new Date().toISOString();
    const schedRow = {
      pool_id: id, author_nickname: '풀스데이', by_day: buildByDay(p.by_day_en),
      day_notes: p.day_notes || {}, slot_groups: {},
      updated_at: nowIso, approved_at: nowIso, last_verified_at: nowIso,
    };
    plan.push({ poolRow, schedRow, via });
    seen.add(cleanName);
  }

  console.log(`\n=== 등록 계획 ${plan.length}건 (${apply ? 'APPLY' : 'DRY-RUN'}) ===`);
  for (const { poolRow, via } of plan) {
    console.log(`${poolRow.id}  ${poolRow.name}  [${poolRow.region}/${poolRow.district}]  좌표 ${poolRow.lat?.toFixed?.(5)},${poolRow.lng?.toFixed?.(5)} (${via})`);
  }

  if (!apply) { console.log('\n(dry-run — 적용하려면 --apply)'); return; }

  for (const { poolRow, schedRow } of plan) {
    const r1 = await sb.from('pools').insert(poolRow);
    if (r1.error) { console.error('✗ pools insert 실패', poolRow.id, r1.error.message); continue; }
    const r2 = await sb.from('schedules').insert(schedRow);
    if (r2.error) { console.error('✗ schedules insert 실패', poolRow.id, r2.error.message); continue; }
    console.log('✓ 등록', poolRow.id, poolRow.name);
  }
  console.log('\n완료.');
}

main().catch((e) => { console.error(e); process.exit(1); });
