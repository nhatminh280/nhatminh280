import { textWidth } from '../format.mjs';
import { text } from './frame.mjs';

// One small looping illustration per featured project, drawn in the card's top band (ART_H tall, 438 wide).
// Each loop is CSS-only and owns its own clock. The base style of every element is the finished picture, so
// readers who ask for reduced motion (and renderers that skip animation) still see a complete, still scene.
// These are illustrations of how each project works, labelled as such; the only real data on show are the
// gesture names and F1 scores, which come from the project's own README via config.
export const ART_H = 116;
const f = (n) => Number(n.toFixed(1));
const glass = (th, stroke = th.line) => `fill="${th.bg}" fill-opacity="0.7" stroke="${stroke}"`;
const mono = (th, size = 11, fill) => ({ size, fill: fill ?? th.ink, mono: true });

// e-shop: candidates come back from retrieval, scores fill in, then the list re-sorts by relevance.
function rerank(th) {
  const SLOT = 23, Y0 = 12, X = 196, RW = 218, RH = 19;
  const items = [
    { n: 'mug', s: 0.55, from: 0, to: 2 }, { n: 'kettle', s: 0.5, from: 1, to: 3 },
    { n: 'pour-over set', s: 0.92, from: 2, to: 0 }, { n: 'grinder', s: 0.84, from: 3, to: 1 },
  ];
  const q = 'gift under $50';
  const chipW = Math.ceil(textWidth(q, 11) + 24);
  let body = `<rect x="24" y="22" width="${chipW}" height="26" rx="6" ${glass(th)}/>` + text(36, 39, q, mono(th))
    + `<line x1="${24 + chipW}" y1="35" x2="${X - 10}" y2="35" stroke="${th.accent}" stroke-opacity="0.6" stroke-width="1.5"/>`
    + `<circle cx="${X - 10}" cy="35" r="3" fill="${th.accent}"/>`
    + text(24, 66, 'reranked by relevance', { size: 11, fill: th.muted });
  for (const it of items) {
    const y = Y0 + it.from * SLOT;
    body += `<g class="row" style="--dy:${(it.to - it.from) * SLOT}px"><rect x="${X}" y="${y}" width="${RW}" height="${RH}" rx="6" ${glass(th)}/>`
      + `<rect x="${X + 8}" y="${y + 5}" width="9" height="9" rx="2" fill="${th.accent}" fill-opacity="0.8"/>`
      + text(X + 24, y + 13.5, it.n, mono(th))
      + `<rect x="${X + 150}" y="${y + 7.5}" width="58" height="4" rx="2" fill="${th.line}"/>`
      + `<rect class="fill" x="${X + 150}" y="${y + 7.5}" width="${f(58 * it.s)}" height="4" rx="2" fill="${th.accent2}"/></g>`;
  }
  body += `<rect class="best" x="${X - 2}" y="${Y0 - 2}" width="${RW + 4}" height="${RH + 4}" rx="8" fill="none" stroke="${th.accent2}" stroke-width="1.5"/>`;
  return {
    body,
    css: `.row{transform:translateY(var(--dy));animation:swap 9s ease-in-out infinite both}`
      + `.fill{transform-box:fill-box;transform-origin:left center;animation:grow 9s ease-out infinite both}`
      + `.best{animation:win 9s linear infinite both}`
      + `@keyframes swap{0%,24%{transform:translateY(0)}40%,88%{transform:translateY(var(--dy))}100%{transform:translateY(0)}}`
      + `@keyframes grow{0%{transform:scaleX(0)}13%,88%{transform:scaleX(1)}100%{transform:scaleX(0)}}`
      + `@keyframes win{0%,40%{opacity:0}46%,88%{opacity:1}94%,100%{opacity:0}}`,
    reduced: `.row,.fill,.best{animation:none}`,
  };
}

