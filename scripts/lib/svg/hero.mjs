import { textWidth, truncate } from '../format.mjs';
import { svgDoc, cardRect, text } from './frame.mjs';

// Hero art: a retrieval-augmented answer, drawn as it happens. A question arrives, its point lands in an
// embedding space, the nearest chunks light up, and the answer streams out token by token. Two scenarios
// alternate on a 20 s clock (the work behind e-shop and the news assistant). Everything is a pure function of
// its inputs and CSS-only, so it animates inside GitHub's <img> sandbox and asset diffs stay meaningful.
// It is an illustration of the flow, not live inference; the caption says so.

const CYCLE = 20; // seconds, both scenarios; each owns half
const MONO_ADV = 0.6;

const SCENARIOS = [
  { cls: 'scn-a', start: 0, query: 'recommend a gift under $50', q: [540, 148],
    answer: 'Similar buyers picked a pour-over set and a grinder, both under budget.' },
  { cls: 'scn-b', start: CYCLE / 2, query: 'what changed in AI this week', q: [612, 190],
    answer: 'Found 3 matching articles, grouped by topic for the weekly report.' },
];

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

// Small deterministic generator so the embedding cloud is identical on every build.
function cloud(seed, n, box, keepClear, gap) {
  let s = seed;
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  const pts = [];
  while (pts.length < n) {
    const p = [box.x + rnd() * box.w, box.y + rnd() * box.h];
    const clear = keepClear.every((q) => Math.hypot(p[0] - q[0], p[1] - q[1]) > gap);
    const apart = pts.every((q) => Math.hypot(p[0] - q[0], p[1] - q[1]) > 9);
    if (clear && apart) pts.push(p);
  }
  return pts;
}

const f = (n) => Number(n.toFixed(1));
const delay = (s, d) => `style="--d:${f(s + d)}s"`;

function css(th) {
  return `<style>`
    + `.in{animation:in ${CYCLE}s linear infinite both;animation-delay:var(--d)}`
    + `.draw{stroke-dasharray:1;animation:draw ${CYCLE}s linear infinite both;animation-delay:var(--d)}`
    + `.tok{animation:in ${CYCLE}s linear infinite both,fresh ${CYCLE}s linear infinite both;animation-delay:var(--d)}`
    + `.scn{animation:scn ${CYCLE}s linear infinite both;animation-delay:var(--s)}`
    + `.ring{transform-box:fill-box;transform-origin:center;animation:ring 2.4s ease-out infinite}`
    + `.blink{animation:blink 1s steps(1) infinite}`
    + `.pulse{animation:pulse 2.6s ease-in-out infinite}`
    + `@keyframes in{0%{opacity:0}1.5%{opacity:1}49%{opacity:1}50%,100%{opacity:0}}`
    + `@keyframes draw{0%{stroke-dashoffset:1;opacity:1}6%{stroke-dashoffset:0}49%{stroke-dashoffset:0;opacity:1}50%,100%{stroke-dashoffset:1;opacity:0}}`
    + `@keyframes scn{0%{opacity:0}1%{opacity:1}47%{opacity:1}48%,100%{opacity:0}}`
    + `@keyframes fresh{0%,1.5%{fill:${th.accent3}}2.5%,100%{fill:${th.ink}}}`
    + `@keyframes ring{0%{transform:scale(1);opacity:.7}100%{transform:scale(3.4);opacity:0}}`
    + `@keyframes blink{50%{opacity:0}}`
    + `@keyframes pulse{50%{opacity:.3}}`
    + `@media (prefers-reduced-motion: reduce){.in,.draw,.tok,.scn,.ring,.blink,.pulse{animation:none}.scn-b{display:none}}`
    + `</style>`;
}

