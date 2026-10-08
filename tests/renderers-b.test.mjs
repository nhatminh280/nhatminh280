import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assertWellFormed } from './helpers/xml.mjs';
import { THEMES } from '../scripts/lib/theme.mjs';
import { stackSVG } from '../scripts/lib/svg/stack.mjs';
import { projectSVG } from '../scripts/lib/svg/project.mjs';
import { heroSVG } from '../scripts/lib/svg/hero.mjs';

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

test('hero illustration is three IMU traces with a bracketed window', () => {
  const svg = heroSVG(hero, THEMES.light);
  assert.equal((svg.match(/<polyline/g) || []).length, 3);
  assert.ok(svg.includes('stroke-dasharray'));
});

test('hero is deterministic and copes with a very long name', () => {
  assert.equal(heroSVG(hero, THEMES.light), heroSVG(hero, THEMES.light));
  assertWellFormed(heroSVG({ ...hero, name: 'Nguyễn '.repeat(30) }, THEMES.light));
});
