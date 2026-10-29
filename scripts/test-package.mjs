/**
 * Installs the packed tarball into a throwaway consumer and uses it the way an
 * app does. This is the check `publint` and `attw` cannot make: they read the
 * package's metadata, while this runs it.
 *
 * Four things are asserted, each one a bug this package shipped:
 *
 *   1. `import` works — the ESM entry and a deep subpath resolve.
 *   2. `require` works — the reason for the CommonJS build, and what lets a Jest
 *      suite consume the package without a transform.
 *   3. The barrel resolves with **only** the core dependencies installed. The
 *      heavy peers are deliberately absent, so a stray re-export of `chart` or
 *      `drawer` fails here instead of in a consumer's install.
 *   4. A Tailwind build that imports nothing but `@konopskidev/ui/styles.css`
 *      emits the components' utilities — the `@source` line inside the published
 *      stylesheet. It used to need a consumer-side path, and getting that path
 *      wrong failed silently.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import tailwindcss from '@tailwindcss/vite';
import { build } from 'vite';

const repo = process.cwd();

/**
 * Installed here so the package can load: its own dependencies plus the peers it
 * expects the app to supply. The heavy optional peers are deliberately absent —
 * that is what makes the barrel check meaningful.
 */
const CORE_DEPENDENCIES = [
  'react',
  'react-dom',
  'radix-ui',
  'cn',
  'class-variance-authority',
  'tw-animate-css',
  'lucide-react',
  'tailwindcss',
];

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'konopskidev-ui-'));
const consumer = path.join(root, 'consumer');
const installed = path.join(consumer, 'node_modules', '@konopskidev', 'ui');

function fail(message) {
  console.error(`\n✗ ${message}\n`);
  console.error(`  scratch directory kept for inspection: ${root}\n`);
  process.exit(1);
}

function install() {
  fs.mkdirSync(installed, { recursive: true });

  const tarball = execFileSync('npm', ['pack', '--silent', '--pack-destination', root], {
    cwd: repo,
    encoding: 'utf8',
  })
    .trim()
    .split('\n')
    .pop();

  execFileSync('tar', ['-xzf', path.join(root, tarball), '--strip-components=1', '-C', installed]);

  for (const name of CORE_DEPENDENCIES) {
    const from = fs.realpathSync(path.join(repo, 'node_modules', name));
    const to = path.join(consumer, 'node_modules', name);

    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.symlinkSync(from, to, 'dir');
  }
}

function run(file) {
  try {
    return execFileSync(process.execPath, [file], { cwd: consumer, encoding: 'utf8' }).trim();
  } catch (error) {
    fail(`${file} failed:\n${error.stdout ?? ''}${error.stderr ?? ''}`);
  }
}

function checkEsm() {
  fs.writeFileSync(
    path.join(consumer, 'esm.mjs'),
    `import assert from 'node:assert/strict';
import { Button, Card, CardTitle, Dialog, Table } from '@konopskidev/ui';
import { DialogContent } from '@konopskidev/ui/components/dialog';
import { cn } from '@konopskidev/ui/lib/utils';

assert.equal(typeof Button, 'function');
assert.equal(typeof Card, 'function');
assert.equal(typeof CardTitle, 'function');
assert.equal(typeof Dialog, 'function');
assert.equal(typeof Table, 'function');
assert.equal(typeof DialogContent, 'function');
assert.equal(cn('a', 'b'), 'a b');
console.log('esm: barrel + deep import resolve');
`,
  );

  console.log(run(path.join(consumer, 'esm.mjs')));
}

function checkCjs() {
  fs.writeFileSync(
    path.join(consumer, 'cjs.cjs'),
    `const assert = require('node:assert/strict');

const ui = require('@konopskidev/ui');
assert.equal(typeof ui.Button, 'function');
assert.equal(typeof ui.Card, 'function');
assert.equal(typeof ui.Dialog, 'function');
assert.equal(typeof ui.Table, 'function');
assert.equal(typeof require('@konopskidev/ui/components/button').Button, 'function');
assert.equal(typeof require('@konopskidev/ui/components/card').CardImage, 'function');
assert.equal(typeof require('@konopskidev/ui/lib/utils').cn, 'function');
assert.equal(typeof require('@konopskidev/ui/hooks/use-mobile').useIsMobile, 'function');

// A component whose peer is not installed stays out of the barrel…
assert.equal(ui.ChartContainer, undefined, 'chart must not be re-exported from the root');

// …and asks for that peer only when its deep import is used.
assert.throws(
  () => require('@konopskidev/ui/components/chart'),
  /recharts/,
  'the chart must report its missing optional peer',
);

console.log('cjs: require resolves without a transform');
`,
  );

  console.log(run(path.join(consumer, 'cjs.cjs')));
}

async function checkTailwind() {
  const entry = path.join(consumer, 'app.css');

  // No `@source`: the published stylesheet registers the package's own modules.
  fs.writeFileSync(entry, `@import 'tailwindcss';\n@import '@konopskidev/ui/styles.css';\n`);

  await build({
    root: consumer,
    configFile: false,
    logLevel: 'warn',
    plugins: [tailwindcss()],
    build: {
      outDir: path.join(consumer, 'css-out'),
      emptyOutDir: true,
      rollupOptions: { input: entry },
    },
  });

  const cssFile = fs
    .readdirSync(path.join(consumer, 'css-out', 'assets'))
    .find((file) => file.endsWith('.css'));

  if (!cssFile) fail('the Tailwind build emitted no stylesheet');

  const css = fs.readFileSync(path.join(consumer, 'css-out', 'assets', cssFile), 'utf8');

  // Used only by the components, never by this repository's own test stylesheet.
  const expected = ['z-\\[var\\(--z-index-modal\\)\\]', 'data-slot', 'rounded-sm'];

  for (const needle of expected) {
    if (!css.includes(needle)) {
      fail(`the consumer stylesheet is missing "${needle}" — the package @source is not working`);
    }
  }

  console.log('tailwind: consumer build picks up the components without its own @source');
}

install();
console.log(
  `packed and installed into ${path.join(consumer, 'node_modules', '@konopskidev', 'ui')}`,
);

checkEsm();
checkCjs();
await checkTailwind();

fs.rmSync(root, { recursive: true, force: true });
console.log('test-package: all checks passed');