function ragArt(th) {
  const X0 = 470, CH = 28, SIZE = 12;
  const box = { x: 478, y: 94, w: 176, h: 126 };
  const dots = cloud(7, 46, box, SCENARIOS.map((s) => s.q), 9);
  const panel = { x: 686, y: 86, w: 180, h: 140, pad: 12 };

  let out = css(th);
  // The shared embedding cloud: quiet dots, the same in both scenarios.
  out += dots.map(([x, y]) => `<circle class="dot" cx="${f(x)}" cy="${f(y)}" r="2.6" fill="${th.muted}" fill-opacity="0.45"/>`).join('');

  for (const sc of SCENARIOS) {
    const [qx, qy] = sc.q;
    const s = sc.start;
    const chipW = Math.ceil(textWidth(sc.query, SIZE) + 28);
    const near = dots.map((p) => ({ p, d: Math.hypot(p[0] - qx, p[1] - qy) })).sort((a, b) => a.d - b.d).slice(0, 4).map((n) => n.p);

    let g = `<g class="scn ${sc.cls}" style="--s:${s}s">`;
    // 1. the question
    g += `<g class="in" ${delay(s, 0.3)}><rect x="${X0}" y="34" width="${chipW}" height="${CH}" rx="6" fill="${th.bg}" stroke="${th.line}"/>`
      + text(X0 + 14, 52.5, sc.query, { size: SIZE, fill: th.ink, mono: true }) + `</g>`;
    // 2. it lands in the space
    g += `<path class="draw" pathLength="1" ${delay(s, 0.9)} d="M${X0 + 18} ${34 + CH} C${X0 + 18} ${f(qy - 30)} ${qx} ${f(qy - 40)} ${qx} ${f(qy - 7)}" fill="none" stroke="${th.accent}" stroke-width="1.5"/>`;
    g += `<g class="in" ${delay(s, 1.6)}><circle class="ring" cx="${qx}" cy="${qy}" r="5" fill="none" stroke="${th.accent}" stroke-width="1.5"/>`
      + `<circle cx="${qx}" cy="${qy}" r="5" fill="${th.accent}"/></g>`;
    // 3. the nearest chunks are retrieved
    near.forEach(([x, y], i) => {
      g += `<line class="hit-line draw" pathLength="1" ${delay(s, 2.0 + i * 0.15)} x1="${qx}" y1="${qy}" x2="${f(x)}" y2="${f(y)}" stroke="${th.accent2}" stroke-width="1.5"/>`;
      g += `<circle class="in" ${delay(s, 2.5 + i * 0.15)} cx="${f(x)}" cy="${f(y)}" r="4.4" fill="${th.accent2}"/>`;
    });
    // 4. the answer streams out of the chunks
    g += `<line class="draw" pathLength="1" ${delay(s, 3.3)} x1="${box.x + box.w + 8}" y1="156" x2="${panel.x}" y2="156" stroke="${th.accent2}" stroke-width="1.5"/>`;
    g += `<g class="in" ${delay(s, 3.4)}><rect x="${panel.x}" y="${panel.y}" width="${panel.w}" height="${panel.h}" rx="10" fill="${th.bg}" stroke="${th.line}"/></g>`;
    const toks = flowTokens(sc.answer, panel.w - panel.pad * 2, SIZE, 5);
    toks.forEach((t, i) => {
      g += `<text class="tok" ${delay(s, 3.9 + i * 0.2)} x="${f(panel.x + panel.pad + t.x)}" y="${112 + t.line * 18}" font-size="${SIZE}" fill="${th.ink}" font-family="monospace">${t.word.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text>`;
    });
    g += `<g class="in" ${delay(s, 3.9)}><circle cx="${panel.x + panel.pad + 3}" cy="${panel.y + panel.h - 17}" r="3" fill="${th.accent2}"/>`
      + text(panel.x + panel.pad + 14, panel.y + panel.h - 13, `${near.length} chunks retrieved`, { size: 11, fill: th.muted, mono: true }) + `</g>`;
    const last = toks[toks.length - 1];
    const cx = panel.x + panel.pad + last.x + textWidth(last.word, SIZE, 0) * 1 + 3;
    g += `<g class="in" ${delay(s, 3.9 + toks.length * 0.2)}><rect class="blink" x="${f(cx)}" y="${112 + last.line * 18 - 11}" width="6" height="13" rx="1" fill="${th.accent3}"/></g>`;
    out += g + `</g>`;
  }
  out += text(866, 248, 'illustration of a RAG flow', { size: 11, fill: th.muted, anchor: 'end' });
  return out;
}

export function heroSVG(hero, th) {
  const W = 900, H = 260;
  let body = cardRect(W, H, th, 18) + ragArt(th);
  body += text(40, 58, truncate(hero.meta, 400, 13), { size: 13, fill: th.muted, mono: true });
  body += text(40, 118, truncate(hero.name, 400, 46), { size: 46, weight: 800, fill: th.ink });
  body += text(40, 160, truncate(hero.role, 400, 28), { size: 28, weight: 700, fill: th.accent });
  const status = truncate(hero.status, 400, 13);
  const pillW = Math.ceil(textWidth(status, 13) + 38);
  body += `<rect x="40" y="180" width="${pillW}" height="30" rx="6" fill="${th.bg}" stroke="${th.line}"/>`
    + `<circle class="pulse" cx="58" cy="195" r="4.5" fill="${th.accent2}"/>`
    + text(70, 200, status, { size: 13, weight: 600, fill: th.ink });
  body += text(40, 236, truncate(hero.focus, 400, 14), { size: 14, fill: th.muted });
  return svgDoc({ w: W, h: H, title: `${hero.name}, ${hero.role}`, desc: `${hero.status}. ${hero.focus}`, body });
}
