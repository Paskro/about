// @font-face rules with the self-hosted fonts inlined, for the PDF and OG image renderers.
import { readFileSync } from 'node:fs';

const face = (family, pkg, subset, weight) => {
  const data = readFileSync(`node_modules/@fontsource/${pkg}/files/${pkg}-${subset}-${weight}-normal.woff2`).toString('base64');
  const range = subset === 'cyrillic' ? 'U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116' : 'U+0000-00FF,U+2000-206F,U+20AC,U+2122,U+2212';
  return `@font-face{font-family:'${family}';font-weight:${weight};src:url(data:font/woff2;base64,${data}) format('woff2');unicode-range:${range}}`;
};

export const fontCss = ['latin', 'cyrillic']
  .flatMap((subset) => [
    face('Inter', 'inter', subset, 400),
    face('Inter', 'inter', subset, 600),
    face('Caveat', 'caveat', subset, 700),
  ])
  .join('');
