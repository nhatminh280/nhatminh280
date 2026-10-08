import { textWidth, truncate } from '../format.mjs';
import { svgDoc, cardRect, text } from './frame.mjs';

// Three accelerometer-style traces (x, y, z) with a burst inside a bracketed window: the shape of the
// data the ESP32 gesture model classifies. Pure function of its inputs, so asset diffs stay meaningful.
function imuArt(th, x0, y0, w, h) {
  const N = 90;
  const traces = [
    { base: y0 + h * 0.2, color: th.accent, freq: 9, phase: 0 },
    { base: y0 + h * 0.5, color: th.accent2, freq: 11, phase: 1.3 },
    { base: y0 + h * 0.8, color: th.accent3, freq: 7, phase: 2.6 },
  ];
  const winX = x0 + w * 0.36, winW = w * 0.28;
  let out = `<rect x="${winX.toFixed(1)}" y="${y0 - 6}" width="${winW.toFixed(1)}" height="${h + 12}" rx="6" fill="${th.accent}" fill-opacity="0.07" stroke="${th.accent}" stroke-opacity="0.55" stroke-dasharray="4 4"/>`;
  for (const t of traces) {
    const pts = Array.from({ length: N + 1 }, (_, i) => {
      const u = i / N;
      const env = 4 + 20 * Math.exp(-(((u - 0.5) / 0.15) ** 2));
      const v = Math.sin(u * t.freq * Math.PI * 2 + t.phase) + 0.35 * Math.sin(u * t.freq * 5.3 + t.phase);
      return `${(x0 + u * w).toFixed(1)},${(t.base + env * v * 0.7).toFixed(1)}`;
    }).join(' ');
    out += `<polyline points="${pts}" fill="none" stroke="${t.color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
  }
  return out;
}

export function heroSVG(hero, th) {
  const W = 900, H = 260;
  let body = cardRect(W, H, th, 18) + imuArt(th, 520, 40, 340, 180);
  body += text(40, 58, truncate(hero.meta, 440, 13), { size: 13, fill: th.muted, mono: true });
  body += text(40, 118, truncate(hero.name, 440, 46), { size: 46, weight: 800, fill: th.ink });
  body += text(40, 160, truncate(hero.role, 440, 28), { size: 28, weight: 700, fill: th.accent });
  const status = truncate(hero.status, 420, 13);
  const pillW = Math.ceil(textWidth(status, 13) + 38);
  body += `<rect x="40" y="180" width="${pillW}" height="30" rx="6" fill="${th.bg}" stroke="${th.line}"/>`
    + `<circle cx="58" cy="195" r="4.5" fill="${th.accent2}"/>`
    + text(70, 200, status, { size: 13, weight: 600, fill: th.ink });
  body += text(40, 236, truncate(hero.focus, 440, 14), { size: 14, fill: th.muted });
  return svgDoc({ w: W, h: H, title: `${hero.name}, ${hero.role}`, desc: `${hero.status}. ${hero.focus}`, body });
}
