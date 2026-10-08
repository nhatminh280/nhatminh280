import { THEMES } from './theme.mjs';
import { heroSVG } from './svg/hero.mjs';
import { activitySVG } from './svg/activity.mjs';
import { stackSVG } from './svg/stack.mjs';
import { languagesSVG } from './svg/languages.mjs';
import { projectSVG } from './svg/project.mjs';
import { badgeSVG } from './svg/badge.mjs';

// Pure: builds every file in memory so a failure can never leave assets/ half-written.
export function renderAll({ data, config }) {
  const files = {};
  for (const [key, th] of Object.entries(THEMES)) {
    files[`hero-${key}.svg`] = heroSVG(config.hero, th);
    files[`activity-${key}.svg`] = activitySVG(data.figures, th);
    files[`stack-${key}.svg`] = stackSVG(config.stack, th);
    files[`languages-${key}.svg`] = languagesSVG(data.languages, th);
    data.featured.forEach((p, i) => { files[`project-${i + 1}-${key}.svg`] = projectSVG(p, th); });
    config.links.forEach((b, i) => { files[`badge-${b.id}-${key}.svg`] = badgeSVG(b, th, i); });
  }
  return files;
}
