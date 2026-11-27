// Builds the public CV PDFs from scripts/cv/{en,ru}.md. Public data only: no phone, birth date,
// personal email or street address. Skip this script if you drop in your own PDFs.
import { readFileSync } from 'node:fs';
import { chromium } from 'playwright';
import { fontCss } from './fonts.mjs';

const links = (text) =>
  text
    .replace(/contact@paskro\.com/g, '<a href="mailto:contact@paskro.com">contact@paskro.com</a>')
    .replace(/Telegram @Paskro/g, '<a href="https://t.me/Paskro">Telegram @Paskro</a>')
    .replace(/linkedin\.com\/in\/paskro/g, '<a href="https://www.linkedin.com/in/paskro/">linkedin.com/in/paskro</a>')
    .replace(/· paskro\.com/g, '· <a href="https://paskro.com/">paskro.com</a>');

const inline = (text) =>
  links(text.replace(/&/g, '&amp;').replace(/</g, '&lt;')).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

function toHtml(markdown) {
  const out = [];
  let list = false;
  const closeList = () => {
    if (list) out.push('</ul>');
    list = false;
  };
  const lines = markdown.split(/\r?\n/);
  for (const [i, line] of lines.entries()) {
    const heading = line.match(/^(#{1,3}) (.*)/);
    if (line.startsWith('- ')) {
      if (!list) out.push('<ul>');
      list = true;
      out.push(`<li>${inline(line.slice(2))}</li>`);
      continue;
    }
    closeList();
    if (heading) {
      // "#" is the name, "###" are section titles.
      const level = heading[1].length === 3 ? 2 : heading[1].length;
      out.push(`<h${level}>${inline(heading[2])}</h${level}>`);
    } else if (line.trim()) {
      // A line followed directly by another text line is a hard break.
      const next = lines[i + 1] ?? '';
      const joined = next.trim() && !/^(#|- )/.test(next);
      out.push(joined ? `<div>${inline(line)}</div>` : `<p>${inline(line)}</p>`);
    }
  }
  closeList();
  return out.join('\n');
}

const css = `${fontCss}
body{font:400 9.6pt/1.42 Inter,sans-serif;color:#1d1c1a;margin:0}
h1{font:700 30pt/1 Caveat,cursive;margin:0 0 2pt}
h2{font:700 16pt/1.1 Caveat,cursive;margin:10pt 0 4pt;padding-bottom:1pt;border-bottom:2pt solid #52B7B0;break-after:avoid}
h3{font-size:10pt;margin:7pt 0 1pt;break-after:avoid}
p{margin:0 0 3pt}ul{margin:2pt 0;padding-left:13pt}li{margin:0;break-inside:avoid}
a{color:inherit;text-decoration-color:#52B7B0}`;

const files = { en: ['EN', 'Pavel Skrobov — CV'], ru: ['RU', 'Павел Скробов — резюме'] };
const browser = await chromium.launch();
for (const [lang, [suffix, title]] of Object.entries(files)) {
  let body = toHtml(readFileSync(`scripts/cv/${lang}.md`, 'utf8'));
  // Experience headings are written as bold paragraph lines in the source.
  body = body.replace(/<(div|p)><strong>([^<]*—[^<]*)<\/strong><\/\1>/g, '<h3>$2</h3>');
  const page = await browser.newPage();
  await page.setContent(`<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><title>${title}</title><style>${css}</style></head><body>${body}</body></html>`);
  await page.evaluate(() => document.fonts.ready);
  const pdf = await page.pdf({
    path: `public/cv/Pavel_Skrobov_CV_${suffix}.pdf`,
    format: 'A4',
    margin: { top: '12mm', bottom: '12mm', left: '15mm', right: '15mm' },
    tagged: true,
  });
  console.log(`CV ${suffix}: ${(pdf.length / 1024).toFixed(0)} KB, pages: ${pdf.toString('latin1').match(/\/Type\s*\/Page\b/g)?.length}`);
  if (process.env.CV_PREVIEW) {
    await page.setViewportSize({ width: 680, height: 1000 });
    await page.screenshot({ path: `${process.env.CV_PREVIEW}/cv-${lang}.png`, fullPage: true });
  }
  await page.close();
}
await browser.close();
