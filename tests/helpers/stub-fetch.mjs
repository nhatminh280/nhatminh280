// Routed fetch stub: first route whose substring appears in the URL answers.
export function stubFetch(routes) {
  const calls = [];
  const f = async (url, init = {}) => {
    calls.push(String(url));
    for (const [pattern, handler] of routes) {
      if (!String(url).includes(pattern)) continue;
      const out = typeof handler === 'function' ? handler(String(url), init) : handler;
      return out instanceof Response ? out : new Response(JSON.stringify(out), { status: 200 });
    }
    return new Response('{}', { status: 404 });
  };
  f.calls = calls;
  return f;
}
