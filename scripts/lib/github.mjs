export class GitHubError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'GitHubError';
    this.status = status;
  }
}

export function createClient({ token = '', fetchImpl = fetch } = {}) {
  const base = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'profile-assets',
    'X-GitHub-Api-Version': '2022-11-28',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  async function call(url, init = {}) {
    const res = await fetchImpl(url, { ...init, headers: { ...base, ...(init.headers ?? {}) } });
    if (!res.ok) throw new GitHubError(`${init.method ?? 'GET'} ${url} -> ${res.status}`, res.status);
    if (res.status === 204) return null; // e.g. contributors of an empty repo: no body to parse
    return res.json();
  }

  return {
    hasToken: Boolean(token),
    rest: (path) => call(`https://api.github.com${path}`),
    async graphql(query, variables) {
      const body = await call('https://api.github.com/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables }),
      });
      if (body.errors?.length) throw new GitHubError(`GraphQL: ${body.errors[0].message}`, 200);
      return body.data;
    },
  };
}
