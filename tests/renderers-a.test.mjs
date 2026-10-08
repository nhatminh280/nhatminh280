import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assertWellFormed } from './helpers/xml.mjs';
import { THEMES } from '../scripts/lib/theme.mjs';
import { activitySVG } from '../scripts/lib/svg/activity.mjs';
import { languagesSVG } from '../scripts/lib/svg/languages.mjs';
import { badgeSVG } from '../scripts/lib/svg/badge.mjs';

const figures = { repos: 17, commits: 254, followers: 8, years: 4, activeDays: 112, languageCount: 9 };

test('activity renders every figure, well-formed, in both themes', () => {
  for (const th of Object.values(THEMES)) {
    const svg = activitySVG(figures, th);
    assertWellFormed(svg);
    for (const v of ['17', '254', '112', '8', '4', '9']) assert.ok(svg.includes(`>${v}</text>`), `missing ${v}`);
  }
});

test('activity omits null figures instead of showing 0', () => {
  const svg = activitySVG({ ...figures, commits: null, activeDays: null }, THEMES.light);
  assertWellFormed(svg);
  assert.ok(!svg.includes('public commits'));
  assert.ok(!svg.includes('active days'));
});

test('activity keeps a genuine zero', () => {
  assert.ok(activitySVG({ ...figures, activeDays: 0 }, THEMES.light).includes('>0</text>'));
});

test('activity throws when there is nothing to show', () =>
  assert.throws(() => activitySVG({}, THEMES.light), /no figures/));

test('activity is one glass tile per figure, each with its own icon, over the shared aurora', () => {
  for (const th of Object.values(THEMES)) {
    const svg = activitySVG(figures, th);
    assert.equal((svg.match(/class="tile rise"/g) || []).length, 6);
    assert.equal((svg.match(/class="ico"/g) || []).length, 6);
    assert.equal((svg.match(/class="aur /g) || []).length, 3);
    assert.doesNotMatch(svg, /<filter|feGaussianBlur|<script|href=|url\((?!#)/);
    assert.ok(svg.length < 14000, `activity is ${svg.length} bytes`);
    assert.match(svg, /@media \(prefers-reduced-motion: reduce\)\{[^]*\.rise\{animation:none\}/);
  }
});

test('activity tiles reveal once, staggered, and reflow when a figure is missing', () => {
  const svg = activitySVG(figures, THEMES.dark);
  assert.match(svg, /\.rise\{animation:rise [0-9.]+s ease-out both;animation-delay:calc\(var\(--i\) \* [0-9.]+s\)\}/);
  assert.ok(!/infinite/.test(svg.match(/\.rise\{[^}]*\}/)[0]), 'tiles do not loop');
  const four = activitySVG({ ...figures, commits: null, activeDays: null }, THEMES.dark);
  assert.equal((four.match(/class="tile rise"/g) || []).length, 4);
  assertWellFormed(four);
});

test('activity labels are shown in full', () => {
  assert.ok(activitySVG(figures, THEMES.light).includes('>active days in 12 months</text>'));
});

const langs = [
  { name: 'Python', bytes: 700, pct: 70 }, { name: 'C++', bytes: 200, pct: 20 },
  { name: 'Jupyter Notebook', bytes: 60, pct: 6 }, { name: 'Other', bytes: 40, pct: 4 },
];

test('languages renders a legend with percentages', () => {
  const svg = languagesSVG(langs, THEMES.dark);
  assertWellFormed(svg);
  assert.ok(svg.includes('Python 70.0%'));
  assert.ok(svg.includes('Other 4.0%'));
});

test('languages handles empty data', () => {
  const svg = languagesSVG([], THEMES.light);
  assertWellFormed(svg);
  assert.ok(svg.includes('No public language data'));
});

test('languages legend wraps to extra rows rather than overflowing', () => {
  const many = Array.from({ length: 7 }, (_, i) => ({ name: `Language-number-${i}`, bytes: 10, pct: 100 / 7 }));
  const svg = languagesSVG(many, THEMES.light);
  assertWellFormed(svg);
  const h = Number(/height="(\d+)"/.exec(svg)[1]);
  assert.ok(h > 118, 'height should grow for wrapped legend rows');
});

test('badge width follows its label and text is escaped', () => {
  const a = badgeSVG({ label: 'Gmail', glyph: '@' }, THEMES.light);
  const b = badgeSVG({ label: 'A very long badge label & more', glyph: '&' }, THEMES.light);
  assertWellFormed(a);
  assertWellFormed(b);
  const w = (s) => Number(/width="(\d+)"/.exec(s)[1]);
  assert.ok(w(b) > w(a));
  assert.match(b, /height="44"/);
});

test('badge is a glass pill with a hand-drawn icon per platform, a glow in its own colour, and a one-shot rise', () => {
  const links = [['linkedin', 'in'], ['codeforces', 'CF'], ['gmail', '@'], ['github', 'GH']];
  const strokes = new Set();
  links.forEach(([id, glyph], i) => {
    for (const th of Object.values(THEMES)) {
      const svg = badgeSVG({ id, label: id, glyph }, th, i);
      assertWellFormed(svg);
      assert.ok(svg.includes('class="badge rise"'));
      assert.ok(svg.includes(`style="--i:${i}"`), 'stagger index');
      assert.ok(svg.includes('class="ico"'), `${id} icon`);
      assert.ok(!svg.includes(`>${glyph}</text>`), `${id} draws an icon, not its monogram`);
      assert.doesNotMatch(svg, /<filter|feGaussianBlur|<script|href=|url\((?!#)/);
      assert.ok(svg.length < 3500, `${id} badge is ${svg.length} bytes`);
      assert.match(svg, /@media \(prefers-reduced-motion: reduce\)\{[^]*\.rise\{animation:none\}/);
    }
    strokes.add(badgeSVG({ id, label: id, glyph }, THEMES.dark, i).match(/class="ico"[^>]*stroke="(#[0-9a-f]{6})"/)[1]);
  });
  assert.equal(strokes.size, 4, 'each platform has its own tone');
});

test('a badge for an unknown platform falls back to its monogram', () => {
  const svg = badgeSVG({ id: 'mastodon', label: 'Mastodon', glyph: 'M' }, THEMES.light);
  assertWellFormed(svg);
  assert.ok(svg.includes('>M</text>'));
});
