import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fmt, esc, textWidth, truncate, wrap } from '../scripts/lib/format.mjs';

test('fmt groups thousands', () => assert.equal(fmt(1234567), '1,234,567'));

test('esc escapes XML specials', () =>
  assert.equal(esc(`a&b<c>"d"'e'`), 'a&amp;b&lt;c&gt;&quot;d&quot;&#39;e&#39;'));

test('textWidth counts code points, not UTF-16 units', () =>
  assert.equal(textWidth('🐸', 10), textWidth('a', 10)));

test('truncate leaves short text alone', () =>
  assert.equal(truncate('hello', 200, 12), 'hello'));

test('truncate adds an ellipsis and stays inside the budget', () => {
  const out = truncate('x'.repeat(100), 100, 10);
  assert.ok(out.endsWith('…'));
  assert.ok(textWidth(out, 10) <= 100);
});

test('truncate handles Vietnamese text', () => {
  const s = 'Trợ lý tổng hợp tin công nghệ tiếng Việt theo tuần';
  const out = truncate(s, 150, 12);
  assert.ok(textWidth(out, 12) <= 150);
  assert.ok(out.endsWith('…'));
});

test('wrap caps the line count and ellipsizes the last line', () => {
  const lines = wrap('one two three four five six seven eight nine ten', 60, 10, 2);
  assert.equal(lines.length, 2);
  assert.ok(lines.every((l) => textWidth(l, 10) <= 60));
  assert.ok(lines[1].endsWith('…'));
});

test('wrap returns [] for blank input and keeps short text on one line', () => {
  assert.deepEqual(wrap('   ', 100, 12), []);
  assert.deepEqual(wrap('short text', 400, 12), ['short text']);
});
