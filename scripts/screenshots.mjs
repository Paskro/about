// Full-page and first-screen screenshots into docs/screenshots/.
import { chromium } from 'playwright';
import { serve } from './serve.mjs';

const { url, stop } = await serve(4330);
const browser = await chromium.launch();
const devices = {
  desktop: { viewport: { width: 1440, height: 900 } },
  phone: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};
for (const [device, options] of Object.entries(devices)) {
  for (const [lang, path] of [['en', ''], ['ru', 'ru/']]) {
    const page = await browser.newPage({ ...options, reducedMotion: 'reduce' });
    await page.goto(url + path, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    // Lazy pictures would stay blank in a full-page shot.
    await page.evaluate(() => Promise.all([...document.images].map((img) => ((img.loading = 'eager'), img.decode()))));
    await page.screenshot({ path: `docs/screenshots/${device}-${lang}-first-screen.png` });
    await page.screenshot({ path: `docs/screenshots/${device}-${lang}-full.png`, fullPage: true });
    await page.close();
  }
}
await browser.close();
await stop();
