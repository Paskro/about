// Lighthouse for both languages, mobile and desktop. Writes docs/lighthouse.md. Run "npm run build" first.
import { execFile } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { chromium } from 'playwright';
import { serve } from './serve.mjs';

const run = promisify(execFile);
const { url, stop } = await serve(4331);
const out = mkdtempSync(join(tmpdir(), 'lh-'));
const categories = ['performance', 'accessibility', 'best-practices', 'seo'];
const rows = [];
// Playwright starts the browser, Lighthouse attaches to it over the debugging port.
const port = 9333;
const browser = await chromium.launch({ args: [`--remote-debugging-port=${port}`] });

for (const [lang, path] of [['EN', ''], ['RU', 'ru/']]) {
  for (const preset of ['mobile', 'desktop']) {
    const file = join(out, `${lang}-${preset}.json`);
    const args = [
      'node_modules/lighthouse/cli/index.js',
      url + path,
      '--quiet',
      '--output=json',
      `--output-path=${file}`,
      `--only-categories=${categories.join(',')}`,
      `--port=${port}`,
    ];
    if (preset === 'desktop') args.push('--preset=desktop');
    await run(process.execPath, args);
    const report = JSON.parse(readFileSync(file, 'utf8'));
    const scores = categories.map((c) => Math.round(report.categories[c].score * 100));
    rows.push(`| ${lang} | ${preset} | ${scores.join(' | ')} |`);
    for (const category of categories) {
      for (const { id, weight } of report.categories[category].auditRefs) {
        const audit = report.audits[id];
        if (weight > 0 && audit.score !== null && audit.score < 0.9) console.log(`${lang} ${preset} ${category}: ${id} = ${audit.score}`);
      }
    }
  }
}
await browser.close();
await stop();

const table = [
  '# Lighthouse',
  '',
  `${process.env.LIVE_URL ? 'Run against ' + url : 'Local run of the production build'}, ${new Date().toISOString().slice(0, 10)}.`,
  '',
  '| Page | Preset | Performance | Accessibility | Best practices | SEO |',
  '|---|---|---|---|---|---|',
  ...rows,
  '',
].join('\n');
writeFileSync('docs/lighthouse.md', table);
console.log(table);
