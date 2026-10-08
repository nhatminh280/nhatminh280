import { textWidth, truncate } from '../format.mjs';
import { svgDoc, text } from './frame.mjs';
import { auroraDefs, auroraLayer, AURORA_CSS, RISE_CSS } from './aurora.mjs';

// One glass row per group: an icon and a label on the left, a chip per tool on the right, over the shared aurora.
// Rows rise in once, staggered, then hold still. Unknown group titles fall back to a plain dot icon.
const ICONS = {
  languages: '<path d="M-4-5-9 0l5 5M4-5l5 5-5 5M1.5-7l-3 14"/>',
  'machine learning': '<circle cx="-7" cy="5" r="2.6"/><circle cy="-6" r="2.6"/><circle cx="7" cy="4" r="2.6"/><path d="M-5.5 3 -1.5-3.6M1.6-3.6 5.8 1.6M-4.4 5 4.4 4.2"/>',
  'llm and rag': '<path d="M-8-6h16v10h-9l-5 4v-4h-2z"/><path d="M-4-2h8"/>',
  'computer vision': '<path d="M-9 0Q0-9 9 0Q0 9-9 0Z"/><circle r="2.8"/>',
  embedded: '<rect x="-5" y="-5" width="10" height="10" rx="2"/><path d="M-3-9v4M3-9v4M-3 5v4M3 5v4M-9-3h4M-9 3h4M5-3h4M5 3h4"/>',
};
const FALLBACK = '<circle r="4"/>';
const TONE = ['accent', 'accent2', 'cyan', 'accent3', 'accent'];

export function stackSVG(groups, th) {
  const W = 900, pad = 24, rowPad = 12, gapX = 6, chipH = 30, chipGap = 8, rowGap = 10;
  const x0 = pad, rowW = W - pad * 2;
  const labelX = 56, labelMax = 136, left = x0 + 204, right = x0 + rowW - 16;

  let y = pad, rows = '';
  groups.forEach((g, gi) => {
    const color = th[TONE[gi % TONE.length]];
    let x = left, cy = y + rowPad, chips = '';
    for (const item of g.items) {
      const label = truncate(item, right - left - 26, 14);
      const w = Math.ceil(textWidth(label, 14) + 26);
      if (x + w > right) { x = left; cy += chipH + chipGap; }
      chips += `<g class="chip"><rect class="chipbox" x="${x}" y="${cy}" width="${w}" height="${chipH}" rx="6" fill="${th.bg}" fill-opacity="0.7" stroke="${th.line}"/>`
        + `<circle cx="${x + 9}" cy="${cy + chipH / 2}" r="2.6" fill="${color}"/>` + text(x + 18, cy + 20, label, { size: 14, fill: th.ink }) + `</g>`;
      x += w + gapX;
    }
    const rowH = cy + chipH + rowPad - y;
    const mid = y + rowH / 2;
    rows += `<g class="row rise" style="--i:${gi}"><rect x="${x0}" y="${y}" width="${rowW}" height="${rowH}" rx="10" fill="${th.bg}" fill-opacity="0.5" stroke="${th.line}"/>`
      + `<circle cx="${x0 + 30}" cy="${mid}" r="17" fill="${color}" fill-opacity="0.16"/>`
      + `<g class="ico" transform="translate(${x0 + 30} ${mid})" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[g.title.toLowerCase()] ?? FALLBACK}</g>`
      + text(x0 + labelX, mid + 5, truncate(g.title, labelMax, 14), { size: 14, weight: 700, fill: th.ink }) + chips + `</g>`;
    y += rowH + rowGap;
  });
  const H = y - rowGap + pad;

  const body = `<defs>${auroraDefs(th, 0.8)}<clipPath id="card"><rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="10"/></clipPath></defs>`
    + `<style>${AURORA_CSS}${RISE_CSS}@media (prefers-reduced-motion: reduce){.rise{animation:none}.aur{animation:none}}</style>`
    + `<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="10" fill="${th.card}" stroke="${th.line}"/>`
    + `<g clip-path="url(#card)">` + auroraLayer([
      { n: 1, cx: 140, cy: 10, r: 240, x: 40, y: 18, d: 0 },
      { n: 3, cx: 460, cy: H, r: 250, x: -50, y: -14, d: -8 },
      { n: 2, cx: 800, cy: 20, r: 230, x: -36, y: 20, d: -14 },
    ]) + `</g>` + rows;
  return svgDoc({ w: W, h: H, title: 'Technology stack', desc: groups.map((g) => `${g.title}: ${g.items.join(', ')}`).join('. '), body });
}
