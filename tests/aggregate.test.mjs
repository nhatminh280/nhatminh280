import { test } from 'node:test';
import assert from 'node:assert/strict';
import { languageShares, distinctLanguages, activeDays, yearsSince } from '../scripts/lib/aggregate.mjs';

test('languageShares sums bytes across repos and sorts descending', () => {
  const out = languageShares([{ Python: 600, 'C++': 100 }, { Python: 100, 'C++': 200 }]);
  assert.deepEqual(out.map((l) => l.name), ['Python', 'C++']);
  assert.equal(out[0].bytes, 700);
  assert.ok(Math.abs(out[0].pct - 70) < 1e-9);
});

test('languageShares ignores null maps, empty maps and zero-byte languages', () => {
  const out = languageShares([null, {}, { Shell: 0, Python: 10 }]);
  assert.deepEqual(out.map((l) => l.name), ['Python']);
  assert.equal(out[0].pct, 100);
});

test('languageShares returns [] when there is no data', () => assert.deepEqual(languageShares([null, {}]), []));

test('languageShares folds the tail into Other', () => {
  const langs = Object.fromEntries('abcdefgh'.split('').map((k, i) => [k, 100 - i]));
  const out = languageShares([langs], 3);
  assert.equal(out.length, 4);
  assert.equal(out.at(-1).name, 'Other');
  assert.ok(Math.abs(out.reduce((n, l) => n + l.pct, 0) - 100) < 1e-9);
});

test('distinctLanguages counts languages with bytes > 0', () =>
  assert.equal(distinctLanguages([{ Python: 5, Go: 0 }, { Python: 1, 'C++': 2 }, null]), 2));

test('activeDays counts days with at least one contribution', () => {
  const weeks = [
    { contributionDays: [{ contributionCount: 0 }, { contributionCount: 3 }] },
    { contributionDays: [{ contributionCount: 1 }, { contributionCount: 0 }] },
  ];
  assert.equal(activeDays(weeks), 2);
});

test('yearsSince returns whole completed years', () => {
  const now = new Date('2026-10-08T00:00:00Z');
  assert.equal(yearsSince('2022-10-04T14:12:55Z', now), 4);
  assert.equal(yearsSince('2022-10-09T00:00:00Z', now), 3);
  assert.equal(yearsSince('2030-01-01T00:00:00Z', now), 0);
});
