import { textWidth, truncate } from '../format.mjs';
import { svgDoc, cardRect, text } from './frame.mjs';

// Hero art: a retrieval-augmented answer, filmed in three scenes. A question arrives, its point lands in a map
// of embeddings, the nearest items light up, stages are narrated, and the answer streams out token by token.
// Scenes cycle on one clock (the work behind e-shop, the news assistant and the sign-language classifier).
// Layers drift at different speeds for depth. Everything is a pure function of its inputs and CSS-only, so it
// animates inside GitHub's <img> sandbox and asset diffs stay meaningful. It is an illustration, not live
// inference; the caption says so.

const W = 900, H = 400;
const SCENE = 10;                 // seconds per scene
const MONO_ADV = 0.6;
const SIZE = 12;

const CLUSTERS = [
  { key: 'products', label: 'products', c: [500, 222], r: 44, color: 'accent' },
  { key: 'articles', label: 'articles', c: [622, 180], r: 40, color: 'accent2' },
  { key: 'frames', label: 'video frames', c: [588, 304], r: 38, color: 'accent3' },
];

const SCENES = [
  { cls: 'scn-a', cluster: 0, query: 'recommend a gift under $50', q: [510, 214],
    stages: ['retrieving', 'reranking', 'generating'], found: 'chunks retrieved',
    answer: 'Similar buyers picked a pour-over set and a grinder, both under budget.' },
  { cls: 'scn-b', cluster: 1, query: 'what changed in AI this week', q: [628, 172],
    stages: ['retrieving', 'reranking', 'generating'], found: 'chunks retrieved',
    answer: 'Found 3 matching articles, grouped by topic for the weekly report.' },
  { cls: 'scn-c', cluster: 2, query: 'which sign is in this clip?', q: [582, 310],
    stages: ['embedding frames', 'matching examples', 'classifying'], found: 'nearest examples',
    answer: 'Closest to one of 100 sign classes, judged from the frame features.' },
];
const CYCLE = SCENE * SCENES.length;

// Word positions for the streamed answer. Mono text, so columns are exact. Overlong answers are cut at maxLines.
export function flowTokens(answer, maxWidth, size, maxLines) {
  const adv = size * MONO_ADV;
  const cols = Math.floor(maxWidth / adv);
  const out = [];
  let line = 0, col = 0;
  for (const word of String(answer).split(/\s+/).filter(Boolean)) {
    const w = [...word].length > cols ? truncate(word, maxWidth, size) : word;
    const len = [...w].length;
    if (col > 0 && col + 1 + len > cols) { line += 1; col = 0; }
    if (line >= maxLines) break;
    out.push({ word: w, line, x: (col > 0 ? col + 1 : 0) * adv });
    col += (col > 0 ? 1 : 0) + len;
  }
  return out;
}

