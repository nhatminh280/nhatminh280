import { esc } from '../format.mjs';
import { SANS, MONO } from '../theme.mjs';

export function svgDoc({ w, h, title, desc = '', body }) {
  const d = desc ? `<desc>${esc(desc)}</desc>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}" font-family="${SANS}"><title>${esc(title)}</title>${d}${body}</svg>`;
}

// Radius carries rank: hero 18, cards 10 (default), chips and pills 6.
export function cardRect(w, h, th, r = 10) {
  return `<rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="${r}" fill="${th.card}" stroke="${th.line}"/>`;
}

export function text(x, y, str, { size = 14, weight = 400, fill = '#000', anchor = 'start', mono = false, tracking = 0 } = {}) {
  const fam = mono ? ` font-family="${MONO}"` : '';
  const ls = tracking ? ` letter-spacing="${tracking}"` : '';
  return `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"${fam}${ls}>${esc(str)}</text>`;
}
