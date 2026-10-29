/**
 * The build's own test, run by `pnpm build` and again by `pnpm verify`.
 *
 * Every rule here exists because the published tarball got it wrong once:
 *
 * - `lib/highlighter.js` and `hooks/use-highlighted-code.js` were missing while
 *   their declarations shipped, so the subpath typed fine and threw at runtime.
 * - `textarea.js` carried `'use client'` twice, and `dialog.js` not at all.
 * - `styles.css` resolved into `src`, where nothing else did.
 *
 * The checks run against `dist`, not the source, because that is what consumers
 * install.
 */
import fs from 'node:fs';
import path from 'node:path';

import { discoverEntries, ESM_ONLY_MODULES } from './entries.mjs';

const root = process.cwd();
const dist = path.join(root, 'dist');
const DIRECTIVE = /^['"]use client['"];?$/;

const errors = [];

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function isClientSource(file) {
  const [first] = fs.readFileSync(file, 'utf8').split('\n', 1);
  return DIRECTIVE.test(first.trim());
}

function checkModuleParity(entries) {
  for (const [key, source] of Object.entries(entries)) {
    // Source maps are not asserted: a module that is only re-exports (the
    // barrel, `lib/utils`) has nothing to map and gets no `.map` at all.
    const expected = [`${key}.js`, `${key}.d.ts`];

    if (!ESM_ONLY_MODULES.includes(key)) expected.push(`${key}.cjs`, `${key}.d.cts`);

    for (const relative of expected) {
      if (!fs.existsSync(path.join(dist, relative))) {
        errors.push(`missing build output: dist/${relative} (from src/${key})`);
      }
    }
  }
}

function checkDirectives(entries) {
  for (const [key, source] of Object.entries(entries)) {
    const client = isClientSource(source);
    const files = [path.join(dist, `${key}.js`)];

    if (!ESM_ONLY_MODULES.includes(key)) files.push(path.join(dist, `${key}.cjs`));

    for (const file of files) {
      if (!fs.existsSync(file)) continue;

      const lines = fs.readFileSync(file, 'utf8').split('\n').slice(0, 3);
      const count = lines.filter((line) => DIRECTIVE.test(line.trim())).length;

      if (client && count !== 1) {
        errors.push(
          `dist/${path.relative(dist, file)}: expected exactly one 'use client', found ${count}`,
        );
      }

      if (client && count === 1 && !DIRECTIVE.test(lines[0].trim())) {
        errors.push(`dist/${path.relative(dist, file)}: 'use client' is not the first statement`);
      }

      if (!client && count > 0) {
        errors.push(`dist/${path.relative(dist, file)}: unexpected 'use client' directive`);
      }
    }
  }
}

function checkStyles() {
  const stylesheet = path.join(dist, 'styles', 'globals.css');

  if (!fs.existsSync(stylesheet)) {
    errors.push('missing build output: dist/styles/globals.css');
    return;
  }

  const contents = fs.readFileSync(stylesheet, 'utf8');

  if (!contents.includes("@source '../components'")) {
    errors.push('dist/styles/globals.css: missing the package @source registration');
  }

  for (const file of fs.readdirSync(path.join(root, 'src', 'styles'))) {
    if (!file.endsWith('.css')) continue;
    if (!fs.existsSync(path.join(dist, 'styles', file))) {
      errors.push(`missing build output: dist/styles/${file}`);
    }
  }
}

/**
 * Every `exports` target has to exist. Wildcards are sampled with a known entry
 * per export family, so a renamed or deleted module fails here instead of in a
 * consumer's install.
 */
function checkExports(entries) {
  const samples = { components: 'button', lib: 'utils', hooks: 'use-mobile' };
  const { exports } = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

  for (const [subpath, target] of Object.entries(exports)) {
    const wildcard = subpath.includes('*')
      ? (samples[subpath.split('/')[1]] ?? path.basename(subpath))
      : null;

    if (wildcard && !Object.keys(entries).some((key) => key.endsWith(`/${wildcard}`))) {
      errors.push(`exports "${subpath}": sample "${wildcard}" is not a build entry`);
    }

    const targets = typeof target === 'string' ? { '.': target } : target;

    for (const [condition, value] of Object.entries(targets)) {
      const resolved =
        typeof value === 'object'
          ? Object.entries(value).map(([name, file]) => [name, file])
          : [[condition, value]];

      for (const [, file] of resolved) {
        const candidate = wildcard ? String(file).replace('*', wildcard) : String(file);

        if (!fs.existsSync(path.join(root, candidate))) {
          errors.push(`exports "${subpath}" (${condition}) → ${candidate} does not exist`);
        }
      }
    }
  }
}

function checkNoStrayOutput(entries) {
  const expected = new Set();

  for (const key of Object.keys(entries)) {
    for (const extension of ['.js', '.d.ts', '.cjs', '.d.cts']) expected.add(`${key}${extension}`);
  }

  for (const file of fs.readdirSync(path.join(root, 'src', 'styles'))) {
    if (file.endsWith('.css')) expected.add(`styles/${file}`);
  }

  for (const file of walk(dist)) {
    const relative = path.relative(dist, file).split(path.sep).join('/');
    // Source maps belong to the file they sit next to.
    const path_ = relative.replace(/\.map$/, '');

    // Rolldown emits one shared runtime chunk for the CommonJS interop helpers.
    // It is referenced relatively from every `.cjs` module, so it has to ship.
    if (path_.startsWith('chunks/')) continue;

    if (!expected.has(path_)) errors.push(`unexpected build output: dist/${relative}`);
  }
}

export function checkBuild() {
  const entries = discoverEntries();

  checkModuleParity(entries);
  checkDirectives(entries);
  checkStyles();
  checkExports(entries);
  checkNoStrayOutput(entries);

  if (errors.length > 0) {
    console.error(`\ncheck-build: ${errors.length} problem(s) in dist\n`);
    for (const error of errors) console.error(`  ✗ ${error}`);
    console.error('');
    process.exit(1);
  }

  console.log(`check-build: ${Object.keys(entries).length} modules verified`);
}

if (import.meta.url === `file://${process.argv[1]}`) checkBuild();
