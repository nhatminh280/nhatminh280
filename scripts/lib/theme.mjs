export const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
export const MONO = "ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,monospace";

// Blue direction: every colour sits in the blue family. accent / accent2 / accent3 / cyan are four distinct blues
// (royal, sky, periwinkle, ice) so clusters, icons and chips stay tellable apart without leaving the hue.
// See docs/design-direction.md.
export const THEMES = {
  light: { bg: '#eaf1ff', card: '#f8faff', ink: '#0b1a3a', muted: '#4a5f87', line: '#cddcf7', accent: '#2f5bea', accent2: '#0a8bd9', accent3: '#6a6df0', glow: 0.22, cyan: '#14b0d9' },
  dark:  { bg: '#070f23', card: '#0b1730', ink: '#e6efff', muted: '#8fa6d0', line: '#1b2d52', accent: '#6f93ff', accent2: '#38b6ff', accent3: '#8f94ff', glow: 0.36, cyan: '#4fd0ee' },
};

const LANG_COLORS = {
  Python: '#3572a5', 'C++': '#f34b7d', TypeScript: '#3178c6', Java: '#b07219', JavaScript: '#f1e05a',
  'Jupyter Notebook': '#da5b0b', Shell: '#89e051', HTML: '#e34c26', Other: '#8a94a6',
};
export const langColor = (name) => LANG_COLORS[name] ?? '#8a94a6';
