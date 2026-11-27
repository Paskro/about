// Behaviour checks against the built site. Run "npm run build" first.
import { chromium } from 'playwright';
import { serve } from './serve.mjs';

const { url, stop } = await serve();
const browser = await chromium.launch();
let failed = 0;
const check = (name, ok, extra = '') => {
  if (!ok) failed++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${extra ? ` (${extra})` : ''}`);
};

for (const path of ['', 'ru/']) {
  console.log(`\n== /about/${path}`);
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const external = [];
  const errors = [];
  const bad = [];
  page.on('request', (r) => {
    if (!r.url().startsWith(new URL(url).origin) && !r.url().startsWith('data:')) external.push(r.url());
  });
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('response', (r) => r.status() >= 400 && bad.push(r.url()));
  await page.goto(url + path, { waitUntil: 'networkidle' });

  const toggles = page.locator('.toggle');
  check('cards are collapsed with JS', (await page.locator('.details:visible').count()) === 0, `${await toggles.count()} toggles`);
  await toggles.first().focus();
  await page.keyboard.press('Enter');
  check('Enter expands a card', (await toggles.first().getAttribute('aria-expanded')) === 'true' && (await page.locator('.details').first().isVisible()));
  await page.keyboard.press('Space');
  check('Space collapses it', (await toggles.first().getAttribute('aria-expanded')) === 'false');
  await page.locator('.period .card[data-expandable] h3').first().click();
  check('click on the card expands it', (await toggles.first().getAttribute('aria-expanded')) === 'true');

  const chip = (id) => page.locator(`[data-filter="${id}"]`);
  await chip('product').click();
  check('one filter dims the rest', (await page.locator('.period.is-dimmed').count()) === 7 && (await page.locator('.period.is-match').count()) === 1);
  await chip('operations').click();
  check('several filters add up', (await page.locator('.period.is-match').count()) === 4);
  await page.mouse.click(1, 1);
  await page.waitForTimeout(400);
  const opacity = await page.locator('.period.is-dimmed').first().evaluate((el) => getComputedStyle(el).opacity);
  check('dimmed opacity is 0.35', opacity === '0.35', opacity);
  await page.locator('[data-reset]').click();
  check('Reset clears the filters', (await page.locator('.period.is-dimmed, .period.is-match').count()) === 0);

  const scale = () => page.locator('[data-fill]').evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).d);
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    scrollTo(0, 0);
  });
  await page.waitForTimeout(400);
  const before = await scale();
  await page.evaluate(() => document.querySelector('#case-title').scrollIntoView({ block: 'start' }));
  await page.waitForTimeout(400);
  const after = await scale();
  check('timeline line fills on scroll', before < 0.1 && after > 0.95, `${before.toFixed(2)} -> ${after.toFixed(2)}`);

  await page.evaluate(() => scrollTo(0, 0));
  const fold = await page.locator('.actions').boundingBox();
  check('all contact buttons are on the first phone screen (390x844)', fold.y + fold.height <= 844, `bottom at ${Math.round(fold.y + fold.height)}px`);
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    check(`no horizontal scroll at ${width}px`, overflow <= 0, `${overflow}`);
  }

  const pdf = await page.locator('.btn-primary').getAttribute('href');
  const res = await page.request.get(new URL(pdf, url).href);
  check('CV link serves a PDF', res.ok() && (await res.body()).subarray(0, 4).toString() === '%PDF', pdf);
  const og = await page.locator('meta[property="og:image"]').getAttribute('content');
  check('OG image exists', (await page.request.get(url + og.split('/about/')[1])).ok(), og);
  check('sitemap and robots exist', (await page.request.get(url + 'sitemap.xml')).ok() && (await page.request.get(url + 'robots.txt')).ok());
  const fonts = await page.evaluate(async () => {
    await document.fonts.ready;
    return [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/"/g, ''));
  });
  check('self-hosted fonts loaded', fonts.includes('Inter') && fonts.includes('Caveat'), [...new Set(fonts)].join(', '));
  check('no external requests', external.length === 0, external.join(' '));
  check('no cookies or storage', (await context.cookies()).length === 0 && (await page.evaluate(() => localStorage.length + sessionStorage.length)) === 0);
  check('no console errors or broken files', errors.length === 0 && bad.length === 0, [...errors, ...bad].join(' '));
  await context.close();

  const noJs = await browser.newPage({ javaScriptEnabled: false });
  await noJs.goto(url + path);
  check(
    'without JS everything is open',
    (await noJs.locator('.details:visible').count()) === (await noJs.locator('.details').count()) && (await noJs.locator('.js-only:visible').count()) === 0,
  );
  await noJs.close();

  const calm = await browser.newPage({ reducedMotion: 'reduce' });
  await calm.goto(url + path, { waitUntil: 'networkidle' });
  const calmState = await calm.evaluate(() => ({
    transition: getComputedStyle(document.querySelector('.period')).transitionDuration,
    fill: getComputedStyle(document.querySelector('[data-fill]')).transform,
  }));
  check('reduced motion: no transitions, line static', calmState.transition === '0s' && calmState.fill === 'none', JSON.stringify(calmState));
  await calm.close();
}

await browser.close();
await stop();
console.log(failed ? `\n${failed} check(s) failed` : '\nall checks passed');
process.exit(failed ? 1 : 0);
