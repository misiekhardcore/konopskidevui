/**
 * Writes the CommonJS-context declarations (`*.d.cts`).
 *
 * TypeScript reads declarations in the module context implied by their
 * extension, so a dual package needs a declaration per context: `.d.ts` for the
 * `import` branch and `.d.cts` for the `require` branch. `tsc` emits only one
 * set, and the API is identical in both, so each declaration is copied and its
 * relative specifiers are pointed at the `.cjs` files beside it.
 *
 * Modules in `ESM_ONLY_MODULES` are skipped: they have no CommonJS runtime file,
 * so a `.d.cts` would advertise a `require` target that does not exist.
 */
import fs from 'node:fs';
import path from 'node:path';

import { ESM_ONLY_MODULES } from './entries.mjs';

const dist = path.join(process.cwd(), 'dist');

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

export function writeCommonJsDeclarations() {
  let written = 0;

  for (const file of walk(dist).filter((file) => file.endsWith('.d.ts'))) {
    const key = path
      .relative(dist, file)
      .split(path.sep)
      .join('/')
      .replace(/\.d\.ts$/, '');
    if (ESM_ONLY_MODULES.includes(key)) continue;

    const source = fs
      .readFileSync(file, 'utf8')
      // The `.map` files are not copied, so the reference would dangle.
      .replace(/^\/\/# sourceMappingURL=.*$/gm, '')
      .replace(/(['"])(\.{1,2}\/[^'"]*)\.js\1/g, (match, quote, specifier) => {
        return `${quote}${specifier}.cjs${quote}`;
      });

    fs.writeFileSync(file.replace(/\.d\.ts$/, '.d.cts'), source);
    written += 1;
  }

  console.log(`dts: wrote ${written} CommonJS declaration files`);
}

if (import.meta.url === `file://${process.argv[1]}`) writeCommonJsDeclarations();
