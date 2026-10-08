// Minimal well-formedness check for the SVG subset this project emits
// (double-quoted attributes, escaped text). Node has no built-in XML parser.
export function assertWellFormed(svg) {
  const stack = [];
  const re = /<(\/?)([A-Za-z][\w:.-]*)((?:\s+[\w:.-]+="[^"]*")*)\s*(\/?)>/g;
  let last = 0;
  let m;
  while ((m = re.exec(svg))) {
    if (/[<>]/.test(svg.slice(last, m.index))) throw new Error(`stray angle bracket before index ${m.index}`);
    last = re.lastIndex;
    const [, close, name, attrs, self] = m;
    const names = [...attrs.matchAll(/\s([\w:.-]+)=/g)].map((a) => a[1]);
    const dup = names.find((n, i) => names.indexOf(n) !== i);
    if (dup) throw new Error(`duplicate attribute ${dup} on <${name}> (browsers reject the whole file)`);
    if (self) continue;
    if (close) {
      const open = stack.pop();
      if (open !== name) throw new Error(`mismatched </${name}>, expected </${open}>`);
    } else {
      stack.push(name);
    }
  }
  if (/[<>]/.test(svg.slice(last))) throw new Error('stray angle bracket after last tag');
  if (stack.length) throw new Error(`unclosed <${stack.at(-1)}>`);
  if (/&(?!(amp|lt|gt|quot|#39|#\d+);)/.test(svg)) throw new Error('unescaped ampersand');
}
