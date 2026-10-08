import { fmt, textWidth, truncate } from '../format.mjs';
import { svgDoc, cardRect, text } from './frame.mjs';

// 3-column grid; value and label share one baseline so it reads as a ledger, not a KPI banner.
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

  const W = 900, pad = 28, cols = 3, rowH = 46, top = 22;
  const cellW = (W - pad * 2) / cols;
  const rows = Math.ceil(items.length / cols);
  const H = top + rows * rowH + 12;
  let body = cardRect(W, H, th);
  items.forEach(([label, value], i) => {
    const x = pad + (i % cols) * cellW;
    const y = top + Math.floor(i / cols) * rowH + 30;
    const v = fmt(value);
    const vw = textWidth(v, 28);
    body += text(x.toFixed(1), y, v, { size: 28, weight: 700, fill: th.ink });
    body += text((x + vw + 10).toFixed(1), y, truncate(label, cellW - vw - 28, 14), { size: 14, fill: th.muted });
  });
  return svgDoc({ w: W, h: H, title: 'GitHub activity', desc: items.map(([l, v]) => `${l}: ${v}`).join(', '), body });
}
