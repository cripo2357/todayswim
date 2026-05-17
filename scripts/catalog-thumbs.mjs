import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const DIR = 'assets/library';
const OUT = 'assets/library/.catalog';
fs.mkdirSync(OUT, { recursive: true });

const files = fs.readdirSync(DIR).filter((f) => f.toLowerCase().endsWith('.svg')).sort();
const COLS = 2, ROWS = 2, PER = COLS * ROWS;
const IW = 600, IH = 400, LH = 72, GAP = 14;
const TW = IW, TH = IH + LH;
const SW = COLS * TW + (COLS + 1) * GAP;
const SH = ROWS * TH + (ROWS + 1) * GAP;

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

let sheet = 0, idx = 0;
for (let start = 0; start < files.length; start += PER) {
  sheet++;
  const batch = files.slice(start, start + PER);
  const composites = [];
  for (let i = 0; i < batch.length; i++) {
    const f = batch[i];
    const col = i % COLS, row = Math.floor(i / COLS);
    const tx = GAP + col * (TW + GAP);
    const ty = GAP + row * (TH + GAP);
    let img;
    try {
      img = await sharp(path.join(DIR, f))
        .resize({ width: IW - 8, height: IH - 8, fit: 'inside', background: { r: 255, g: 255, b: 255, alpha: 1 } })
        .flatten({ background: '#ffffff' }).png().toBuffer();
    } catch (e) {
      img = await sharp({ create: { width: IW - 8, height: IH - 8, channels: 3, background: '#ffdddd' } }).png().toBuffer();
    }
    const meta = await sharp(img).metadata();
    const ox = tx + Math.round((IW - meta.width) / 2);
    const oy = ty + Math.round((IH - meta.height) / 2);
    composites.push({ input: img, left: ox, top: oy });
    const label = Buffer.from(
      `<svg width="${TW}" height="${LH}" xmlns="http://www.w3.org/2000/svg">` +
      `<rect width="${TW}" height="${LH}" fill="#1F2937"/>` +
      `<text x="${TW / 2}" y="${LH / 2 + 13}" font-family="monospace" font-weight="bold" font-size="36" fill="#fff" text-anchor="middle">${esc(f)}</text></svg>`,
    );
    composites.push({ input: label, left: tx, top: ty + IH });
    idx++;
  }
  const bg = Buffer.from(`<svg width="${SW}" height="${SH}" xmlns="http://www.w3.org/2000/svg"><rect width="${SW}" height="${SH}" fill="#E2E8F0"/></svg>`);
  await sharp(bg).composite(composites).png().toFile(path.join(OUT, `sheet${sheet}.png`));
  console.log(`sheet${sheet}.png : ${batch.length} tiles (${batch[0]} .. ${batch[batch.length - 1]})`);
}
console.log(`TOTAL ${idx} svg -> ${sheet} sheets`);
