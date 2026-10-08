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

// My commits against everyone's, from the contributors list. Null when I am not on it (or the list is empty), so a
// card never claims a share the API did not report.
function shareOfCommits(contributors, user) {
  if (!Array.isArray(contributors) || !contributors.length) return null;
  const mine = contributors.find((c) => c.login?.toLowerCase() === user.toLowerCase());
  if (!mine) return null;
  return { mine: mine.contributions, total: contributors.reduce((n, c) => n + c.contributions, 0) };
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
    const owner = f.owner ?? user;
    const own = owner.toLowerCase() === user.toLowerCase();
    const label = own ? f.repo : `${owner}/${f.repo}`;
    const notFound = () => new Error(`Featured repo not found or not public: ${label}`);

    let detail, url;
    if (own) {
      const found = repos.find((r) => r.name === f.repo);
      if (!found) throw notFound();
      url = found.html_url;
      detail = await client.rest(`/repos/${user}/${f.repo}`);
    } else {
      // Someone else's repo (a team or hackathon project): read it from its owner and require it to be public.
      try {
        detail = await client.rest(`/repos/${owner}/${f.repo}`);
      } catch (e) {
        if (e instanceof GitHubError && e.status === 404) throw notFound();
        throw e;
      }
      if (detail.private) throw notFound();
      url = detail.html_url;
    }
    const [langs, contributors] = await Promise.all([
      client.rest(`/repos/${owner}/${f.repo}/languages`),
      own ? null : client.rest(`/repos/${owner}/${f.repo}/contributors?per_page=100`),
    ]);
    featuredOut.push({
      ...f,
      url,
      ownerLogin: detail.owner?.login ?? owner,
      external: !own,
      contributions: own ? null : shareOfCommits(contributors, user),
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
