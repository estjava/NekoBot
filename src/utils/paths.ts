import path from 'node:path';

// src/utils (npm run dev) and dist/utils (npm start) are both two levels below the
// project root, so these paths are identical in both modes.
export const ROOT_DIR = path.resolve(__dirname, '..', '..');

/** Translation files (en.json, id.json). Tracked by Git. */
export const LOCALES_DIR = path.join(ROOT_DIR, 'locales');

/** Runtime data (prefixes.json, languages.json, ...). Ignored by Git. */
export const DATA_DIR = path.join(ROOT_DIR, 'data');
