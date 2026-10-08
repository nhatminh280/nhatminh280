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

test('stack is one glass row per group, each with an icon, and one chip per item, over the shared aurora', () => {
  const real = [
    { title: 'Languages', items: ['Python', 'C++'] }, { title: 'Machine learning', items: ['PyTorch', 'XGBoost'] },
    { title: 'LLM and RAG', items: ['LangGraph', 'ChromaDB', 'Gemini'] }, { title: 'Computer vision', items: ['OpenCV'] },
    { title: 'Embedded', items: ['ESP32', 'MPU6050'] }, { title: 'Something new', items: ['x'] },
  ];
  for (const th of Object.values(THEMES)) {
    const svg = stackSVG(real, th);
    assertWellFormed(svg);
    assert.equal((svg.match(/class="row rise"/g) || []).length, 6);
    assert.equal((svg.match(/class="ico"/g) || []).length, 6, 'every group has an icon, including one the icon set has never heard of');
    assert.equal((svg.match(/class="chip"/g) || []).length, 11);
    assert.equal((svg.match(/class="aur /g) || []).length, 3);
    assert.doesNotMatch(svg, /<filter|feGaussianBlur|<script|href=|url\((?!#)/);
    assert.ok(svg.length < 16000, `stack is ${svg.length} bytes`);
    assert.match(svg, /@media \(prefers-reduced-motion: reduce\)\{[^]*\.rise\{animation:none\}/);
    assert.match(svg, /\.rise\{animation:rise [0-9.]+s ease-out both;animation-delay:calc\(var\(--i\) \* [0-9.]+s\)\}/);
  }
});

test('the real stack keeps every chip on one line per group where it fits', () => {
  const llm = [{ title: 'LLM and RAG', items: ['LangGraph', 'ChromaDB', 'Gemini', 'Prompt engineering', 'Semantic search'] }];
  const rows = (svg) => new Set([...svg.matchAll(/<rect class="chipbox" x="[\d.]+" y="([\d.]+)"/g)].map((m) => m[1])).size;
  assert.equal(rows(stackSVG(llm, THEMES.light)), 1, 'the widest real group stays on one row');
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

const gestures = [{ name: 'Clapping', f1: 0.89 }, { name: 'Fist Making', f1: 0.94 }, { name: 'Thumbs Up', f1: 0.88 }];
const ARTS = ['rerank', 'sources', 'signal', 'health'];

test('a project card with art is a taller glass card with a looping illustration, in every theme', () => {
  for (const th of Object.values(THEMES)) for (const art of ARTS) {
    const svg = projectSVG({ ...proj, art, gestures }, th);
    assertWellFormed(svg);
    assert.ok(svg.includes('height="300"'), `${art} card height`);
    assert.ok(svg.includes('class="art"'), `${art} has an art group`);
    assert.ok(svg.includes('@keyframes'), `${art} animates`);
    assert.ok(svg.includes('>illustration</text>'), `${art} says it is an illustration`);
    assert.doesNotMatch(svg, /<script|<filter|href=|url\((?!#)|@import/, `${art} stays inert`);
    assert.ok(svg.length < 24000, `${art} is ${svg.length} bytes`);
    assert.match(svg, /@media \(prefers-reduced-motion: reduce\)\{[^]*animation:none/, `${art} reduced motion`);
    assert.equal((svg.match(/class="aur /g) || []).length, 3, `${art} shares the aurora`);
  }
});

test('a project card without art keeps the compact layout', () => {
  const svg = projectSVG(proj, THEMES.light);
  assert.ok(svg.includes('height="184"'));
  assert.ok(!svg.includes('class="art"'));
});

test('art cards keep text below the illustration and the blurb at three lines', () => {
  const svg = projectSVG({ ...proj, art: 'rerank', blurb: 'word '.repeat(200) }, THEMES.light);
  assert.ok(svg.includes('y="154"'), 'title below the art band');
  for (const y of [212, 231, 250]) assert.ok(svg.includes(`y="${y}"`), `blurb line y=${y}`);
  assert.ok(!svg.includes('y="269"'), 'a fourth blurb line would hit the languages row');
});

test('rerank: four products slide into relevance order and the winner is outlined', () => {
  const svg = projectSVG({ ...proj, art: 'rerank' }, THEMES.dark);
  assert.equal((svg.match(/class="row"/g) || []).length, 4);
  for (const n of ['pour-over set', 'grinder', 'mug', 'kettle', 'gift under $50']) assert.ok(svg.includes(`>${n}</text>`), n);
  assert.ok(svg.includes('class="best"'));
});

test('sources: feeds flow through a topic filter into a vector store and a weekly report', () => {
  const svg = projectSVG({ ...proj, art: 'sources' }, THEMES.dark);
  assert.ok((svg.match(/class="pt /g) || []).length >= 6, 'particles on three lanes');
  for (const n of ['topic filter', 'chromadb', 'weekly report']) assert.ok(svg.includes(`>${n}</text>`), n);
  assert.equal((svg.match(/class="wr"/g) || []).length, 4, 'four report lines are written');
});

test('signal: three gesture scenes, with the real names and F1 from the repo, and one scene under reduced motion', () => {
  const svg = projectSVG({ ...proj, art: 'signal', gestures }, THEMES.dark);
  assert.equal((svg.match(/<polyline/g) || []).length, 9, 'three axes per gesture');
  for (const g of gestures) { assert.ok(svg.includes(`>${g.name}</text>`), g.name); assert.ok(svg.includes(`>F1 ${g.f1.toFixed(2)}</text>`), `F1 ${g.f1}`); }
  assert.ok(svg.includes('stroke-dasharray'), 'bracketed window');
  assert.match(svg, /\.sc2\{display:none\}/);
  assert.match(svg, /\.sc3\{display:none\}/);
});

test('signal without gesture data draws nothing misleading', () => {
  const svg = projectSVG({ ...proj, art: 'signal' }, THEMES.dark);
  assertWellFormed(svg);
  assert.equal((svg.match(/<polyline/g) || []).length, 3, 'one neutral trace set, no names, no scores');
  assert.ok(!/F1 /.test(svg));
});

test('health: a medical report is scanned, metrics come out, and food and exercise advice is written', () => {
  const svg = projectSVG({ ...proj, art: 'health' }, THEMES.dark);
  assertWellFormed(svg);
  assert.equal((svg.match(/class="chip"/g) || []).length, 3, 'three extracted metrics');
  assert.equal((svg.match(/class="rc"/g) || []).length, 2, 'food and exercise cards');
  assert.ok((svg.match(/class="sk"/g) || []).length >= 4, 'advice lines are written');
  assert.ok(svg.includes('class="beam"'), 'a scan beam');
  for (const n of ['OCR', 'health metrics', 'food rag', 'exercise rag']) assert.ok(svg.includes(`>${n}</text>`), n);
});

test('a card for a repo owned by someone else says so, with my share of its commits', () => {
  const ext = { ...proj, fork: false, parent: null, external: true, ownerLogin: 'kodomotachi', contributions: { mine: 19, total: 20 }, note: 'AI Agents hackathon' };
  const svg = projectSVG(ext, THEMES.light);
  assertWellFormed(svg);
  assert.ok(svg.includes('>By kodomotachi, 19 of 20 commits</text>'));
  assert.ok(svg.includes('>AI Agents hackathon</text>'), 'the note still fits beside it');
  const bare = projectSVG({ ...ext, contributions: null }, THEMES.light);
  assert.ok(bare.includes('>By kodomotachi</text>'));
  assert.ok(!projectSVG({ ...ext, external: false }, THEMES.light).includes('By kodomotachi'));
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
  for (const l of ['products', 'articles', 'health guides']) assert.ok(svg.includes(`>${l}<`), `cluster label ${l}`);
  assert.ok(svg.includes('illustrative, not live inference'), 'honest caption');
});

test('hero has a soft blurred aurora behind the grid, and it holds still under reduced motion', () => {
  for (const th of Object.values(THEMES)) {
    const svg = heroSVG(hero, th);
    assert.equal((svg.match(/class="aur /g) || []).length, 3, 'three drifting glows');
    assert.equal((svg.match(/<radialGradient/g) || []).length, 4, 'three glows plus the cluster halo');
    assert.ok(svg.indexOf('class="aur ') < svg.indexOf('class="grid"'), 'aurora sits behind the grid');
    assert.doesNotMatch(svg, /<filter|feGaussianBlur/, 'gradients, not filters: cheap enough to animate');
    assert.match(svg, /@media \(prefers-reduced-motion: reduce\)\{[^]*\.aur\{animation:none\}/);
  }
  const op = (th) => Number(heroSVG(hero, th).match(/stop-opacity="([0-9.]+)"/)[1]);
  assert.ok(op(THEMES.dark) > op(THEMES.light), 'glow is stronger on dark, restrained on light');
});

test('the third glow is cyan in both themes', () => {
  for (const th of Object.values(THEMES)) {
    assert.ok(th.cyan, 'theme defines cyan');
    const svg = heroSVG(hero, th);
    assert.ok(svg.includes(`<radialGradient id="gc"><stop offset="0" stop-color="${th.cyan}"`), 'gc uses cyan');
  }
});

test('the full focus line is shown, not cut with an ellipsis', () => {
  assert.ok(heroSVG(hero, THEMES.light).includes('LLM &amp; RAG, computer vision, ML on small devices'));
});

test('the third scene is Heartify, and nothing in the hero mentions video or sign language any more', () => {
  const svg = heroSVG(hero, THEMES.light);
  assert.ok(svg.includes('>healthy dinner for my report</text>'));
  for (const w of ['Matched', 'metrics', 'food', 'exercise', 'guidance.']) assert.ok(svg.includes(`>${w}</text>`), `answer word ${w}`);
  const words = [...svg.matchAll(/>([^<]+)<\/(?:text|title|desc)>/g)].map((m) => m[1]).join(' ');
  assert.ok(words.length > 200, 'found the visible text');
  assert.doesNotMatch(words, /\bsigns?\b|video|\bclip\b|classif|frames/i);
});

test('each scene narrates its stages before the answer streams', () => {
  const svg = heroSVG(hero, THEMES.light);
  for (const w of ['retrieving', 'reranking', 'generating', 'reading report']) assert.ok(svg.includes(`>${w}<`), w);
  assert.equal((svg.match(/4 chunks retrieved/g) || []).length, 3);
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
