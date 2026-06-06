// 번들 아바타(12종) 다티어 PNG 래스터 생성 — repo SVG → sharp.
//
// 친구가 늘어도 비용 일정(friends_scalability 메모리): SVG 벡터 트리를
// 다수 동시 마운트하면 무거우므로, 표시 크기대로 PNG 티어를 고른다.
// 치수 원칙 = "그 맥락 최대 표시 px × DPR(~3)".
//   sm = 64  (맵 스택 20·mini 24 등 ≤~21px 표시) — 기존 assets/avatars/thumb/ 재사용
//   md = 256 (친구행 48·요청 40·검색 32·프로필 ~76px 등 앱 최대 표시까지 선명)
// (lg=512는 미사용이라 제거 2026-06-07 — 앱 최대 아바타 표시 ~76px이라 md로 충분.)
//
// 사용: node scripts/avatar-thumbs.mjs   (sharp 필요 — devDep/글로벌)

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const SRC = 'assets/avatars';
const TIERS = { md: 256 }; // sm(64)=기존 thumb/ 유지

const ids = fs
  .readdirSync(SRC)
  .filter((f) => /^avatar-(male|female)-\d\.svg$/.test(f))
  .map((f) => f.replace(/\.svg$/, ''))
  .sort();

let made = 0;
for (const [tier, size] of Object.entries(TIERS)) {
  const out = path.join(SRC, tier);
  fs.mkdirSync(out, { recursive: true });
  for (const id of ids) {
    await sharp(path.join(SRC, `${id}.svg`), { density: 384 })
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png({ compressionLevel: 9 })
      .toFile(path.join(out, `${id}.png`));
    made++;
  }
  console.log(`${tier} (${size}px): ${ids.length} files -> ${out}`);
}
console.log(`TOTAL ${made} png from ${ids.length} svg`);
