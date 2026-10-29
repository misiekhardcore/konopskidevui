import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * The `'use client'` contract, enforced at the source instead of in a README.
 *
 * A module needs the directive when it renders a Radix primitive (those use
 * context and state internally) or calls a hook itself. Everything else stays a
 * plain module, so server components can import it without dragging the subtree
 * into the client bundle — `Table`, `Skeleton`, `Kbd`, `Empty` and the prose
 * primitives are deliberately in that group.
 *
 * The published build is checked separately (`scripts/check-build.mjs`): this
 * test guards the source, that one guards `dist`.
 */
const ROOT = path.join(process.cwd(), 'src');
const DIRECTIVE = /^['"]use client['"];?$/;

function walk(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const modules = walk(ROOT)
  .filter((file) => /\.tsx?$/.test(file))
  .filter((file) => !/\.(test|stories)\.tsx?$/.test(file))
  .map((file) => ({
    file: path.relative(process.cwd(), file),
    source: readFileSync(file, 'utf8'),
  }));

describe("the 'use client' contract", () => {
  it('marks every module that renders Radix or calls a hook', () => {
    const missing = modules
      .filter(
        ({ source }) => /from ['"]radix-ui['"]/.test(source) || /\buse[A-Z]\w*\s*\(/.test(source),
      )
      .filter(({ source }) => !DIRECTIVE.test(source.split('\n', 1)[0].trim()))
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
          !DIRECTIVE.test(lines[0].trim())
        );
      })
      .map(({ file }) => file);

    expect(offenders).toEqual([]);
  });

  it('leaves the hook-free presentational modules unmarked', () => {
    // A guard against blanket-marking the directory: these are the components a
    // server component can import today, and marking them would silently move
    // them into the client bundle.
    const serverOnly = ['src/components/ui/table.tsx', 'src/components/ui/skeleton.tsx'];

    for (const file of serverOnly) {
      const { source } = modules.find((module) => module.file === file) ?? { source: '' };
      expect(source.startsWith("'use client'"), `${file} stays a server-compatible module`).toBe(
        false,
      );
    }
  });
});
