/**
 * The build's entry points.
 *
 * Rollup only emits what an entry reaches. Driving the build from `src/index.ts`
 * alone silently dropped modules that are exported through a wildcard but never
 * re-exported from the barrel (`lib/highlighter`, `hooks/use-highlighted-code`):
 * `tsc` wrote their `.d.ts`, rollup wrote no JavaScript, and the subpath typed
 * fine while failing at runtime.
 *
 * Making every publishable module its own entry keeps the one-file-per-module
 * layout without depending on reachability. Rollup's own documentation recommends
 * this over `output.preserveModules` when the goal is to preserve a file tree.
 */
import { readdirSync } from 'node:fs';
import path from 'node:path';

import { fileURLToPath } from 'node:url';

export const SRC = fileURLToPath(new URL('../src', import.meta.url));

/**
 * Modules that can only ship as ESM, so the CommonJS pass skips them and the
 * `exports` map lists them without a `require` condition. `shiki` has no
 * CommonJS build (`main` is `dist/index.mjs`), so a `.cjs` copy would throw the
 * moment a consumer required it.
 */
export const ESM_ONLY_MODULES = ['lib/highlighter', 'hooks/use-highlighted-code'];

const EXCLUDED = [/\.test\.tsx?$/, /\.stories\.tsx?$/];

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);

    return entry.isDirectory() ? walk(full) : [full];
  });
}

/** `{ 'components/ui/button': '/abs/src/components/ui/button.tsx', … }` */
export function discoverEntries() {
  const entries = walk(SRC)
    .filter((file) => /\.tsx?$/.test(file) && !EXCLUDED.some((rule) => rule.test(file)))
    .map((file) => path.relative(SRC, file).split(path.sep).join('/'))
    .sort();

  return Object.fromEntries(
    entries.map((relative) => [relative.replace(/\.tsx?$/, ''), path.join(SRC, relative)]),
  );
}

/** The same map with the ESM-only modules removed, for the CommonJS pass. */
export function discoverCjsEntries() {
  const entries = discoverEntries();

  for (const name of ESM_ONLY_MODULES) delete entries[name];

  return entries;
}