// News assistant: feeds stream in, a topic filter drops the off-topic ones, the rest land in the vector store,
// and the weekly report gets written.
function sources(th) {
  const lanes = [34, 58, 82];
  let body = '';
  lanes.forEach((y) => {
    body += `<rect x="24" y="${y - 9}" width="36" height="18" rx="5" ${glass(th)}/>` + text(42, y + 3.5, 'rss', { ...mono(th, 10, th.muted), anchor: 'middle' });
  });
  body += `<rect x="164" y="14" width="8" height="88" rx="4" fill="${th.accent3}" fill-opacity="0.25" stroke="${th.accent3}"/>`
    + `<path d="M228 26V86a22 6 0 0 0 44 0V26" ${glass(th, th.accent)}/><ellipse cx="250" cy="26" rx="22" ry="6" ${glass(th, th.accent)}/>`
    + `<line x1="276" y1="58" x2="330" y2="58" stroke="${th.accent}" stroke-opacity="0.5" stroke-dasharray="3 3"/>`
    + `<rect x="336" y="20" width="76" height="76" rx="6" ${glass(th)}/>`;
  [56, 48, 56, 30].forEach((w, i) => { body += `<rect class="wr" style="--i:${i}" x="346" y="${34 + i * 14}" width="${w}" height="4" rx="2" fill="${th.accent2}"/>`; });
  lanes.forEach((y, i) => {
    for (const d of [0, -4.5]) body += `<circle class="pt ${i === 1 ? 'drop' : 'pass'}" style="--d:${d}s" cx="66" cy="${y}" r="3" fill="${th.accent2}"/>`;
  });
  const lab = (x, s) => text(x, 106, s, { ...mono(th, 10, th.muted), anchor: 'middle' });
  body += lab(168, 'topic filter') + lab(250, 'chromadb') + lab(374, 'weekly report');
  return {
    body,
    css: `.pt{opacity:0;animation-duration:9s;animation-timing-function:linear;animation-iteration-count:infinite;animation-fill-mode:both;animation-delay:var(--d)}`
      + `.pass{animation-name:pass}.drop{animation-name:drop}`
      + `.wr{transform-box:fill-box;transform-origin:left center;animation:write 9s ease-out infinite both;animation-delay:calc(var(--i) * 0.45s)}`
      + `@keyframes pass{0%{transform:translateX(0);opacity:0}4%{opacity:1}34%{transform:translateX(100px);opacity:1}62%{transform:translateX(168px);opacity:1}68%,100%{transform:translateX(168px);opacity:0}}`
      + `@keyframes drop{0%{transform:translateX(0);opacity:0}4%{opacity:1}34%{transform:translateX(100px);opacity:1}40%,100%{transform:translateX(100px);opacity:0}}`
      + `@keyframes write{0%,34%{transform:scaleX(0)}44%,88%{transform:scaleX(1)}100%{transform:scaleX(0)}}`,
    reduced: `.pt{animation:none;display:none}.wr{animation:none}`,
  };
}

// MPU6050 gesture model: the three accelerometer axes roll under a bracketed window and the recognised gesture
// is named with its real F1 score. Without gesture data it draws a neutral trace set, no names and no scores.
const P = 92, N = 30, TX0 = 24, TW = 276;
const SHAPES = {
  Clapping: (u, ph) => { const w = (k) => ((u + ph * 0.07 + k) % 1 + 1) % 1; return Math.exp(-(((w(0) - 0.25) / 0.05) ** 2)) - Math.exp(-(((w(0) - 0.75) / 0.05) ** 2)) + 0.15 * Math.sin(2 * Math.PI * 3 * u + ph); },
  'Fist Making': (u, ph) => Math.sin(2 * Math.PI * u + ph) + 0.5 * Math.sin(4 * Math.PI * u + 1.3 * ph),
  'Thumbs Up': (u, ph) => 0.9 * Math.sin(2 * Math.PI * u + ph) + 0.2 * Math.sin(6 * Math.PI * u),
};
const neutral = (u, ph) => Math.sin(2 * Math.PI * u + ph) + 0.4 * Math.sin(4 * Math.PI * u + ph);

