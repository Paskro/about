import { existsSync } from 'node:fs';
import { join } from 'node:path';

const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/** URL of a file from public/ (respects the /about base path). */
export const asset = (path: string) => `${base}/${path}`;

/** True when an optional file was added to public/ before the build. */
export const hasPublicFile = (path: string) => existsSync(join(process.cwd(), 'public', path));
