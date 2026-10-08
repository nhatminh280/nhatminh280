import { textWidth, truncate, wrap } from '../format.mjs';
import { langColor } from '../theme.mjs';
import { svgDoc, cardRect, text } from './frame.mjs';
import { auroraDefs, auroraLayer, AURORA_CSS } from './aurora.mjs';
import { ART_H, hasArt, projectArt } from './project-art.mjs';

export function projectSVG(p, th) {
  const art = hasArt(p.art) ? projectArt(p.art, th, p) : null;
  const off = art ? ART_H : 0;
  const W = 438, H = 184 + off, pad = 22, inner = W - pad * 2;
  let body = cardRect(W, H, th);
  if (art) {
    // Glass card: the shared aurora behind a looping illustration, text below it.
    body = `<defs>${auroraDefs(th, 0.8)}<clipPath id="card"><rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="10"/></clipPath></defs>`
      + `<style>${AURORA_CSS}${art.css}@media (prefers-reduced-motion: reduce){.aur{animation:none}${art.reduced}}</style>`
      + body + `<g clip-path="url(#card)">` + auroraLayer([
        { n: 1, cx: 70, cy: 20, r: 190, x: 30, y: 14, d: 0 },
        { n: 3, cx: 330, cy: 120, r: 170, x: -36, y: -10, d: -8 },
        { n: 2, cx: 430, cy: 40, r: 150, x: -24, y: 16, d: -14 },
      ]) + `</g><g class="art">${art.body}</g>` + text(24, 110, 'illustration', { size: 10.5, fill: th.muted });
  }
  body += text(pad, 38 + off, truncate(p.title, inner, 17), { size: 17, weight: 700, fill: th.accent, mono: true });

  const pills = [p.fork ? (p.parent ? `Fork of ${p.parent}` : 'Fork') : null, p.note].filter(Boolean);
  let px = pad;
  for (const label of pills) {
    const t = truncate(label, inner - 24, 11);
    const w = Math.ceil(textWidth(t, 11) + 16);
    if (px + w > W - pad) break;
    body += `<rect x="${px}" y="${50 + off}" width="${w}" height="20" rx="6" fill="${th.bg}" stroke="${th.line}"/>` + text(px + 8, 64 + off, t, { size: 11, fill: th.muted });
    px += w + 6;
  }

  wrap(p.blurb, inner, 13, 3).forEach((line, i) => { body += text(pad, 96 + off + i * 19, line, { size: 13, fill: th.ink }); });

  let lx = pad;
  for (const name of p.languages) {
    const label = truncate(name, 140, 12);
    const w = textWidth(label, 12) + 30;
    if (lx + w > W - pad) break;
    body += `<circle cx="${lx + 5}" cy="${158 + off}" r="5" fill="${langColor(name)}"/>` + text(lx + 16, 162 + off, label, { size: 12, fill: th.muted });
    lx += w;
  }
  return svgDoc({ w: W, h: H, title: p.title, desc: p.blurb, body });
}
