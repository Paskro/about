import { SITE_URL } from '../config';

const pages = { en: `${SITE_URL}/about/`, ru: `${SITE_URL}/about/ru/` };

export function GET() {
  const alternates = Object.entries(pages)
    .map(([lang, href]) => `<xhtml:link rel="alternate" hreflang="${lang}" href="${href}"/>`)
    .join('');
  const urls = Object.values(pages)
    .map((loc) => `<url><loc>${loc}</loc>${alternates}</url>`)
    .join('');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}</urlset>`,
    { headers: { 'Content-Type': 'application/xml' } },
  );
}
