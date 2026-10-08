import { textWidth } from '../format.mjs';
import { langColor } from '../theme.mjs';
import { svgDoc, cardRect, text } from './frame.mjs';

export function languagesSVG(languages, th) {
  const W = 900, pad = 28, barW = W - pad * 2;
  if (!languages.length) {
    return svgDoc({ w: W, h: 80, title: 'Languages', body: cardRect(W, 80, th) + text(pad, 46, 'No public language data yet', { size: 14, fill: th.muted }) });
  }

  let x = pad;
  const segs = languages.map((l) => {
    const w = (barW * l.pct) / 100;
    const s = `<rect x="${x.toFixed(2)}" y="44" width="${w.toFixed(2)}" height="12" fill="${langColor(l.name)}"/>`;
    x += w;
    return s;
  }).join('');

  let lx = pad, ly = 84, legend = '';
  for (const l of languages) {
    const label = `${l.name} ${l.pct.toFixed(1)}%`;
    const w = textWidth(label, 13) + 30;
    if (lx + w > W - pad) { lx = pad; ly += 22; }
    legend += `<circle cx="${lx + 5}" cy="${ly - 4}" r="5" fill="${langColor(l.name)}"/>` + text(lx + 16, ly, label, { size: 13, fill: th.ink });
    lx += w;
  }

  const H = ly + 26;
  const body = cardRect(W, H, th)
    + text(pad, 30, 'Languages across public repos, by bytes', { size: 13, weight: 600, fill: th.muted })
    + `<clipPath id="bar"><rect x="${pad}" y="44" width="${barW}" height="12" rx="6"/></clipPath><g clip-path="url(#bar)">${segs}</g>`
    + legend;
  return svgDoc({ w: W, h: H, title: 'Languages', desc: languages.map((l) => `${l.name} ${l.pct.toFixed(1)}%`).join(', '), body });
}
