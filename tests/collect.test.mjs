import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createClient, GitHubError } from '../scripts/lib/github.mjs';
import { collect } from '../scripts/lib/collect.mjs';
import { stubFetch } from './helpers/stub-fetch.mjs';

const NOW = new Date('2026-10-08T00:00:00Z');
const featured = [{ repo: 'e-shop', title: 'e-shop', blurb: 'b', note: 'n' }];

const repo = (name, extra = {}) => ({ name, private: false, fork: false, html_url: `https://github.com/u/${name}`, ...extra });
const calendar = (counts) => ({ data: { user: { contributionsCollection: { contributionCalendar: {
  weeks: [{ contributionDays: counts.map((c) => ({ contributionCount: c })) }] } } } } });

function routes(over = {}) {
  return [
    ['/search/commits', over.search ?? { total_count: 254 }],
    ['/graphql', over.graphql ?? calendar([0, 2, 1])],
    ['/users/u/repos', over.repos ?? [repo('e-shop', { fork: true }), repo('own'), repo('secret', { private: true })]],
    ['/users/u', over.user ?? { login: 'u', name: 'U', followers: 8, public_repos: 3, created_at: '2022-10-04T00:00:00Z' }],
    ['/repos/u/e-shop/languages', { Python: 50, TypeScript: 30, Java: 20, Shell: 1 }],
    ['/repos/u/e-shop', { fork: true, parent: { full_name: 'x/e-shop' } }],
    ['/repos/u/own/languages', { Python: 100, 'C++': 100 }],
    ['/languages', {}], // catch-all so extra repos (pagination test) have an empty language map
  ];
}
const run = (over, token = 't') => {
  const f = stubFetch(routes(over));
  return { f, p: collect({ user: 'u', featured, client: createClient({ token, fetchImpl: f }), now: NOW }) };
};

test('collect builds figures, language shares and featured cards', async () => {
  const { f, p } = run();
  const d = await p;
  assert.deepEqual(d.figures, { repos: 3, commits: 254, followers: 8, years: 4, activeDays: 2, languageCount: 2 });
  assert.deepEqual(d.languages.map((l) => l.name).sort(), ['C++', 'Python']);
  assert.equal(d.featured[0].fork, true);
  assert.equal(d.featured[0].parent, 'x/e-shop');
  assert.deepEqual(d.featured[0].languages, ['Python', 'TypeScript', 'Java']);
  assert.ok(!f.calls.some((u) => u.includes('/repos/u/secret')), 'private repo must not be queried');
});

test('fork languages do not feed the language bar', async () => {
  const d = await run().p;
  assert.ok(!d.languages.some((l) => l.name === 'TypeScript'));
});

test('a required endpoint failing rejects with GitHubError (rate limit)', async () => {
  const { p } = run({ user: new Response('{}', { status: 403 }) });
  await assert.rejects(p, (e) => e instanceof GitHubError && e.status === 403);
});

test('missing featured repo fails loudly with its name', async () => {
  const f = stubFetch(routes());
  await assert.rejects(
    collect({ user: 'u', featured: [{ repo: 'gone', title: 'g', blurb: 'b' }], client: createClient({ token: 't', fetchImpl: f }), now: NOW }),
    /Featured repo not found or not public: gone/);
});

test('private featured repo is treated as missing', async () => {
  const f = stubFetch(routes());
  await assert.rejects(
    collect({ user: 'u', featured: [{ repo: 'secret', title: 's', blurb: 'b' }], client: createClient({ token: 't', fetchImpl: f }), now: NOW }),
    /Featured repo not found or not public: secret/);
});

test('no token: GraphQL is never called and activeDays is null', async () => {
  const { f, p } = run({}, '');
  const d = await p;
  assert.equal(d.figures.activeDays, null);
  assert.ok(!f.calls.some((u) => u.includes('/graphql')));
});

test('empty calendar omits the figure, a real calendar of zeros keeps 0', async () => {
  const empty = await run({ graphql: { data: { user: { contributionsCollection: { contributionCalendar: { weeks: [] } } } } } }).p;
  assert.equal(empty.figures.activeDays, null);
  const zeros = await run({ graphql: calendar([0, 0, 0]) }).p;
  assert.equal(zeros.figures.activeDays, 0);
});

test('commit search failure is fatal (rate limit / 5xx must not drop a figure)', async () => {
  const { p } = run({ search: new Response('{}', { status: 502 }) });
  await assert.rejects(p, (e) => e instanceof GitHubError && e.status === 502);
});

test('commit search counts public commits only', async () => {
  const { f, p } = run();
  await p;
  const url = f.calls.find((u) => u.includes('/search/commits'));
  assert.match(decodeURIComponent(url), /author:u\+is:public|author:u is:public/);
});

test('GraphQL transport failure (5xx) is fatal', async () => {
  const { p } = run({ graphql: new Response('{}', { status: 502 }) });
  await assert.rejects(p, (e) => e instanceof GitHubError && e.status === 502);
});

test('GraphQL-level error (e.g. token lacks access) omits only the calendar figure', async () => {
  const d = await run({ graphql: { errors: [{ message: 'Resource not accessible by integration' }] } }).p;
  assert.equal(d.figures.activeDays, null);
  assert.equal(d.figures.commits, 254);
});

test('repo listing paginates past 100 repos', async () => {
  const page1 = Array.from({ length: 100 }, (_, i) => repo(`r${i}`));
  page1[0] = repo('e-shop', { fork: true });
  const f = stubFetch([
    ['page=2', [repo('last')]],
    ...routes({ repos: page1 }),
  ]);
  const d = await collect({ user: 'u', featured, client: createClient({ token: 't', fetchImpl: f }), now: NOW });
  assert.ok(f.calls.some((u) => u.includes('page=2')));
  assert.ok(d.featured.length === 1);
});
