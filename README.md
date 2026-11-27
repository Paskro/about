# paskro.com/about

Personal one-page site of Pavel Skrobov. Static [Astro](https://astro.build) build, English at `/about/`, Russian at `/about/ru/`. No server and no cookies. The only external request is the GoatCounter visit counter (`src/components/Counter.astro`); statistics are at https://paskro.goatcounter.com. The same counter is on paskro.com and dopaminebudget.paskro.com.

## Structure

```
src/content/en.json, ru.json   all texts, including the timeline and case study
src/config.ts                  contacts, CV file names, LinkedIn post links
src/components/                page sections
src/scripts/page.ts            expandable cards, filters, timeline line
src/styles/global.css          colours and layout
public/                        files served as is: img/, cv/, favicon, robots.txt
scripts/                       CV and OG image generators, checks, screenshots, Lighthouse
docs/                          screenshots and Lighthouse results
```

## Run and build

Node 22.12 or newer.

```powershell
npm install
```

```powershell
npm run dev
```

Opens on http://localhost:4321/about/.

```powershell
npm run build
```

The result is in `dist/`.

## Change texts

Edit `src/content/en.json` and `src/content/ru.json`. Keep the same keys in both. `needsReview` in `ru.json` marks the translation as not checked yet; set it to `false` after the review. It is not shown on the page.

## Add a timeline period

Add an object to `timeline.items` in **both** JSON files. The order in the file is the order on the page (newest first).

```json
{
  "id": "unique-latin-id",
  "years": "2027 — now",
  "title": "Company · Role",
  "summary": "One line shown on the closed card.",
  "details": ["Shown after opening the card.", "One string per bullet."],
  "tags": ["product", "requirements"]
}
```

Tags: `requirements`, `process`, `product`, `testing`, `operations`, `learning`. With `"details": []` the card has no button. A new tag needs a label in `timeline.tags` in both files.

## Add pictures

Put the file under the exact name and rebuild. Until then a placeholder is shown.

| File in `public/img/` | Where |
|---|---|
| `pavel.jpg` | photo, square, about 480×480 |
| `sketch-hero.png` | sketch on the first screen, 800×440 (wide screens only) |
| `sketch-help-1.png` … `sketch-help-3.png` | the three "How I can help" blocks, 800×520 on white |
| `beta_context.webp`, `jira_board.webp` | case study pictures (size and caption in `caseStudy.artifacts`) |
| `og-art.png` | illustration without text for the link preview; after changing it run `npm run og` |
| `og-en.png`, `og-ru.png` | link preview, 1200×630 |

Check every picture for personal data before adding it (names, emails, avatars on the Jira board, photo metadata): the repository and the site are public.

House photos live in `public/img/house/`. Their order, captions, alt texts and pixel sizes are in `src/content/house/captions.json` (English) and `captions.ru.json`: keep the two lists in the same order. The first entry is the large picture, the rest form the strip.

LinkedIn posts: `{ url, en, ru }` objects in `POSTS` in `src/config.ts`. The user story and the agent rules are `caseStudy.userStory` and `caseStudy.agentRules` in the JSON files.

## CV PDFs

`public/cv/Pavel_Skrobov_CV_EN.pdf` and `..._RU.pdf`. They are generated from `scripts/cv/en.md` and `ru.md`:

```powershell
npm run cv
```

To use your own PDFs, overwrite the two files and do not run the command again. Public versions only: no birth date, age, phone, personal email, passport data or street address.

## Checks

Chromium for the scripts is installed once with `npx playwright install chromium`. Run after `npm run build`:

```powershell
npm run check
```

```powershell
npm run screenshots
```

```powershell
npm run lighthouse
```

`npm run og` rebuilds the temporary link preview images (it overwrites `og-*.png`).

## Deploy: GitHub Pages

`paskro.com` is already served by GitHub Pages from `Paskro/paskro.github.io`. A repository named `about` with Pages enabled therefore appears at `paskro.com/about` on its own.

1. Create a **public** repository `Paskro/about` (empty, without README).
2. In the repository: Settings → Pages → Source: **GitHub Actions**.
3. Push:

   ```powershell
   git remote add origin https://github.com/Paskro/about.git
   ```

   ```powershell
   git push -u origin main
   ```

4. The workflow `.github/workflows/deploy.yml` builds and publishes every push to `main`.
5. Open https://paskro.com/about/ and https://paskro.com/about/ru/.

Do **not** set a custom domain in the `about` repository and do not add a `CNAME` file: the domain is inherited from `paskro.github.io`.

### Domain and DNS

No DNS changes are needed. As of 2026-11-26 the records in Cloudflare were: apex `A` → GitHub Pages (185.199.108–111.153), `www` and `dopaminebudget` → `paskro.github.io`, `MX` and SPF → Cloudflare Email Routing (this is what makes contact@paskro.com work). Leave them as they are. If the site records are ever switched to "Proxied", turn off Cloudflare's Email Address Obfuscation: it rewrites the email address and injects a script.

### robots.txt and sitemap

The sitemap is at `/about/sitemap.xml`. Crawlers read `robots.txt` only from the domain root, so to announce the sitemap add this line to `robots.txt` in `Paskro/paskro.github.io`:

```
Sitemap: https://paskro.com/about/sitemap.xml
```
