import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assertWellFormed } from './helpers/xml.mjs';
import { THEMES } from '../scripts/lib/theme.mjs';
import { stackSVG } from '../scripts/lib/svg/stack.mjs';
import { projectSVG } from '../scripts/lib/svg/project.mjs';
import { heroSVG, flowTokens } from '../scripts/lib/svg/hero.mjs';
import { textWidth } from '../scripts/lib/format.mjs';

const groups = [
  { title: 'Languages', items: ['Python', 'C++'] },
  { title: 'LLM & RAG', items: ['LangGraph', 'ChromaDB', 'Gemini', 'Prompt engineering', 'Semantic search'] },
];

test('stack renders groups and escapes ampersands', () => {
  for (const th of Object.values(THEMES)) {
    const svg = stackSVG(groups, th);
    assertWellFormed(svg);
    assert.ok(svg.includes('LLM &amp; RAG'));
    assert.ok(svg.includes('>ChromaDB</text>'));
  }
});

test('stack labels keep their own casing (no forced ALL CAPS)', () => {
  assert.ok(stackSVG(groups, THEMES.light).includes('>Languages</text>'));
});

test('stack wraps many chips onto extra rows and survives one giant item', () => {
  const many = [{ title: 'Many', items: Array.from({ length: 40 }, (_, i) => `Tool-${i}`) }];
  const tall = Number(/height="(\d+)"/.exec(stackSVG(many, THEMES.light))[1]);
  const short = Number(/height="(\d+)"/.exec(stackSVG([groups[0]], THEMES.light))[1]);
  assert.ok(tall > short);
  assertWellFormed(stackSVG([{ title: 'X', items: ['y'.repeat(300)] }], THEMES.light));
});

const proj = {
  title: 'e-shop', blurb: 'Agentic RAG chatbot on LangGraph and a hybrid content + collaborative recommender with CLIP embeddings.',
  note: 'Owned the AI layer', fork: true, parent: 'finnzxje/e-shop', languages: ['Python', 'Java', 'TypeScript'],
};

test('project card shows fork provenance and the note', () => {
  const svg = projectSVG(proj, THEMES.light);
  assertWellFormed(svg);
  assert.ok(svg.includes('Fork of finnzxje/e-shop'));
  assert.ok(svg.includes('Owned the AI layer'));
  assert.ok(svg.includes('>Python</text>'));
});

test('a fork whose parent is no longer visible still says Fork', () => {
  const svg = projectSVG({ ...proj, fork: true, parent: null }, THEMES.light);
  assertWellFormed(svg);
  assert.ok(svg.includes('>Fork</text>'));
});

test('project card without fork shows no fork pill', () => {
  const svg = projectSVG({ ...proj, fork: false, parent: null }, THEMES.dark);
  assertWellFormed(svg);
  assert.ok(!svg.includes('Fork of'));
});

test('project card survives hostile and very long text', () => {
  const nasty = { ...proj, title: 'T'.repeat(120), blurb: 'Trợ lý tổng hợp tin công nghệ & "RAG" <script> 🐸 '.repeat(12), note: 'N'.repeat(200), languages: ['A'.repeat(80), 'B'] };
  const svg = projectSVG(nasty, THEMES.light);
  assertWellFormed(svg);
  assert.ok(!svg.includes('<script>'));
});

test('project card keeps a long language name whole', () => {
  const svg = projectSVG({ ...proj, languages: ['Jupyter Notebook'] }, THEMES.light);
  assert.ok(svg.includes('>Jupyter Notebook</text>'));
});

test('project blurb is at most three lines', () => {
  const svg = projectSVG({ ...proj, blurb: 'word '.repeat(200) }, THEMES.light);
  for (const y of [96, 115, 134]) assert.ok(svg.includes(`y="${y}"`), `blurb line at y=${y}`);
  assert.ok(!svg.includes('y="153"'), 'a fourth blurb line would collide with the language row');
});

