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
  symlinkSync,
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

/* Re-running sandbox must not re-resolve the same ten packages. */
if (!existsSync(path.join(ws, 'node_modules/tailwindcss'))) {
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
}

/* The library files are the repository's own, copied rather than retyped: the
   tour scenes open them, so an older registry pull here would be a different
   component than the one the narration describes. */
log('copying src/styles, src/components, src/lib and src/hooks from the repository');
cpSync(path.join(root, 'src/styles'), path.join(ws, 'src/styles'), { recursive: true });
for (const directory of ['components', 'lib', 'hooks']) {
  cpSync(path.join(root, 'src', directory), path.join(ws, 'src', directory), { recursive: true });
}
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

/*
 * Each transcript is captured in a throwaway copy, never in the demo app: a
 * capture is a real run of the real commands, and the demo has to survive it to
 * serve the next beat. The copies share the demo's `node_modules` through a
 * symlink, so a capture costs the network only where the video would too.
 */
const CAPTURE = path.join(paths.build, '_capture');

function captureCopy(name, { seed = true } = {}) {
  const copy = path.join(CAPTURE, name);
  rmSync(copy, { recursive: true, force: true });
  mkdirSync(copy, { recursive: true });

  if (seed) {
    cpSync(ws, copy, {
      recursive: true,
      filter: (entry) =>
        !['node_modules', 'dist', '.git', 'src/components/ui'].includes(path.basename(entry)),
    });
    mkdirSync(path.join(copy, 'src/components/ui'), { recursive: true });
    symlinkSync(path.join(ws, 'node_modules'), path.join(copy, 'node_modules'));
  }

  return copy;
}

/* The scaffold is a genuine first install in an empty directory, so the video
   shows create-vite's own output rather than this machine's warm cache. */
const scaffold = [];
const scratch = captureCopy('scaffold', { seed: false });

scaffold.push(
  /* `--no-interactive`: on a tty, create-vite asks about a linter, and the
     video is typed into a real tty. Off a tty it never asked. */
  step('pnpm create vite palette-demo --template react-ts --no-interactive', {
    cwd: scratch,
    head: 5,
    tail: 3,
    note: 'real run, abridged',
  }),
);
/* One shell in the video, so the `cd` is part of the transcript and everything
   after it runs from inside the app, exactly as it would on screen. */
const app = path.join(scratch, 'palette-demo');
scaffold.push(step('cd palette-demo', { cwd: scratch, head: 2 }));
scaffold.push(step('pnpm install', { cwd: app, head: 3, tail: 2 }));
scaffold.push(
  step('pnpm add tailwindcss @tailwindcss/vite', {
    cwd: app,
    head: 4,
    tail: 2,
  }),
);
writeLog('scaffold', 'An empty folder becomes a Vite app on Tailwind v4', scaffold);
rmSync(scratch, { recursive: true, force: true });

/* -------------------------------------------------------------- the registry */

const registry = [];
const registryApp = captureCopy('registry');
registry.push(
  step('pnpm dlx shadcn@latest add button card badge --yes', {
    cwd: registryApp,
    head: 6,
    tail: 4,
  }),
);
registry.push(step('ls src/components/ui', { cwd: registryApp, head: 8 }));
registry.push(
  step('ls src/components/ui/*.tsx | grep -v -e stories -e test | wc -l', {
    cwd: registryApp,
    head: 1,
  }),
);
writeLog('registry', 'radix-nova, through the CLI', registry);
rmSync(registryApp, { recursive: true, force: true });

/* ------------------------------------------------------------ the style script */

/* Short, real output: whole class lists are unreadable at video size. */
const radii = "grep -o 'rounded-[a-z0-9-]*' src/components/ui/button.tsx | sort -u | head -6";
const styleApp = captureCopy('style');
const style = [];
style.push(step(radii, { cwd: styleApp, head: 6 }));
style.push(step('node scripts/apply-house-style.mjs', { cwd: styleApp, head: 2 }));
style.push(step(radii, { cwd: styleApp, head: 6 }));
style.push(
  step('node scripts/apply-house-style.mjs', {
    cwd: styleApp,
    head: 2,
    note: 'idempotent: nothing to change',
  }),
);
writeLog('style', 'scripts/apply-house-style.mjs', style);
rmSync(styleApp, { recursive: true, force: true });
rmSync(CAPTURE, { recursive: true, force: true });

log(`\nsandbox ready: ${path.relative(root, ws)}`);
