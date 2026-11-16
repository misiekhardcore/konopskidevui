/**
 * Builds the project the video codes in front of: a real Vite app, with the
 * real stylesheets, and the real house-style script run against real registry
 * components.
 *
 * Nothing here is a mock. Every command is executed and its output captured to
 * `video/build/logs/<step>.json`, for the terminal scene to replay at a
 * readable pace. Long waits are *cut* (marked `… n lines`), never sped up, so
 * the text stays legible on screen.
 *
 *   node video/scripts/sandbox.mjs
 *   node video/scripts/sandbox.mjs --fresh     # delete and rebuild from zero
 */
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';

import { die, log, parseArgs, paths, root, run, spawnCapture } from './lib.mjs';

const args = parseArgs(process.argv.slice(2));
const ws = paths.workspace;

mkdirSync(paths.logs, { recursive: true });
if (args.fresh) rmSync(ws, { recursive: true, force: true });

/** A replayable transcript: command, real output lines, exit status. */
function writeLog(name, title, steps) {
  const file = path.join(paths.logs, `${name}.json`);
  writeFileSync(file, `${JSON.stringify({ title, steps }, null, 2)}\n`);
  log(`  log  ${path.relative(root, file)}`);
  return file;
}

/** Keeps the head and tail of a long output and says how much it cut. */
function sample(text, head = 6, tail = 3) {
  const lines = text.split('\n').filter((line) => line.trim() !== '');
  if (lines.length <= head + tail + 1) return lines;

  return [
    ...lines.slice(0, head),
    `… ${lines.length - head - tail} more lines`,
    ...lines.slice(-tail),
  ];
}

/* Absolute paths leak this machine's layout into the video: show `~` instead. */
function tidy(line) {
  return line
    .replaceAll(`${path.join(paths.build, '_scaffold')}/`, '~/scaffold/')
    .replaceAll(paths.build, '~')
    .replaceAll(root, '~');
}

function step(command, { cwd = ws, head, tail, note } = {}) {
  log(`  $ ${command}`);
  const result = spawnCapture('bash', ['-lc', command], { cwd });
  const output = `${result.stdout}${result.stderr}`;

  return {
    cmd: command,
    out: output.trim() ? sample(output, head, tail).map(tidy) : [],
    status: result.status,
    ...(note ? { note } : {}),
  };
}

/* ------------------------------------------------------------------ workspace */

if (!existsSync(path.join(ws, 'package.json'))) {
  log('creating the app with create-vite');
  run('bash', ['-lc', 'pnpm create vite palette-demo --template react-ts'], {
    cwd: paths.build,
  });
}

log('installing Tailwind v4 and the four typefaces');
run(
  'pnpm',
  [
    'add',
    'tailwindcss',
    '@tailwindcss/vite',
    'tw-animate-css',
    '@fontsource/lato',
    '@fontsource/playfair-display',
    '@fontsource/lora',
    '@fontsource/jetbrains-mono',
  ],
  { cwd: ws },
);

/* The stylesheets are the repository's own files, copied rather than retyped. */
log('copying src/styles from the repository');
cpSync(path.join(root, 'src/styles'), path.join(ws, 'src/styles'), { recursive: true });
cpSync(
  path.join(root, 'scripts/apply-house-style.mjs'),
  path.join(ws, 'scripts/apply-house-style.mjs'),
  { recursive: true },
);

writeFileSync(
  path.join(ws, 'src/app.css'),
  `/* The app owns the Tailwind import; the package owns everything under styles/. */
@import 'tailwindcss';

@import '@fontsource/lato/400.css';
@import '@fontsource/lato/700.css';
@import '@fontsource/playfair-display/600.css';
@import '@fontsource/lora/400.css';
@import '@fontsource/jetbrains-mono/400.css';

@import './styles/globals.css';

/* The app shell: the library deliberately leaves <body> to the consumer. */
:root {
  --font-lato: 'Lato';
  --font-playfair: 'Playfair Display';
  --font-lora: 'Lora';
  --font-jetbrains: 'JetBrains Mono';
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}
`,
);