function signal(th, p) {
  const gs = Array.isArray(p.gestures) && p.gestures.length ? p.gestures : [{ name: null }];
  const colors = [th.accent, th.accent2, th.accent3];
  const bases = [30, 56, 82], amps = [12, 10, 13];
  let body = `<defs><clipPath id="sig"><rect x="${TX0}" y="6" width="${TW}" height="104"/></clipPath></defs>`
    + `<rect x="129" y="8" width="66" height="96" rx="6" fill="${th.accent}" fill-opacity="0.07" stroke="${th.accent}" stroke-opacity="0.55" stroke-dasharray="4 4"/>`;
  gs.forEach((g, gi) => {
    const fn = SHAPES[g.name] ?? neutral;
    const animated = gs.length > 1;
    body += `<g class="${animated ? `sc sc${gi + 1}` : 'sc1'}" style="--s:${gi * 3}s"><g clip-path="url(#sig)"><g class="roll">`;
    bases.forEach((b, ai) => {
      const pts = Array.from({ length: 4 * N + 1 }, (_, i) => `${f(TX0 + i * (P / N))},${f(b - amps[ai] * fn((i % N) / N, ai * 1.7))}`).join(' ');
      body += `<polyline points="${pts}" fill="none" stroke="${colors[ai]}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
    });
    body += `</g></g>`;
    if (g.name) {
      body += `<rect x="316" y="34" width="98" height="48" rx="6" ${glass(th)}/>`
        + text(326, 53, g.name, { size: 12, weight: 600, fill: th.ink })
        + text(326, 72, `F1 ${Number(g.f1).toFixed(2)}`, mono(th, 11, th.accent2));
    }
    body += `</g>`;
  });
  const hide = gs.slice(1).map((_, i) => `.sc${i + 2}{display:none}`).join('');
  return {
    body,
    css: `.sc{animation:sc ${gs.length * 3}s linear infinite both;animation-delay:var(--s)}`
      + `.roll{animation:roll 2.3s linear infinite}`
      + `@keyframes sc{0%{opacity:0}${f(1.5 / gs.length)}%{opacity:1}${f(31 / gs.length * (3 / 3))}%{opacity:1}${f(100 / gs.length)}%,100%{opacity:0}}`
      + `@keyframes roll{to{transform:translateX(-${P}px)}}`,
    reduced: `.sc,.roll{animation:none}${hide}`,
  };
}

// Heartify AI: a medical report is scanned by OCR, health metrics come out, and the food and exercise advisers
// (both RAG) write their recommendations. Wording follows the repo's README; no figures are shown.
function health(th) {
  let body = `<rect x="24" y="14" width="64" height="84" rx="6" ${glass(th)}/><rect x="32" y="22" width="28" height="5" rx="2" fill="${th.accent}"/>`;
  [40, 36, 40, 30, 38].forEach((w, i) => { body += `<rect x="32" y="${36 + i * 10}" width="${w}" height="4" rx="2" fill="${th.line}"/>`; });
  body += `<rect class="beam" x="28" y="20" width="56" height="2" rx="1" fill="${th.accent2}"/>`
    + `<line x1="88" y1="57" x2="106" y2="57" stroke="${th.accent}" stroke-opacity="0.55" stroke-width="1.5"/>`
    + `<rect x="106" y="42" width="44" height="30" rx="6" ${glass(th, th.accent)}/>` + text(128, 61, 'OCR', { ...mono(th), anchor: 'middle' })
    + `<line x1="150" y1="57" x2="166" y2="57" stroke="${th.accent}" stroke-opacity="0.55" stroke-width="1.5"/>`;
  [22, 46, 70].forEach((y, i) => {
    body += `<g class="chip" style="--i:${i}"><rect x="166" y="${y}" width="66" height="18" rx="5" ${glass(th)}/><circle cx="176" cy="${y + 9}" r="3" fill="${th.accent2}"/>`
      + `<rect x="184" y="${y + 7.5}" width="36" height="3" rx="1.5" fill="${th.muted}" fill-opacity="0.6"/></g>`;
  });
  body += text(199, 106, 'health metrics', { ...mono(th, 10, th.muted), anchor: 'middle' });
  [['food rag', 16, 4], ['exercise rag', 62, 6]].forEach(([label, y, k], ci) => {
    body += `<path class="lk" pathLength="1" d="M232 55C247 55 247 ${y + 19} 262 ${y + 19}" fill="none" stroke="${th.accent}" stroke-opacity="0.55" stroke-width="1.5"/>`
      + `<g class="rc" style="--i:${3 + ci}"><rect x="262" y="${y}" width="152" height="38" rx="6" ${glass(th)}/>` + text(272, y + 15, label, mono(th))
      + `<rect class="sk" style="--i:${k}" x="272" y="${y + 22}" width="100" height="3" rx="1.5" fill="${th.accent2}"/>`
      + `<rect class="sk" style="--i:${k + 1}" x="272" y="${y + 29}" width="70" height="3" rx="1.5" fill="${th.accent2}" fill-opacity="0.7"/></g>`;
  });
  return {
    body,
    css: `.beam{opacity:0;animation:beam 9s linear infinite both}`
      + `.chip,.rc{animation:pop 9s ease-out infinite both;animation-delay:calc(var(--i) * 0.4s)}`
      + `.lk{stroke-dasharray:1;animation:link 9s ease-out infinite both}`
      + `.sk{transform-box:fill-box;transform-origin:left center;animation:write 9s ease-out infinite both;animation-delay:calc(var(--i) * 0.4s)}`
      + `@keyframes beam{0%{transform:translateY(0);opacity:0}3%{opacity:1}30%{transform:translateY(62px);opacity:1}34%,100%{transform:translateY(62px);opacity:0}}`
      + `@keyframes pop{0%,33%{opacity:0}38%,90%{opacity:1}96%,100%{opacity:0}}`
      + `@keyframes link{0%,44%{stroke-dashoffset:1}52%,90%{stroke-dashoffset:0}96%,100%{stroke-dashoffset:1}}`
      + `@keyframes write{0%,40%{transform:scaleX(0)}52%,90%{transform:scaleX(1)}96%,100%{transform:scaleX(0)}}`,
    reduced: `.beam{animation:none}.chip,.rc,.lk,.sk{animation:none}`,
  };
}

const ARTS = { rerank, sources, signal, health };
export const hasArt = (kind) => Object.hasOwn(ARTS, kind);
export const projectArt = (kind, th, p) => ARTS[kind](th, p);
