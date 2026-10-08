import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const readme = readFileSync(join(root, 'README.md'), 'utf8');
const refs = [...readme.matchAll(/assets\/([a-z0-9-]+\.svg)(\?v=\d+)?/g)];

test('README references assets, every one exists and is cache-busted', () => {
  assert.ok(refs.length >= 20, 'expected many asset references');
  for (const [full, name, v] of refs) {
    assert.ok(existsSync(join(root, 'assets', name)), `${name} is referenced but missing`);
    assert.ok(v, `${full} lacks ?v=`);
  }
});

test('every theme pair is complete', () => {
  const names = new Set(refs.map((r) => r[1]));
  for (const n of names) {
    const other = n.endsWith('-dark.svg') ? n.replace('-dark.svg', '-light.svg') : n.replace('-light.svg', '-dark.svg');
    assert.ok(names.has(other), `${n} has no counterpart ${other}`);
  }
});

test('README has no third-party widgets and no award claims', () => {
  assert.doesNotMatch(readme, /vercel\.app|herokuapp|shields\.io|streak-stats|visitor-badge|laobi/);
  assert.doesNotMatch(readme.toLowerCase(), /top 1|champion|winner/);
  assert.doesNotMatch(readme.toLowerCase(), /facebook/);
});

test('project cards use percentage widths so two fit per row at any column width', () => {
  const imgs = [...readme.matchAll(/<img[^>]*src="assets\/project-\d-light\.svg[^>]*>/g)].map((m) => m[0]);
  assert.equal(imgs.length, 4);
  for (const img of imgs) assert.match(img, /width="4\d%"/);
});

test('all four project cards link to the featured repos', () => {
  for (const r of ['nhatminh280/e-shop', 'nhatminh280/Intelligent-News-Assistant_RAG', 'nhatminh280/detect_actions_using_MPU-ESP32', 'kodomotachi/heartify-AI']) {
    assert.ok(readme.includes(`https://github.com/${r}`), r);
  }
});

test('the four contact badges are shown at the new height', () => {
  const imgs = [...readme.matchAll(/<img[^>]*src="assets\/badge-[a-z]+-light\.svg[^>]*>/g)].map((m) => m[0]);
  assert.equal(imgs.length, 4);
  for (const img of imgs) assert.match(img, /height="44"/);
});
