import { defineConfig } from 'astro/config';

// The site lives at https://paskro.com/about/ (GitHub Pages project site "about").
export default defineConfig({
  site: 'https://paskro.com',
  base: '/about',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
  build: { inlineStylesheets: 'always' },
});
