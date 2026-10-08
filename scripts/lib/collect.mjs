import { GitHubError } from './github.mjs';
import { languageShares, distinctLanguages, activeDays, yearsSince } from './aggregate.mjs';

const CALENDAR_QUERY = `query($login:String!,$from:DateTime!,$to:DateTime!){
  user(login:$login){contributionsCollection(from:$from,to:$to){contributionCalendar{weeks{contributionDays{contributionCount}}}}}
}`;

async function listPublicRepos(client, user) {
  const all = [];
  for (let page = 1; ; page++) {
    const batch = await client.rest(`/users/${user}/repos?type=owner&per_page=100&page=${page}`);
    all.push(...batch);
    if (batch.length < 100) break;
  }
  return all.filter((r) => !r.private); // defensive: the endpoint is public-only already
}

// The contribution calendar is the one figure that may be legitimately unavailable (the token can lack
// access). That shows up as a GraphQL-level error (HTTP 200, status 200 on GitHubError) and omits the
// figure. Transport failures (5xx, 403/429 rate limits) are NOT swallowed: they must fail the run so a
// transient outage never commits a card with a figure missing.
async function calendarOrNull(fn) {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof GitHubError && e.status === 200) {
      console.warn(`warn: contribution calendar unavailable (${e.message}); figure omitted`);
      return null;
    }
    throw e;
  }
}

async function fetchActiveDays(client, user, now) {
  const from = new Date(now.getTime() - 365 * 864e5);
  const data = await client.graphql(CALENDAR_QUERY, { login: user, from: from.toISOString(), to: now.toISOString() });
  const weeks = data.user.contributionsCollection.contributionCalendar.weeks;
  return weeks.length ? activeDays(weeks) : null;
}

export async function collect({ user, featured, client, now = new Date() }) {
  const profile = await client.rest(`/users/${user}`);
  const repos = await listPublicRepos(client, user);
  const owned = repos.filter((r) => !r.fork);

  const langList = await Promise.all(owned.map((r) => client.rest(`/repos/${user}/${r.name}/languages`)));

  // is:public keeps private-repo commits out of the count whichever token runs the build.
  const commits = (await client.rest(`/search/commits?q=author:${encodeURIComponent(user)}+is:public&per_page=1`)).total_count;
  const calendarDays = client.hasToken
    ? await calendarOrNull(() => fetchActiveDays(client, user, now))
    : null;

  const featuredOut = [];
  for (const f of featured) {
    const found = repos.find((r) => r.name === f.repo);
    if (!found) throw new Error(`Featured repo not found or not public: ${f.repo}`);
    const [detail, langs] = await Promise.all([
      client.rest(`/repos/${user}/${f.repo}`),
      client.rest(`/repos/${user}/${f.repo}/languages`),
    ]);
    featuredOut.push({
      ...f,
      url: found.html_url,
      fork: Boolean(detail.fork),
      parent: detail.parent?.full_name ?? null,
      languages: Object.entries(langs).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([n]) => n),
    });
  }

  return {
    figures: {
      repos: profile.public_repos,
      commits,
      followers: profile.followers,
      years: yearsSince(profile.created_at, now),
      activeDays: calendarDays,
      languageCount: distinctLanguages(langList),
    },
    languages: languageShares(langList),
    featured: featuredOut,
  };
}
