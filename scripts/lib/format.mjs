// Text helpers shared by every SVG renderer. SVG cannot measure text, so width is
// estimated with a fixed advance ratio; it errs wide so text never overruns a card.
const ADV = 0.6;

export const fmt = (n) => Number(n).toLocaleString('en-US');

export const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export const textWidth = (text, size, tracking = 0) => [...String(text)].length * (size * ADV + tracking);

export function truncate(text, maxWidth, size, tracking = 0) {
  const s = String(text);
  if (textWidth(s, size, tracking) <= maxWidth) return s;
  const per = size * ADV + tracking;
  const keep = Math.max(0, Math.floor(maxWidth / per) - 1);
  return [...s].slice(0, keep).join('').trimEnd() + '…';
}

export function wrap(text, maxWidth, size, maxLines = 2) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (textWidth(next, size) <= maxWidth) { cur = next; continue; }
    if (cur) lines.push(cur);
    cur = w;
  }
  if (cur) lines.push(cur);
  if (lines.length <= maxLines) return lines.map((l) => truncate(l, maxWidth, size));
  const head = lines.slice(0, maxLines);
  head[maxLines - 1] = truncate(lines.slice(maxLines - 1).join(' '), maxWidth, size);
  return head;
}
