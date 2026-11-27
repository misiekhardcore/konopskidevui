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
 * `exports` map lists them without a `require` condition. `shiki` and
 * `@videojs/react` have no CommonJS build, so a `.cjs` copy would throw the
 * moment a consumer required it.
 */
export const ESM_ONLY_MODULES = [
  'components/ui/video',
  // Reaches `@videojs/react` through the `Video` player it renders.
  'components/ai/file-part',
  'lib/highlighter',
  'hooks/use-highlighted-code',
];

const EXCLUDED = [/\.d\.ts$/, /\.test\.tsx?$/, /\.stories\.tsx?$/];

/**
 * Directories under `src` that hold test-only modules. They ship nothing: the
 * fixtures and helpers here exist so suites and stories render from one typed
 * source, and a module in one of these directories must never become a build
 * entry or reach `dist` (see `check-build.mjs`).
 */
export const TEST_ONLY_DIRECTORIES = ['testing'];

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);

    return entry.isDirectory() ? walk(full) : [full];
  });
}

function sourceModules() {
  return walk(SRC)
    .filter((file) => /\.tsx?$/.test(file) && !EXCLUDED.some((rule) => rule.test(file)))
    .map((file) => path.relative(SRC, file).split(path.sep).join('/'));
}

function isTestOnlyModule(relative) {
  return TEST_ONLY_DIRECTORIES.some(
    (directory) => relative === directory || relative.startsWith(`${directory}/`),
  );
}

/** `{ 'components/ui/button': '/abs/src/components/ui/button.tsx', … }` */
export function discoverEntries() {
  const entries = sourceModules()
    .filter((relative) => !isTestOnlyModule(relative))
    .sort();

  return Object.fromEntries(
    entries.map((relative) => [relative.replace(/\.tsx?$/, ''), path.join(SRC, relative)]),
  );
}

/** The modules the build deliberately leaves out, so the check can prove they stayed out. */
export function discoverTestOnlyModules() {
  return sourceModules()
    .filter(isTestOnlyModule)
    .map((relative) => relative.replace(/\.tsx?$/, ''))
    .sort();
}

/** The same map with the ESM-only modules removed, for the CommonJS pass. */
export function discoverCjsEntries() {
  const entries = discoverEntries();

  for (const name of ESM_ONLY_MODULES) delete entries[name];

  return entries;
}
