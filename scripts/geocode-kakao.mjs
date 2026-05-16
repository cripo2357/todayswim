// 수영장 등록용 좌표 조회 — 카카오 Local REST API (로컬 전용, 운영자 실행).
//
// 보안: KAKAO_REST_KEY 는 코드에 없음. .env.local(gitignored) 또는 셸 env에서 읽음.
//       이 스크립트는 키를 절대 출력하지 않음(좌표/SQL만 출력). 모델은 .env*를 읽지 않음.
//
// 사용:
//   node scripts/geocode-kakao.mjs "서울특별시 동작구 사당로8길 9"
//   node scripts/geocode-kakao.mjs "사당문화회관" --keyword
//   node scripts/geocode-kakao.mjs "서울특별시 동작구 사당로8길 9" --id POOL_SEOUL_0006
//
// .env.local 에 아래 한 줄(키 값은 본인만, 채팅에 붙여넣지 말 것):
//   KAKAO_REST_KEY=발급받은_REST_API_키

import fs from 'node:fs';
import path from 'node:path';

function loadKey() {
  if (process.env.KAKAO_REST_KEY) return process.env.KAKAO_REST_KEY.trim();
  // .env.local → .env 순으로 KAKAO_REST_KEY 만 추출 (다른 값은 무시).
  for (const f of ['.env.local', '.env']) {
    const p = path.resolve(process.cwd(), f);
    if (!fs.existsSync(p)) continue;
    const line = fs
      .readFileSync(p, 'utf8')
      .split(/\r?\n/)
      .find((l) => l.trim().startsWith('KAKAO_REST_KEY='));
    if (line) return line.slice(line.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '');
  }
  return null;
}

const args = process.argv.slice(2);
const query = args.find((a) => !a.startsWith('--'));
const isKeyword = args.includes('--keyword');
const idIdx = args.indexOf('--id');
const poolId = idIdx >= 0 ? args[idIdx + 1] : null;

if (!query) {
  console.error('사용: node scripts/geocode-kakao.mjs "<주소 또는 시설명>" [--keyword] [--id POOL_xxx]');
  process.exit(1);
}

const KEY = loadKey();
if (!KEY) {
  console.error('KAKAO_REST_KEY 없음. .env.local(gitignored)에 다음을 추가하세요(채팅에 붙여넣지 마세요):');
  console.error('  KAKAO_REST_KEY=발급받은_REST_API_키');
  process.exit(2);
}

const base = isKeyword
  ? 'https://dapi.kakao.com/v2/local/search/keyword.json'
  : 'https://dapi.kakao.com/v2/local/search/address.json';

const res = await fetch(`${base}?query=${encodeURIComponent(query)}&size=5`, {
  headers: { Authorization: `KakaoAK ${KEY}` },
});

if (!res.ok) {
  console.error(`카카오 API 오류 HTTP ${res.status} (키/쿼터/주소 확인). 키 값은 출력 안 함.`);
  process.exit(3);
}

const data = await res.json();
const docs = data.documents ?? [];
if (docs.length === 0) {
  console.error('결과 없음. --keyword 로 시설명 검색을 시도하거나 주소 표기를 확인하세요.');
  process.exit(4);
}

console.log(`\n질의: ${query}  (${isKeyword ? 'keyword' : 'address'})  결과 ${docs.length}건\n`);
docs.forEach((d, i) => {
  // 주소 검색: d.y=위도, d.x=경도. 키워드 검색도 동일 (x=경도, y=위도, WGS84).
  const lat = Number(d.y);
  const lng = Number(d.x);
  const label =
    d.road_address?.address_name ||
    d.address?.address_name ||
    d.address_name ||
    d.place_name ||
    '(라벨 없음)';
  const kind = d.place_name ? `POI:${d.place_name}` : d.address_type || 'ADDR';
  console.log(`  [${i + 1}] ${label}  <${kind}>`);
  console.log(`       lat=${lat}  lng=${lng}`);
});

const top = docs[0];
const lat = Number(top.y);
const lng = Number(top.x);
console.log(`\n→ 1순위 좌표:  lat=${lat}, lng=${lng}`);
console.log(`   INSERT용:   ${lat}, ${lng},`);
if (poolId) {
  console.log(
    `   UPDATE SQL:\n   update public.pools set lat=${lat}, lng=${lng} where id='${poolId}';`,
  );
}
console.log('\n(여러 건이면 시설명/도로명 라벨로 맞는 것 확인 후 그 번호 좌표 사용)\n');
