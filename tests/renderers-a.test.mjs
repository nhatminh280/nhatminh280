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
  assert.match(b, /height="32"/);
});