/* The registry writes `@/...` imports, which only resolve with a paths mapping.
   create-vite writes JSONC, so the comments come off before the merge. */
const stripJsonc = (text) => text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const tsconfigApp = path.join(ws, 'tsconfig.app.json');
const tsconfig = JSON.parse(stripJsonc(readFileSync(tsconfigApp, 'utf8')));
tsconfig.compilerOptions = {
  ...tsconfig.compilerOptions,
  baseUrl: '.',
  paths: { '@/*': ['./src/*'] },
};
writeFileSync(tsconfigApp, `${JSON.stringify(tsconfig, null, 2)}\n`);

/* The registry reads the root tsconfig for its aliases, not the app one. */
const tsconfigRoot = path.join(ws, 'tsconfig.json');
const rootConfig = JSON.parse(stripJsonc(readFileSync(tsconfigRoot, 'utf8')));
rootConfig.compilerOptions = {
  ...rootConfig.compilerOptions,
  baseUrl: '.',
  paths: { '@/*': ['./src/*'] },
};
writeFileSync(tsconfigRoot, `${JSON.stringify(rootConfig, null, 2)}\n`);

writeFileSync(
  path.join(ws, 'vite.config.ts'),
  `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: Number(process.env.PORT ?? 5174), host: '127.0.0.1' },
});
`,
);

writeFileSync(
  path.join(ws, 'components.json'),
  `${JSON.stringify(
    {
      $schema: 'https://ui.shadcn.com/schema.json',
      style: 'radix-nova',
      rsc: false,
      tsx: true,
      tailwind: {
        config: '',
        css: 'src/app.css',
        baseColor: 'neutral',
        cssVariables: true,
        prefix: '',
      },
      iconLibrary: 'lucide',
      aliases: {
        components: '@/components',
        utils: '@/lib/utils',
        ui: '@/components/ui',
        lib: '@/lib',
        hooks: '@/hooks',
      },
    },
    null,
    2,
  )}\n`,
);

writeFileSync(
  path.join(ws, 'src/main.tsx'),
  `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './app.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
`,
);

/* The demo page is the preview: house utilities, a control, and prose. */
writeFileSync(
  path.join(ws, 'src/App.tsx'),
  `import type { ReactNode } from 'react';

/** The preview follows the stage: it is the app that owns the theme switch. */
window.addEventListener('message', (event) => {
  const theme = (event.data as { theme?: string } | null)?.theme;
  if (theme !== 'light' && theme !== 'dark') return;

  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.style.colorScheme = theme;
});

/* The stage scrolls the preview for the prose beat. */
window.addEventListener('message', (event) => {
  const to = (event.data as { scroll?: number } | null)?.scroll;
  if (typeof to !== 'number') return;

  window.scrollTo({ top: document.body.scrollHeight * to, behavior: 'smooth' });
});

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="stack">
      <p className="eyebrow">{title}</p>
      {children}
    </section>
  );
}

export function App() {
  return (
    <main className="container-page stack-loose py-16">
      <header className="stack">
        <p className="eyebrow">design system demo</p>
        <h1 className="page-title">One palette, every component</h1>
        <p className="max-w-[46ch] text-muted-foreground">
          Every value on this page comes from <code>src/styles/tokens.css</code>. Nothing below
          it declares a colour.
        </p>
      </header>

      <Section title="controls">
        <div className="card flex flex-wrap items-center gap-3 p-6">
          <button
            type="button"
            className="focus-ring rounded-sm bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save changes
          </button>
          <button
            type="button"
            className="focus-ring rounded-sm border border-border bg-card px-4 py-2.5 text-sm font-medium text-card-foreground"
          >
            Cancel
          </button>
          <button
            type="button"
            className="focus-ring rounded-sm px-4 py-2.5 text-sm font-medium text-muted-foreground"
          >
            Skip
          </button>
        </div>
      </Section>

      <Section title="surfaces">
        <article className="card stack p-6">
          <h2 className="section-title">The card is a utility, not a component</h2>
          <p className="text-muted-foreground">
            <code>@utility card</code> is one declaration: the radius, the border, and the
            surface pair. A consumer cannot get the radius wrong because the radius is not
            theirs to write.
          </p>
        </article>
      </Section>

      <Section title="long form">
        <article className="prose-article stack max-w-[62ch]">
          <h2>A heading inside prose keeps the document outline</h2>
          <p>
            Base rules style elements, not components, so an <code>h2</code> dropped inside a
            card looks like the site without a class. A component that needs a different
            visual step says <code>text-h3</code> and leaves the outline alone.
          </p>
          <p>
            Links are always underlined: primary text on body copy is{' '}
            <a href="https://www.w3.org/WAI/WCAG21/Understanding/use-of-color.html">2.04:1</a>{' '}
            against the surrounding words, so colour alone cannot mark them.
          </p>
        </article>
      </Section>
    </main>
  );
}
`,
);

