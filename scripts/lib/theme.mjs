export const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
export const MONO = "ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,monospace";

// accent / accent2 / accent3 are the three "signal" colours (x, y, z traces of the IMU motif).
// See docs/design-direction.md.
export const THEMES = {
  light: { bg: '#eef2f5', card: '#fbfcfd', ink: '#101c26', muted: '#566573', line: '#d3dde4', accent: '#2f55d4', accent2: '#1f9d6a', accent3: '#d99a00', glow: 0.2, cyan: '#06a6c9' },
  dark:  { bg: '#0c141b', card: '#121d26', ink: '#e7eef4', muted: '#93a4b3', line: '#243442', accent: '#7b97ff', accent2: '#46c996', accent3: '#f0b429', glow: 0.34, cyan: '#22d3ee' },
};

const LANG_COLORS = {
  Python: '#3572a5', 'C++': '#f34b7d', TypeScript: '#3178c6', Java: '#b07219', JavaScript: '#f1e05a',
  'Jupyter Notebook': '#da5b0b', Shell: '#89e051', HTML: '#e34c26', Other: '#8a94a6',
};
export const langColor = (name) => LANG_COLORS[name] ?? '#8a94a6';