const hero = { meta: '@nhatminh280, PTIT, Vietnam', name: 'Nhat Minh', role: 'AI Engineer', status: 'Open to opportunities as an AI Engineer', focus: 'LLM & RAG, computer vision, ML on small devices' };

test('hero renders name, role, status in both themes', () => {
  for (const th of Object.values(THEMES)) {
    const svg = heroSVG(hero, th);
    assertWellFormed(svg);
    for (const s of ['Nhat Minh', 'AI Engineer', 'Open to opportunities as an AI Engineer', 'LLM &amp; RAG']) assert.ok(svg.includes(s), s);
  }
});

test('hero is a three-scene cinematic banner with layered CSS motion', () => {
  const svg = heroSVG(hero, THEMES.light);
  assertWellFormed(svg);
  assert.ok(svg.includes('height="400"'), 'taller banner');
  assert.ok(!svg.includes('<polyline'), 'the IMU traces are gone');
  assert.ok(svg.includes('@keyframes'), 'animated');
  for (const c of ['scn-a', 'scn-b', 'scn-c']) assert.ok(svg.includes(`class="scn ${c}"`), c);
  for (const layer of ['grid', 'stars', 'pan']) assert.ok(svg.includes(`class="${layer}`), `${layer} layer`);
  assert.ok((svg.match(/class="dot"/g) || []).length >= 60, 'three embedding clusters');
  assert.equal((svg.match(/class="hit-line draw/g) || []).length, 12, 'four retrieved neighbours per scene');
  for (const l of ['products', 'articles', 'video frames']) assert.ok(svg.includes(`>${l}<`), `cluster label ${l}`);
  assert.ok(svg.includes('illustrative, not live inference'), 'honest caption');
});

test('the full focus line is shown, not cut with an ellipsis', () => {
  assert.ok(heroSVG(hero, THEMES.light).includes('LLM &amp; RAG, computer vision, ML on small devices'));
});

test('each scene narrates its stages before the answer streams', () => {
  const svg = heroSVG(hero, THEMES.light);
  for (const w of ['retrieving', 'reranking', 'generating', 'embedding frames', 'classifying']) assert.ok(svg.includes(`>${w}<`), w);
  assert.equal((svg.match(/4 chunks retrieved/g) || []).length, 2);
  assert.equal((svg.match(/4 nearest examples/g) || []).length, 1);
});

test('hero stays small and inert: size cap, no script, no external reference, reduced motion shows scene A only', () => {
  for (const th of Object.values(THEMES)) {
    const svg = heroSVG(hero, th);
    assert.ok(svg.length < 40000, `hero is ${svg.length} bytes`);
    assert.doesNotMatch(svg, /<script|href=|url\((?!#)|@import/);
  }
  const rm = heroSVG(hero, THEMES.dark).match(/@media \(prefers-reduced-motion: reduce\)\{.*?\}\}/)?.[0] ?? '';
  assert.match(rm, /animation:none/);
  for (const c of ['scn-b', 'scn-c']) assert.ok(rm.includes(`.${c}{display:none}`), c);
  assert.ok(rm.includes('.brief{display:none}'), 'stage captions would overlap if all were shown');
});

test('flowTokens wraps a streamed answer inside the panel and caps the line count', () => {
  const t = flowTokens('Similar buyers picked a pour-over set and a grinder, both under budget.', 156, 12, 5);
  assert.ok(t.length >= 10);
  for (const k of t) assert.ok(k.x + textWidth(k.word, 12) <= 156 + 0.01, `${k.word} overflows`);
  assert.ok(Math.max(...t.map((k) => k.line)) <= 4);
  const long = flowTokens('word '.repeat(200), 156, 12, 5);
  assert.ok(Math.max(...long.map((k) => k.line)) <= 4, 'overlong answers are cut, not overflowed');
});

test('hero is deterministic and copes with a very long name', () => {
  assert.equal(heroSVG(hero, THEMES.light), heroSVG(hero, THEMES.light));
  assertWellFormed(heroSVG({ ...hero, name: 'Nguyễn '.repeat(30) }, THEMES.light));
});
