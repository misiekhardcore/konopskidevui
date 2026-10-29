#!/usr/bin/env node
/**
 * Rebuilds `src/index.ts` from the component directory.
 *
 * Run after `shadcn add` so a newly pulled component is importable from the
 * package root without hand-editing the barrel. Individual components stay
 * importable on their own either way.
 *
 * Components that need an optional peer are left out on purpose: if the barrel
 * re-exported them, `import { Button } from '@konopskidev/ui'` would make a
 * bundler resolve `recharts`, `vaul`, `shiki` and the rest for every consumer,
 * including the ones that never install them. They remain available at
 * `@konopskidev/ui/components/<name>`, which is also how the README documents
 * them.
 */
import { readdirSync, writeFileSync } from 'node:fs';

const UI_DIR = new URL('../src/components/ui/', import.meta.url);
const OUT = new URL('../src/index.ts', import.meta.url);

/** Component → the optional peer it needs. Mirrors the README table. */
const OPTIONAL_PEER_COMPONENTS = [
  'calendar', // react-day-picker
  'carousel', // embla-carousel-react
  'chart', // recharts
  'combobox', // @base-ui/react
  'command', // cmdk
  'drawer', // vaul
  'input-otp', // input-otp
  'message-scroller', // @shadcn/react
  'questionnaire', // @shadcn/react
  'resizable', // react-resizable-panels
  'sonner', // sonner
];

const names = readdirSync(UI_DIR)
  .filter((file) => file.endsWith('.tsx'))
  // Stories and tests live beside their component and are `.tsx` too; exporting
  // them from the package root would pull test files into the public entry.
  .filter((file) => !/\.(stories|test)\.tsx$/.test(file))
  .map((file) => file.replace(/\.tsx$/, ''))
  .filter((name) => !OPTIONAL_PEER_COMPONENTS.includes(name))
  .sort();

const header = `/**
 * @konopskidev/ui
 *
 * Every component is also importable on its own, e.g.
 * \`import { Button } from '@konopskidev/ui/components/button'\`,
 * which keeps a consumer bundle to what it actually uses.
 *
 * This barrel carries only what resolves with the core dependencies. A
 * component that needs a heavy, optional peer is deep-import only, so importing
 * \`Button\` from here never makes a bundler look for \`recharts\`. See the
 * "What each component needs" table in the README for the full mapping.
 */

`;

const body = names.map((name) => `export * from './components/ui/${name}';`).join('\n');

const tail = `

export * from './lib/utils';
export * from './lib/get-placeholder';
export * from './hooks/use-mobile';
`;

writeFileSync(OUT, header + body + tail);
console.log(
  `src/index.ts: ${names.length} component exports (${OPTIONAL_PEER_COMPONENTS.length} deep-import only).`,
);
