/**
 * `pnpm build` — the whole pipeline, in the order the pieces depend on each
 * other:
 *
 *   1. Vite, twice: `dist/**\/*.js` (ESM) and then `dist/**\/*.cjs` (CommonJS).
 *   2. `tsc --emitDeclarationOnly`, which drops `.d.ts` next to both.
 *   3. `fix-declarations`: rewrite relative specifiers to `.js`.
 *   4. `dts`: write the CommonJS-context `.d.cts` copies.
 *   5. `copy-styles`: publish `src/styles` as `dist/styles`, with the package's
 *      own `@source` registration.
 *   6. `check-build`: assert the tarball is complete and self-consistent.
 *
 * Emitting the same package in two formats means every step has to agree on the
 * file layout, so the order lives in one place instead of a shell chain.
 */
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

import { build } from 'vite';

import { checkBuild } from './check-build.mjs';
import { copyStyles } from './copy-styles.mjs';
import { writeCommonJsDeclarations } from './dts.mjs';
import { fixDeclarations } from './fix-declarations.mjs';

const require = createRequire(import.meta.url);

async function bundle() {
  for (const mode of ['es', 'cjs']) {
    await build({ mode, logLevel: 'warn' });
  }
}

function types() {
  execFileSync(
    process.execPath,
    [require.resolve('typescript/bin/tsc'), '-p', 'tsconfig.build.json'],
    {
      stdio: 'inherit',
    },
  );
}

await bundle();
types();
fixDeclarations();
writeCommonJsDeclarations();
copyStyles();
checkBuild();
