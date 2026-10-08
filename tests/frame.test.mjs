import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assertWellFormed } from './helpers/xml.mjs';
import { svgDoc, cardRect, text } from '../scripts/lib/svg/frame.mjs';
import { THEMES, langColor } from '../scripts/lib/theme.mjs';

test('assertWellFormed accepts good SVG and rejects bad SVG', () => {
  assertWellFormed('<svg a="1"><g/><text>x &amp; y</text></svg>');
  assert.throws(() => assertWellFormed('<svg><g></svg>'));
  assert.throws(() => assertWellFormed('<svg><text>a & b</text></svg>'));
  assert.throws(() => assertWellFormed('<svg><text>a < b</text></svg>'));
  assert.throws(() => assertWellFormed('<svg>'));
});

test('svgDoc is well-formed, titled, and escapes the title', () => {
  const svg = svgDoc({ w: 100, h: 50, title: 'A & B "C"', desc: 'd<e', body: cardRect(100, 50, THEMES.light) });
  assertWellFormed(svg);
  assert.match(svg, /<title>A &amp; B &quot;C&quot;<\/title>/);
  assert.match(svg, /viewBox="0 0 100 50"/);
});

test('text escapes content and supports mono + tracking', () => {
  const t = text(1, 2, '<b>&', { mono: true, tracking: 1.2 });
  assertWellFormed(`<svg>${t}</svg>`);
  assert.match(t, /&lt;b&gt;&amp;/);
  assert.match(t, /letter-spacing="1.2"/);
});

test('both themes define every colour key and langColor falls back', () => {
  for (const th of Object.values(THEMES)) {
    for (const k of ['bg', 'card', 'ink', 'muted', 'line', 'accent', 'accent2', 'accent3']) assert.match(th[k], /^#[0-9a-fA-F]{6}$/);
  }
  assert.match(langColor('Python'), /^#/);
  assert.match(langColor('Brainf*ck'), /^#/);
});

test('assertWellFormed rejects a duplicate attribute, which browsers treat as a broken image', async () => {
  const { assertWellFormed } = await import('./helpers/xml.mjs');
  assert.throws(() => assertWellFormed('<svg><rect fill="a" stroke="b" stroke="c"/></svg>'), /duplicate attribute stroke/);
  assert.doesNotThrow(() => assertWellFormed('<svg><rect fill="a" stroke="b"/></svg>'));
});
