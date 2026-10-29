import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * The `'use client'` contract, enforced at the source instead of in a README.
 *
 * A module needs the directive when it calls a hook itself, or when it wraps a
 * primitive that has no client boundary of its own. Two kinds of module are
 * therefore left plain, and both are deliberate:
 *
 * - `Slot`-only presentational modules (`Button`, `Card`, `Badge`, `Item`).
 *   `Slot` is `asChild` plumbing with no behaviour, and Radix leaves it
 *   unmarked for exactly that reason. This one is not cosmetic: `button.tsx`
 *   also exports `buttonVariants`, a plain function, which under a blanket
 *   directive became a client reference and threw "Attempted to call
 *   buttonVariants() from the server" whenever a server component styled a
 *   `<Link>` with it.
 * - thin wrappers over a dependency that declares the boundary itself (see
 *   `SELF_BOUNDARY_PACKAGES`). Marking them buys nothing: the client graph
 *   already starts inside the dependency.
 *
 * Everything else — every other Radix primitive, even the hook-free ones like
 * `Label` and `Separator`, which Radix marks — stays marked. That is the line
 * Radix draws in its own build, and it is the safer side of an asymmetric
 * trade: a missing directive crashes a consumer at runtime, an extra one costs
 * a few kilobytes.
 *
 * The published build is checked separately (`scripts/check-build.mjs`): this
 * test guards the source, that one guards `dist`.
 */
const ROOT = path.join(process.cwd(), 'src');
const DIRECTIVE = /^['"]use client['"];?$/;

/**
 * Packages that carry `'use client'` in their own entry point, verified by the
 * last test in this file. The wrappers over them stay unmarked, so this list is
 * a load-bearing premise rather than documentation.
 */
const SELF_BOUNDARY_PACKAGES = [
  'cmdk',
  'react-resizable-panels',
  'sonner',
  '@shadcn/react/questionnaire',
];

function walk(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

/** The named bindings a module pulls from the consolidated `radix-ui` package. */
function radixPrimitives(source: string): string[] {
  return [...source.matchAll(/import\s*\{([^}]*)\}\s*from\s*['"]radix-ui['"]/g)]
    .flatMap((match) => match[1].split(','))
    .map((binding) =>
      binding
        .trim()
        .split(/\s+as\s+/)[0]
        .trim(),
    )
    .filter(Boolean);
}

function needsClient(source: string): boolean {
  return (
    /\buse[A-Z]\w*\s*\(/.test(source) || radixPrimitives(source).some((name) => name !== 'Slot')
  );
}

const modules = walk(ROOT)
  .filter((file) => /\.tsx?$/.test(file))
  .filter((file) => !/\.(test|stories)\.tsx?$/.test(file))
  .map((file) => ({
    file: path.relative(process.cwd(), file),
    source: readFileSync(file, 'utf8'),
  }));

const firstLine = (source: string) => source.split('\n', 1)[0].trim();

/** The first line of a package's published entry point for a subpath export. */
function entryFirstLine(specifier: string): string {
  const parts = specifier.split('/');
  const name = specifier.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
  const subpath = `./${parts.slice(name.split('/').length).join('/')}`;
  const manifest = JSON.parse(
    readFileSync(path.join(process.cwd(), 'node_modules', name, 'package.json'), 'utf8'),
  );

  const target =
    subpath === './'
      ? (manifest.module ?? manifest.main)
      : typeof manifest.exports?.[subpath] === 'string'
        ? manifest.exports[subpath]
        : (manifest.exports?.[subpath]?.import ?? manifest.exports?.[subpath]?.default);

  return readFileSync(path.join(process.cwd(), 'node_modules', name, target), 'utf8')
    .split('\n', 1)[0]
    .trim();
}

describe("the 'use client' contract", () => {
  it('marks every module that calls a hook or wraps a primitive without its own boundary', () => {
    const missing = modules
      .filter(({ source }) => needsClient(source))
      .filter(({ source }) => !DIRECTIVE.test(firstLine(source)))
      .map(({ file }) => file);

    expect(missing).toEqual([]);
  });

  it('marks no module twice, and always on the first line', () => {
    const offenders = modules
      .filter(({ source }) => source.split('\n').some((line) => DIRECTIVE.test(line.trim())))
      .filter(({ source }) => {
        const lines = source.split('\n');
        return (
          lines.filter((line) => DIRECTIVE.test(line.trim())).length !== 1 ||
          !DIRECTIVE.test(firstLine(source))
        );
      })
      .map(({ file }) => file);

    expect(offenders).toEqual([]);
  });

  it('leaves every module that does not need a client boundary unmarked', () => {
    // Self-maintaining replacement for a hand-written allowlist: anything that
    // is `Slot`-only or hook-free must stay a server-compatible module, so a
    // `Card`, a `Badge` or `buttonVariants` never quietly joins the client
    // bundle.
    const wronglyMarked = modules
      .filter(({ source }) => !needsClient(source))
      .filter(({ source }) => DIRECTIVE.test(firstLine(source)))
      .map(({ file }) => file);

    expect(wronglyMarked).toEqual([]);
  });

  it('only relies on a dependency boundary that is actually declared', () => {
    // Minified bundles put the directive on the same line as their first
    // import, so this is a prefix test rather than the line-equality above.
    const declares = /^['"]use client['"];?/;

    for (const specifier of SELF_BOUNDARY_PACKAGES) {
      expect(declares.test(entryFirstLine(specifier)), `${specifier} declares 'use client'`).toBe(
        true,
      );
    }
  });
});
