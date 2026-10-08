import { textWidth } from '../format.mjs';
import { svgDoc, text } from './frame.mjs';

export function badgeSVG({ label, glyph }, th) {
  const H = 32, padL = 8, icon = 20, gap = 8, padR = 14;
  const W = Math.ceil(padL + icon + gap + textWidth(label, 13) + padR);
  const body = `<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="10" fill="${th.card}" stroke="${th.line}"/>`
    + `<rect x="${padL}" y="6" width="${icon}" height="${icon}" rx="6" fill="${th.accent}"/>`
    + text(padL + icon / 2, 20, glyph, { size: 11, weight: 700, fill: th.card, anchor: 'middle', mono: true })
    + text(padL + icon + gap, 21, label, { size: 13, weight: 600, fill: th.ink });
  return svgDoc({ w: W, h: H, title: label, body });
}