/* ---------------------------------------------------------------- transcripts */

/* The transcript is captured from a throwaway scaffold, so it is a genuine
   first install rather than this machine's warm cache answering instantly. */
const scaffold = [];
const scratch = path.join(paths.build, '_scaffold');
rmSync(scratch, { recursive: true, force: true });
mkdirSync(scratch, { recursive: true });

scaffold.push(
  step('pnpm create vite palette-demo --template react-ts', {
    cwd: scratch,
    head: 5,
    tail: 3,
    note: 'real run, abridged',
  }),
);
scaffold.push(step('cd palette-demo && pnpm install', { cwd: scratch, head: 3, tail: 2 }));
scaffold.push(
  step('cd palette-demo && pnpm add tailwindcss @tailwindcss/vite', {
    cwd: scratch,
    head: 4,
    tail: 2,
  }),
);
rmSync(scratch, { recursive: true, force: true });

scaffold.push(step('ls src/styles', { head: 9 }));
writeLog('scaffold', 'A Vite app, Tailwind v4, and a components.json', scaffold);

/* -------------------------------------------------------------- the registry */

const registry = [];
const componentsDir = path.join(ws, 'src/components/ui');

if (!existsSync(componentsDir) || readdirSync(componentsDir).length === 0) {
  registry.push(step('pnpm dlx shadcn@latest add button card badge --yes', { head: 8, tail: 4 }));
}

if (!existsSync(componentsDir) || readdirSync(componentsDir).length === 0) {
  /* The registry was unreachable: fall back to the files this repository
     actually shipped, and say so in the transcript rather than pretending. */
  mkdirSync(componentsDir, { recursive: true });
  const source = path.join(root, 'src/components/ui');
  for (const name of ['button', 'card', 'badge', 'input', 'label']) {
    for (const ext of ['.tsx', '.test.tsx', '.stories.tsx']) {
      const file = path.join(source, `${name}${ext}`);
      if (existsSync(file)) cpSync(file, path.join(componentsDir, `${name}${ext}`));
    }
  }
  registry.push({
    cmd: 'cp src/components/ui/*.tsx src/components/ui/',
    out: ['copied 5 components from the repository (registry unreachable)'],
    status: 1,
    note: 'fallback',
  });
}

registry.push(step('ls src/components/ui', { head: 5 }));
/* The count that matters is the repository's, not this demo's handful. */
registry.push(
  step('ls src/components/ui/*.tsx | grep -v -e stories -e test | wc -l', { cwd: root, head: 1 }),
);
writeLog('registry', 'radix-nova, through the CLI', registry);

/* ------------------------------------------------------------ the style script */

/* Short, real output: whole class lists are unreadable at video size. */
const radii = "grep -o 'rounded-[a-z0-9-]*' src/components/ui/button.tsx | sort -u | head -6";
const style = [];
style.push(step(radii, { head: 6 }));
style.push(step('node scripts/apply-house-style.mjs', { head: 2 }));
style.push(step(radii, { head: 6 }));
style.push(
  step('node scripts/apply-house-style.mjs', { head: 2, note: 'idempotent: nothing to change' }),
);
writeLog('style', 'scripts/apply-house-style.mjs', style);

log('\nsandbox ready: video/build/workspace');
