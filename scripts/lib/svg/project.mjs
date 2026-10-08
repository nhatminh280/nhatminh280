import { textWidth, truncate, wrap } from '../format.mjs';
import { langColor } from '../theme.mjs';
import { svgDoc, cardRect, text } from './frame.mjs';

export function projectSVG(p, th) {
  const W = 438, H = 184, pad = 22, inner = W - pad * 2;
  let body = cardRect(W, H, th);
  body += text(pad, 38, truncate(p.title, inner, 17), { size: 17, weight: 700, fill: th.accent, mono: true });

  const pills = [p.fork ? (p.parent ? `Fork of ${p.parent}` : 'Fork') : null, p.note].filter(Boolean);
  let px = pad;
  for (const label of pills) {
    const t = truncate(label, inner - 24, 11);
    const w = Math.ceil(textWidth(t, 11) + 16);
    if (px + w > W - pad) break;
    body += `<rect x="${px}" y="50" width="${w}" height="20" rx="6" fill="${th.bg}" stroke="${th.line}"/>` + text(px + 8, 64, t, { size: 11, fill: th.muted });
    px += w + 6;
  }

  wrap(p.blurb, inner, 13, 3).forEach((line, i) => { body += text(pad, 96 + i * 19, line, { size: 13, fill: th.ink }); });

  let lx = pad;
  for (const name of p.languages) {
    const label = truncate(name, 140, 12);
    const w = textWidth(label, 12) + 30;
    if (lx + w > W - pad) break;
    body += `<circle cx="${lx + 5}" cy="158" r="5" fill="${langColor(name)}"/>` + text(lx + 16, 162, label, { size: 12, fill: th.muted });
    lx += w;
  }
  return svgDoc({ w: W, h: H, title: p.title, desc: p.blurb, body });
}
