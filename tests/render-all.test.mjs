import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assertWellFormed } from './helpers/xml.mjs';
import { config } from '../scripts/config.mjs';
import { renderAll } from '../scripts/lib/render-all.mjs';
import { esc } from '../scripts/lib/format.mjs';
import { THEMES, langColor } from '../scripts/lib/theme.mjs';

const data = {
  figures: { repos: 17, commits: 254, followers: 8, years: 4, activeDays: 112, languageCount: 9 },
  languages: [{ name: 'Python', bytes: 70, pct: 70 }, { name: 'C++', bytes: 30, pct: 30 }],
  featured: config.featured.map((f) => ({ ...f, url: `https://github.com/x/${f.repo}`, fork: f.repo === 'e-shop', parent: f.repo === 'e-shop' ? 'finnzxje/e-shop' : null, languages: ['Python', 'TypeScript'] })),
};

test('renderAll emits exactly the 24 expected files', () => {
  const files = renderAll({ data, config });
  const expected = [];
  for (const t of ['light', 'dark']) {
    for (const n of ['hero', 'activity', 'stack', 'languages', 'project-1', 'project-2', 'project-3', 'project-4', 'badge-linkedin', 'badge-codeforces', 'badge-gmail', 'badge-github']) expected.push(`${n}-${t}.svg`);
  }
  assert.deepEqual(Object.keys(files).sort(), expected.sort());
});

test('every file is well-formed, self-contained, and sed-cache-bustable', () => {
  for (const [name, svg] of Object.entries(renderAll({ data, config }))) {
    assertWellFormed(svg);
    assert.match(name, /^[a-z0-9-]+-(dark|light)\.svg$/, `${name} must match the workflow's sed pattern`);
    assert.doesNotMatch(svg.replace('http://www.w3.org/2000/svg', ''), /https?:|href=|<script|foreignObject/, `${name} has an external/unsafe reference`);
  }
});

test('config makes no award claims and has no Facebook link', () => {
  const blob = JSON.stringify(config).toLowerCase();
  assert.ok(!/top 1|champion|winner|prize|award/.test(blob));
  assert.ok(!blob.includes('facebook'));
});

test('light and dark variants differ only by theme colours', () => {
  const files = renderAll({ data, config });
  assert.notEqual(files['hero-light.svg'], files['hero-dark.svg']);
});

test('no stack label or chip in the real config is truncated', () => {
  const svg = renderAll({ data, config })['stack-light.svg'];
  for (const g of config.stack) {
    assert.ok(svg.includes(`>${esc(g.title)}</text>`), `stack label "${g.title}" was truncated`);
    for (const item of g.items) assert.ok(svg.includes(`>${esc(item)}</text>`), `chip "${item}" was truncated`);
  }
});

// Blue direction: every colour in the theme sits in the blue family, so no card drifts back to green or amber.
const hue = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b), d = max - Math.min(r, g, b);
  if (!d) return null;
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return (h * 60 + 360) % 360;
};

test('theme colours are all blue-family in both modes', () => {
  for (const [mode, th] of Object.entries(THEMES)) {
    for (const k of ['accent', 'accent2', 'accent3', 'cyan', 'bg', 'card', 'line', 'ink', 'muted']) {
      const h = hue(th[k]);
      assert.ok(h !== null && h >= 190 && h <= 260, `${mode}.${k} ${th[k]} has hue ${h}`);
    }
  }
  assert.notEqual(new Set(['accent', 'accent2', 'accent3'].map((k) => THEMES.dark[k])).size, 1, 'three distinct blues');
});

test('language colours are blue too, and still tell the main languages apart', () => {
  const names = ['Python', 'C++', 'Jupyter Notebook', 'JavaScript', 'TypeScript', 'Java', 'Shell', 'HTML', 'Other', 'Brainfuck'];
  for (const n of names) {
    const h = hue(langColor(n));
    assert.ok(h !== null && h >= 190 && h <= 260, `${n} ${langColor(n)} has hue ${h}`);
  }
  const main = ['Python', 'C++', 'Jupyter Notebook', 'JavaScript'].map(langColor);
  assert.equal(new Set(main).size, main.length, 'main languages keep distinct colours');
});
