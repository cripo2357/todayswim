// JS 렌더 페이지 읽기 — 시스템 Chrome/Edge를 playwright-core로 헤드리스 구동(브라우저 다운로드 불필요).
// 사용: node scripts/render-js.mjs "<url>" [스크린샷.png] [CSS셀렉터]
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const [url, shot, sel] = process.argv.slice(2);
let browser;
for (const ch of ['chrome','msedge']) {
  try { browser = await chromium.launch({ channel: ch, headless: true }); break; }
  catch(e) { if (ch==='msedge') throw e; }
}
const page = await browser.newPage({ viewport:{width:1280,height:2200} });
await page.goto(url, { waitUntil:'networkidle', timeout:30000 }).catch(()=>{});
await page.waitForTimeout(1500);
const text = await page.evaluate(()=>document.body.innerText);
console.log(text.replace(/\n{3,}/g,'\n\n').slice(0,5000));
if (shot) { const t = sel? page.locator(sel).first() : page; await t.screenshot({ path: shot, fullPage: !sel }).catch(async()=>{await page.screenshot({path:shot,fullPage:true});}); console.log('\n[shot] '+shot); }
await browser.close();
