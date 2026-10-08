// Shared soft-glow backdrop: three big radial gradients that drift slowly behind a card's content.
// Gradients, not blur filters, so it stays cheap to animate. Colours come from the theme so light and dark
// stay in step; `strength` scales the theme's glow for smaller cards.
const f = (n) => Number(n.toFixed(2));

export function auroraDefs(th, strength = 1) {
  const glow = (id, color) => `<radialGradient id="${id}"><stop offset="0" stop-color="${color}" stop-opacity="${f(th.glow * strength)}"/>`
    + `<stop offset="0.55" stop-color="${color}" stop-opacity="${f(th.glow * strength * 0.35)}"/>`
    + `<stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`;
  return glow('ga', th.accent) + glow('gb', th.accent2) + glow('gc', th.cyan);
}

// blobs: [{ n: 1..3 (which gradient), cx, cy, r, x, y, d }]; x/y is the drift, d the phase offset in seconds.
export function auroraLayer(blobs) {
  const grad = ['ga', 'gb', 'gc'];
  return blobs.map((b, i) => `<circle class="aur a${i + 1}" cx="${b.cx}" cy="${b.cy}" r="${b.r}" fill="url(#${grad[b.n - 1]})" style="--x:${b.x}px;--y:${b.y}px;--d:${b.d}s"/>`).join('');
}

export const AURORA_CSS = '.aur{animation:aur 24s ease-in-out infinite alternate;animation-delay:var(--d)}'
  + '@keyframes aur{from{transform:translate(0,0)}to{transform:translate(var(--x),var(--y))}}';