// Small deterministic generator so every cloud is identical on every build.
function rng(seed) {
  let s = seed;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

function disc(seed, n, [cx, cy], r, keepClear, gap) {
  const rnd = rng(seed);
  const pts = [];
  while (pts.length < n) {
    const a = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * r;
    const p = [cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.85];
    const clear = keepClear.every((q) => Math.hypot(p[0] - q[0], p[1] - q[1]) > gap);
    const apart = pts.every((q) => Math.hypot(p[0] - q[0], p[1] - q[1]) > 8);
    if (clear && apart) pts.push(p);
  }
  return pts;
}

const f = (n) => Number(n.toFixed(1));
const delay = (s, d) => `style="--d:${f(s + d)}s"`;
const pct = (sec) => Number(((sec / CYCLE) * 100).toFixed(3));

function css(th) {
  const L = (name) => `.${name}{animation:${name} ${CYCLE}s linear infinite both;animation-delay:var(--d)}`;
  return `<style>`
    + L('in') + `.draw{stroke-dasharray:1;animation:draw ${CYCLE}s linear infinite both;animation-delay:var(--d)}`
    + `.brief{animation:brief ${CYCLE}s linear infinite both;animation-delay:var(--d)}`
    + `.tok{animation:in ${CYCLE}s linear infinite both,fresh ${CYCLE}s linear infinite both;animation-delay:var(--d)}`
    + `.scn{animation:scn ${CYCLE}s linear infinite both;animation-delay:var(--s)}`
    + `.ring{transform-box:fill-box;transform-origin:center;animation:ring 2.4s ease-out infinite}`
    + `.blink{animation:blink 1s steps(1) infinite}`
    + `.pulse{animation:pulse 2.6s ease-in-out infinite}`
    + `.aur{animation:aur 24s ease-in-out infinite alternate;animation-delay:var(--d)}`
    + `.grid{animation:grid 40s linear infinite}`
    + `.stars{animation:stars 26s ease-in-out infinite alternate}`
    + `.pan{animation:pan 18s ease-in-out infinite alternate}`
    + `@keyframes in{0%{opacity:0}${pct(0.3)}%{opacity:1}${pct(9.8)}%{opacity:1}${pct(10)}%,100%{opacity:0}}`
    + `@keyframes draw{0%{stroke-dashoffset:1;opacity:1}${pct(1.2)}%{stroke-dashoffset:0}${pct(9.8)}%{stroke-dashoffset:0;opacity:1}${pct(10)}%,100%{stroke-dashoffset:1;opacity:0}}`
    + `@keyframes brief{0%{opacity:0}${pct(0.15)}%{opacity:1}${pct(0.8)}%{opacity:1}${pct(0.95)}%,100%{opacity:0}}`
    + `@keyframes scn{0%{opacity:0}${pct(0.2)}%{opacity:1}${pct(9.6)}%{opacity:1}${pct(9.8)}%,100%{opacity:0}}`
    + `@keyframes fresh{0%,${pct(0.3)}%{fill:${th.accent3}}${pct(0.5)}%,100%{fill:${th.ink}}}`
    + `@keyframes ring{0%{transform:scale(1);opacity:.7}100%{transform:scale(3.4);opacity:0}}`
    + `@keyframes blink{50%{opacity:0}}`
    + `@keyframes pulse{50%{opacity:.3}}`
    + `@keyframes aur{from{transform:translate(0,0)}to{transform:translate(var(--x),var(--y))}}`
    + `@keyframes grid{to{transform:translate(-48px,-48px)}}`
    + `@keyframes stars{from{transform:translate(-8px,3px)}to{transform:translate(8px,-3px)}}`
    + `@keyframes pan{from{transform:translate(-3px,-2px)}to{transform:translate(3px,2px)}}`
    + `@media (prefers-reduced-motion: reduce){.in,.draw,.brief,.tok,.scn,.ring,.blink,.pulse,.grid,.stars,.pan{animation:none}.aur{animation:none}.scn-b{display:none}.scn-c{display:none}.brief{display:none}}`
    + `</style>`;
}

// Quiet backdrop: coordinate grid (drifts one cell per loop) and a few far-off points (drift the other way).
function backdrop(th) {
  const glow = (id, color) => `<radialGradient id="${id}"><stop offset="0" stop-color="${color}" stop-opacity="${th.glow}"/><stop offset="0.55" stop-color="${color}" stop-opacity="${f(th.glow * 0.35)}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`;
  let g = `<defs>${glow('ga', th.accent)}${glow('gb', th.accent2)}${glow('gc', th.cyan)}<clipPath id="card"><rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="18"/></clipPath>`
    + `<radialGradient id="halo"><stop offset="0" stop-color="${th.accent}" stop-opacity="0.28"/><stop offset="1" stop-color="${th.accent}" stop-opacity="0"/></radialGradient></defs>`;
  g += `<g clip-path="url(#card)">`
    + `<circle class="aur a1" cx="560" cy="110" r="280" fill="url(#ga)" style="--x:50px;--y:30px;--d:0s"/>`
    + `<circle class="aur a2" cx="800" cy="340" r="250" fill="url(#gb)" style="--x:-60px;--y:-24px;--d:-9s"/>`
    + `<circle class="aur a3" cx="170" cy="380" r="260" fill="url(#gc)" style="--x:40px;--y:-34px;--d:-15s"/>`
    + `<g class="grid" stroke="${th.line}" stroke-opacity="0.55" stroke-width="1">`;
  for (let x = 0; x <= W + 48; x += 48) g += `<line x1="${x}" y1="-48" x2="${x}" y2="${H + 48}"/>`;
  for (let y = 0; y <= H + 48; y += 48) g += `<line x1="-48" y1="${y}" x2="${W + 48}" y2="${y}"/>`;
  g += `</g>`;
  const rnd = rng(31);
  g += `<g class="stars" fill="${th.muted}" fill-opacity="0.22">`;
  for (let i = 0; i < 38; i++) g += `<circle cx="${f(430 + rnd() * 450)}" cy="${f(20 + rnd() * 360)}" r="${f(0.8 + rnd() * 1.2)}"/>`;
  return g + `</g></g>`;
}

function ragArt(th) {
  const X0 = 450;
  const panel = { x: 696, y: 120, w: 170, h: 214, pad: 12 };
  const qs = SCENES.map((s) => s.q);
  const clouds = CLUSTERS.map((cl, i) => disc(11 + i * 7, 22, cl.c, cl.r, qs, 9));
  const all = clouds.flat();

  let out = backdrop(th) + css(th);

  // The map: three clusters of dots with a name each, drifting together as one camera.
  let map = '';
  CLUSTERS.forEach((cl, i) => {
    map += clouds[i].map(([x, y]) => `<circle class="dot" cx="${f(x)}" cy="${f(y)}" r="2.6" fill="${th[cl.color]}" fill-opacity="0.5"/>`).join('');
    map += text(cl.c[0] - cl.r, f(cl.c[1] + cl.r + 18), cl.label, { size: 11, fill: th.muted, mono: true });
  });
  out += `<g class="pan">${map}</g>`;

  SCENES.forEach((sc, si) => {
    const s = si * SCENE;
    const [qx, qy] = sc.q;
    const cl = CLUSTERS[sc.cluster];
    const chipW = Math.ceil(textWidth(sc.query, SIZE) + 28);
    const near = all.map((p) => ({ p, d: Math.hypot(p[0] - qx, p[1] - qy) })).sort((a, b) => a.d - b.d).slice(0, 4).map((n) => n.p);

    let g = `<g class="scn ${sc.cls}" style="--s:${s}s">`;
    // scene indicator: three pills, the current one lit
    SCENES.forEach((_, j) => { g += `<rect x="${X0 + j * 26}" y="372" width="${j === si ? 20 : 8}" height="4" rx="2" fill="${j === si ? th.accent : th.line}"/>`; });
    // 1. the question
    g += `<g class="in" ${delay(s, 0.3)}><rect x="${X0}" y="40" width="${chipW}" height="30" rx="6" fill="${th.bg}" fill-opacity="0.72" stroke="${th.line}"/>`
      + text(X0 + 14, 59, sc.query, { size: SIZE, fill: th.ink, mono: true }) + `</g>`;

    // 2. it lands in the map (map overlays share the camera drift)
    let ov = `<circle class="in" ${delay(s, 1.4)} cx="${cl.c[0]}" cy="${cl.c[1]}" r="${cl.r + 26}" fill="url(#halo)"/>`;
    ov += `<path class="draw" pathLength="1" ${delay(s, 0.9)} d="M${X0 + 18} 70 C${X0 + 18} ${f(qy - 40)} ${qx} ${f(qy - 70)} ${qx} ${f(qy - 7)}" fill="none" stroke="${th.accent}" stroke-width="1.5"/>`;
    ov += `<g class="in" ${delay(s, 1.6)}><circle class="ring" cx="${qx}" cy="${qy}" r="5" fill="none" stroke="${th.accent}" stroke-width="1.5"/>`
      + `<circle cx="${qx}" cy="${qy}" r="5" fill="${th.accent}"/></g>`;
    // 3. the nearest items are retrieved
    near.forEach(([x, y], i) => {
      ov += `<line class="hit-line draw" pathLength="1" ${delay(s, 2.0 + i * 0.15)} x1="${qx}" y1="${qy}" x2="${f(x)}" y2="${f(y)}" stroke="${th.accent2}" stroke-width="1.5"/>`;
      ov += `<circle class="in" ${delay(s, 2.5 + i * 0.15)} cx="${f(x)}" cy="${f(y)}" r="4.6" fill="${th.accent2}"/>`;
    });
    g += `<g class="pan">${ov}</g>`;

    // 4. stages are narrated, then the answer streams out
    g += `<line class="draw" pathLength="1" ${delay(s, 2.9)} x1="688" y1="226" x2="${panel.x}" y2="226" stroke="${th.accent2}" stroke-width="1.5"/>`;
    g += `<g class="in" ${delay(s, 3.0)}><rect x="${panel.x}" y="${panel.y}" width="${panel.w}" height="${panel.h}" rx="10" fill="${th.bg}" fill-opacity="0.72" stroke="${th.line}"/></g>`;
    const sy = panel.y + 26, sx = panel.x + panel.pad;
    sc.stages.forEach((st, i) => {
      const last = i === sc.stages.length - 1;
      const cls = last ? 'in' : 'brief';
      const t0 = [3.2, 4.1, 5.0][i];
      g += `<g class="${cls}" ${delay(s, t0)}><circle class="pulse" cx="${sx + 3}" cy="${sy - 4}" r="3" fill="${last ? th.accent3 : th.accent}"/>`
        + text(sx + 14, sy, st, { size: 11, fill: last ? th.ink : th.muted, mono: true }) + `</g>`;
    });
    const toks = flowTokens(sc.answer, panel.w - panel.pad * 2, SIZE, 6);
    const ty = (line) => panel.y + 62 + line * 20;
    toks.forEach((t, i) => {
      g += `<text class="tok" ${delay(s, 5.2 + i * 0.17)} x="${f(sx + t.x)}" y="${ty(t.line)}" font-size="${SIZE}" fill="${th.ink}" font-family="monospace">${t.word.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text>`;
    });
    const last = toks[toks.length - 1];
    g += `<g class="in" ${delay(s, 5.2 + toks.length * 0.17)}><rect class="blink" x="${f(sx + last.x + textWidth(last.word, SIZE) + 3)}" y="${ty(last.line) - 11}" width="6" height="13" rx="1" fill="${th.accent3}"/></g>`;
    g += `<g class="in" ${delay(s, 5.0)}><circle cx="${sx + 3}" cy="${panel.y + panel.h - 17}" r="3" fill="${th.accent2}"/>`
      + text(sx + 14, panel.y + panel.h - 13, `${near.length} ${sc.found}`, { size: 11, fill: th.muted, mono: true }) + `</g>`;
    out += g + `</g>`;
  });
  out += text(866, 388, 'illustrative, not live inference', { size: 11, fill: th.muted, anchor: 'end' });
  return out;
}

export function heroSVG(hero, th) {
  let body = cardRect(W, H, th, 18) + ragArt(th);
  body += text(40, 112, truncate(hero.meta, 380, 13), { size: 13, fill: th.muted, mono: true });
  body += text(40, 184, truncate(hero.name, 380, 58), { size: 58, weight: 800, fill: th.ink });
  body += text(40, 232, truncate(hero.role, 380, 32), { size: 32, weight: 700, fill: th.accent });
  const status = truncate(hero.status, 380, 13);
  const pillW = Math.ceil(textWidth(status, 13) + 38);
  body += `<rect x="40" y="262" width="${pillW}" height="30" rx="6" fill="${th.bg}" stroke="${th.line}"/>`
    + `<circle class="pulse" cx="58" cy="277" r="4.5" fill="${th.accent2}"/>`
    + text(70, 282, status, { size: 13, weight: 600, fill: th.ink });
  body += text(40, 330, truncate(hero.focus, 396, 14), { size: 14, fill: th.muted });
  return svgDoc({ w: W, h: H, title: `${hero.name}, ${hero.role}`, desc: `${hero.status}. ${hero.focus}`, body });
}
