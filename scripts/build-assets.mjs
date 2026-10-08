import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createClient } from './lib/github.mjs';
import { collect } from './lib/collect.mjs';
import { renderAll } from './lib/render-all.mjs';
import { config } from './config.mjs';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets');
const client = createClient({ token: process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '' });

// Any rejection here exits non-zero before a single file is written.
const data = await collect({ user: config.user, featured: config.featured, client });
const files = renderAll({ data, config });

await mkdir(OUT, { recursive: true });
await Promise.all(Object.entries(files).map(([name, svg]) => writeFile(join(OUT, name), svg)));
console.log(`wrote ${Object.keys(files).length} files to assets/`, data.figures);
