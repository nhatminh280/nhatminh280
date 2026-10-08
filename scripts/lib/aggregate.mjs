// Pure reductions over API payloads. No I/O so they are trivial to test.

function totalBytes(perRepoLangs) {
  const totals = new Map();
  for (const langs of perRepoLangs) {
    for (const [name, bytes] of Object.entries(langs ?? {})) {
      if (bytes > 0) totals.set(name, (totals.get(name) ?? 0) + bytes);
    }
  }
  return totals;
}

export function languageShares(perRepoLangs, top = 6) {
  const totals = totalBytes(perRepoLangs);
  const sum = [...totals.values()].reduce((a, b) => a + b, 0);
  if (!sum) return [];
  const sorted = [...totals].sort((a, b) => b[1] - a[1]);
  const head = sorted.slice(0, top).map(([name, bytes]) => ({ name, bytes, pct: (bytes / sum) * 100 }));
  const rest = sorted.slice(top).reduce((a, [, b]) => a + b, 0);
  if (rest > 0) head.push({ name: 'Other', bytes: rest, pct: (rest / sum) * 100 });
  return head;
}

export const distinctLanguages = (perRepoLangs) => totalBytes(perRepoLangs).size;

export const activeDays = (weeks) =>
  weeks.flatMap((w) => w.contributionDays).filter((d) => d.contributionCount > 0).length;

export function yearsSince(iso, now = new Date()) {
  const start = new Date(iso);
  let years = now.getUTCFullYear() - start.getUTCFullYear();
  const anniversary = Date.UTC(now.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate(),
    start.getUTCHours(), start.getUTCMinutes(), start.getUTCSeconds());
  if (now.getTime() < anniversary) years -= 1;
  return Math.max(0, years);
}
