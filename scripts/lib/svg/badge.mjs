import { textWidth } from '../format.mjs';
import { svgDoc, text } from './frame.mjs';
import { RISE_CSS } from './aurora.mjs';

// A glass pill: a soft glow in the platform's own blue behind a hand-drawn icon, then the label. Generic glyphs,
// not the platforms' logos. The pill rises in once (staggered by its position in the row) and holds still.
// Unknown platforms fall back to their monogram.
const ICONS = {
  linkedin: { tone: 'accent', svg: '<circle cx="-5" cy="-5.5" r="1.4"/><path d="M-5-2.4V6M-1-2.4V6M-1 1.6Q-1-2.4 3-2.4T6 1.6V6"/>' },
  codeforces: { tone: 'accent2', svg: '<rect x="-7.5" y="-1" width="4" height="7" rx="1" fill="currentColor" stroke="none"/><rect x="-2" y="-7" width="4" height="13" rx="1" fill="currentColor" stroke="none"/><rect x="3.5" y="2" width="4" height="4" rx="1" fill="currentColor" stroke="none"/>' },
  gmail: { tone: 'cyan', svg: '<rect x="-8" y="-5.5" width="16" height="11" rx="2"/><path d="M-8-4 0 2 8-4"/>' },
  github: { tone: 'accent3', svg: '<circle cx="-4" cy="-6" r="2"/><circle cx="-4" cy="6" r="2"/><circle cx="5" cy="-2" r="2"/><path d="M-4-4V4M5 0Q5 3-4 3.5"/>' },
};

export function badgeSVG({ id, label, glyph }, th, index = 0) {
  const H = 44, cx = 26, cy = 22, r = 15;
  const W = Math.ceil(cx + r + 10 + textWidth(label, 14) + 18);
  const known = ICONS[id];
  const tone = th[known?.tone ?? 'accent'];
  const icon = known
    ? `<g class="ico" transform="translate(${cx} ${cy})" fill="none" stroke="${tone}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" color="${tone}">${known.svg}</g>`
    : text(cx, cy + 4, glyph, { size: 11, weight: 700, fill: tone, anchor: 'middle', mono: true });
  const body = `<defs><radialGradient id="g"><stop offset="0" stop-color="${tone}" stop-opacity="${th.glow}"/><stop offset="1" stop-color="${tone}" stop-opacity="0"/></radialGradient>`
    + `<clipPath id="c"><rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="10"/></clipPath></defs>`
    + `<style>${RISE_CSS}@media (prefers-reduced-motion: reduce){.rise{animation:none}}</style>`
    + `<g class="badge rise" style="--i:${index}">`
    + `<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="10" fill="${th.card}" stroke="${th.line}"/>`
    + `<g clip-path="url(#c)"><circle cx="${cx}" cy="${cy}" r="44" fill="url(#g)"/></g>`
    + `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${tone}" fill-opacity="0.16"/>` + icon
    + text(cx + r + 10, cy + 5, label, { size: 14, weight: 600, fill: th.ink })
    + `</g>`;
  return svgDoc({ w: W, h: H, title: label, body });
}
