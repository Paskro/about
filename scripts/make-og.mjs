// Temporary Open Graph images (name and role). Replace public/img/og-{en,ru}.png with illustrations later.
// An illustration without text, saved as public/img/og-art.png, is placed on the right.
import { existsSync, readFileSync } from 'node:fs';
import { chromium } from 'playwright';
import { fontCss } from './fonts.mjs';

const art = existsSync('public/img/og-art.png')
  ? `<img style="position:absolute;right:40px;top:115px;width:400px;height:400px;object-fit:contain;mix-blend-mode:multiply" src="data:image/png;base64,${readFileSync('public/img/og-art.png').toString('base64')}">`
  : '';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const lang of ['en', 'ru']) {
  const { hero } = JSON.parse(readFileSync(`src/content/${lang}.json`, 'utf8'));
  await page.setContent(`<!doctype html><meta charset="utf-8"><style>${fontCss}
    body{margin:0;width:1200px;height:630px;box-sizing:border-box;padding:90px;background:#F5F3EE;color:#1d1c1a;font-family:Inter,sans-serif;display:flex;flex-direction:column;justify-content:center}
    h1{font:700 150px/1 Caveat,cursive;margin:0}
    svg{display:block;margin:0 0 36px}
    p{margin:0;font-size:40px;font-weight:600}
    small{display:block;margin-top:56px;font-size:30px;color:#55524c}
  </style>
  ${art}
  <h1 style="font-size:${art ? 112 : 150}px">${hero.name}</h1>
  <svg width="640" height="30" viewBox="0 0 640 30"><path d="M8 20C170 6 430 4 632 16" stroke="#F6866D" stroke-width="14" stroke-linecap="round" fill="none"/></svg>
  <p style="max-width:${art ? 640 : 1020}px">${hero.role}</p>
  <small>paskro.com/about${lang === 'ru' ? '/ru' : ''}</small>`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `public/img/og-${lang}.png` });
}
await browser.close();
