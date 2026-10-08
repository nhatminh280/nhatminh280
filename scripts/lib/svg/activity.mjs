import { fmt, textWidth, truncate } from '../format.mjs';
import { svgDoc, text } from './frame.mjs';
import { auroraDefs, auroraLayer, AURORA_CSS } from './aurora.mjs';

// One glass tile per figure over the same soft aurora as the hero. Each tile has a small hand-drawn icon in its own
// signal colour. Tiles rise in once, staggered, then hold still. Every number is a real figure: nothing here is
// decorative data.
const ICONS = {
  'public repos': '<rect x="-7" y="-8" width="14" height="16" rx="2"/><path d="M-7 3h14M-3-4h6"/>',
  'public commits': '<path d="M-10 0h6M4 0h6"/><circle r="4"/>',
  'active days in 12 months': '<rect x="-8" y="-7" width="16" height="15" rx="2"/><path d="M-8-2h16M-4-10v5M4-10v5"/>',
  followers: '<circle cy="-3" r="3.6"/><path d="M-7 8a7 6 0 0 1 14 0"/>',
  'years on GitHub': '<circle r="8"/><path d="M0-4V0h4"/>',
  'languages used': '<path d="M-4-5-9 0l5 5M4-5l5 5-5 5M1.5-7l-3 14"/>',
};
const TONE = ['accent', 'accent2', 'cyan', 'accent3', 'accent', 'accent2'];

export function activitySVG(figures, th) {
  const items = [
    ['public repos', figures.repos],
    ['public commits', figures.commits],
    ['active days in 12 months', figures.activeDays],
    ['followers', figures.followers],
    ['years on GitHub', figures.years],
    ['languages used', figures.languageCount],
  ].filter(([, v]) => v !== null && v !== undefined);
  if (!items.length) throw new Error('activitySVG: no figures to render');

  const W = 900, pad = 24, gap = 14, cols = 3, tileH = 84;
  const tileW = (W - pad * 2 - gap * (cols - 1)) / cols;
  const rows = Math.ceil(items.length / cols);
  const H = pad * 2 + rows * tileH + (rows - 1) * gap;

  let body = `<defs>${auroraDefs(th, 0.8)}<clipPath id="card"><rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="10"/></clipPath></defs>`
    + `<style>${AURORA_CSS}.rise{animation:rise .6s ease-out both;animation-delay:calc(var(--i) * 0.08s)}`
    + `@keyframes rise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`
    + `@media (prefers-reduced-motion: reduce){.rise{animation:none}.aur{animation:none}}</style>`
    + `<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="10" fill="${th.card}" stroke="${th.line}"/>`
    + `<g clip-path="url(#card)">`
    + auroraLayer([
      { n: 1, cx: 150, cy: 20, r: 230, x: 40, y: 18, d: 0 },
      { n: 3, cx: 470, cy: H, r: 220, x: -50, y: -14, d: -8 },
      { n: 2, cx: 800, cy: 30, r: 220, x: -36, y: 20, d: -14 },
    ])
    + `</g>`;

  items.forEach(([label, value], i) => {
    const x = pad + (i % cols) * (tileW + gap);
    const y = pad + Math.floor(i / cols) * (tileH + gap);
    const color = th[TONE[i % TONE.length]];
    const v = fmt(value);
    const labelMax = tileW - 70 - 10;
    body += `<g class="tile rise" style="--i:${i}">`
      + `<rect x="${x.toFixed(1)}" y="${y}" width="${tileW.toFixed(1)}" height="${tileH}" rx="10" fill="${th.bg}" fill-opacity="0.66" stroke="${th.line}"/>`
      + `<circle cx="${(x + 36).toFixed(1)}" cy="${y + tileH / 2}" r="20" fill="${color}" fill-opacity="0.16"/>`
      + `<g class="ico" transform="translate(${(x + 36).toFixed(1)} ${y + tileH / 2})" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[label]}</g>`
      + text((x + 70).toFixed(1), y + 44, v, { size: 32, weight: 700, fill: th.ink })
      + text((x + 70).toFixed(1), y + 66, truncate(label, labelMax, 13), { size: 13, fill: th.muted })
      + `</g>`;
  });
  return svgDoc({ w: W, h: H, title: 'GitHub activity', desc: items.map(([l, v]) => `${l}: ${v}`).join(', '), body });
}
