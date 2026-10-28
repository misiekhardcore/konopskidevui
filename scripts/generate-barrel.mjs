#!/usr/bin/env node
/**
 * Rebuilds `src/index.ts` from the component directory.
 *
 * Run after `shadcn add` so a newly pulled component is importable from the
 * package root without hand-editing the barrel. Individual components stay
 * importable on their own either way.
 */
import { readdirSync, writeFileSync } from 'node:fs';

const UI_DIR = new URL('../src/components/ui/', import.meta.url);
const OUT = new URL('../src/index.ts', import.meta.url);

const names = readdirSync(UI_DIR)
  .filter((file) => file.endsWith('.tsx'))
  .map((file) => file.replace(/\.tsx$/, ''))
  .sort();

const header = `/**
 * @konopskidev/ui
 *
 * Every component is also importable on its own, e.g.
 * \`import { Button } from '@konopskidev/ui/components/button'\`,
 * which keeps a consumer bundle to what it actually uses.
 */

`;

const body = names.map((name) => `export * from './components/ui/${name}';`).join('\n');

const tail = `

export * from './lib/utils';
export * from './lib/get-placeholder';
export * from './hooks/use-mobile';
`;

writeFileSync(OUT, header + body + tail);
console.log(`src/index.ts: ${names.length} component exports.`);
