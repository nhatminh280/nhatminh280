import { textWidth, truncate } from '../format.mjs';
import { svgDoc, cardRect, text } from './frame.mjs';

export function stackSVG(groups, th) {
  const W = 900, pad = 28, labelW = 150, gapX = 8, chipH = 30, chipPad = 10, rowGap = 14;
  const left = pad + labelW, right = W - pad;
  let y = pad, body = '';
  for (const g of groups) {
    let x = left, cy = y, chips = '';
    for (const item of g.items) {
      const label = truncate(item, right - left - chipPad * 2, 14);
      const w = Math.ceil(textWidth(label, 14) + chipPad * 2);
      if (x + w > right) { x = left; cy += chipH + 8; }
      chips += `<rect x="${x}" y="${cy}" width="${w}" height="${chipH}" rx="6" fill="${th.bg}" stroke="${th.line}"/>`
        + text(x + chipPad, cy + 20, label, { size: 14, fill: th.ink });
      x += w + gapX;
    }
    body += text(pad, y + 20, truncate(g.title, labelW - 12, 14), { size: 14, weight: 700, fill: th.ink }) + chips;
    y = cy + chipH + rowGap;
  }
  const H = y - rowGap + pad;
  return svgDoc({
    w: W, h: H, title: 'Technology stack',
    desc: groups.map((g) => `${g.title}: ${g.items.join(', ')}`).join('. '),
    body: cardRect(W, H, th) + body,
  });
}
