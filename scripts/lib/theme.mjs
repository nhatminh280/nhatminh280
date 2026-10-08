export const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
export const MONO = "ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,monospace";

// Blue direction: every colour sits in the blue family. accent / accent2 / accent3 / cyan are four distinct blues
// (royal, sky, periwinkle, ice) so clusters, icons and chips stay tellable apart without leaving the hue.
// See docs/design-direction.md.
export const THEMES = {
  light: { bg: '#eaf1ff', card: '#f8faff', ink: '#0b1a3a', muted: '#4a5f87', line: '#cddcf7', accent: '#2f5bea', accent2: '#0a8bd9', accent3: '#6a6df0', glow: 0.22, cyan: '#14b0d9' },
  dark:  { bg: '#070f23', card: '#0b1730', ink: '#e6efff', muted: '#8fa6d0', line: '#1b2d52', accent: '#6f93ff', accent2: '#38b6ff', accent3: '#8f94ff', glow: 0.36, cyan: '#4fd0ee' },
};

// Blues only, spread across lightness and a little hue so neighbouring segments of the language bar stay readable.
// Names carry the identity; the legend always prints them.
const LANG_COLORS = {
  'Jupyter Notebook': '#1d4ed8', Python: '#3b82f6', 'C++': '#6a6df0', JavaScript: '#4fb4f0', TypeScript: '#2a8be8',
  Java: '#5b6fd8', Shell: '#8aa6ff', HTML: '#2fa3d8', Other: '#8a9bbd',
};
export const langColor = (name) => LANG_COLORS[name] ?? '#8a9bbd';
