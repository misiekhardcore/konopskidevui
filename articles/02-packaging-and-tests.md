# Turning it into a package: ESM output, declarations, two test suites

**Series:** Building `@konopskidev/ui` — Part 2 of 3
**Audience:** intermediate React and Tailwind engineer
**Reading time:** ~12 minutes

Part 1 ended with a stylesheet and sixty-three components that render correctly inside Storybook.
This part is about the distance between that and an installable package: the shape of the build
output, the type declarations, the export surface, the two test suites that prove the thing works,
and the checks that catch what the tests cannot.

One decision made early shaped everything else: **the package ships one ES module per source file,
not a bundle.** A page that imports `Card` should not download a chart library because both are
exported from the same barrel. That constraint cascades — through the build, through the
declarations, through the export map — so it is worth stating before the config.

## The build: preserve modules

Vite's library mode defaults to a single bundle. Turning on `preserveModules` changes it to one
output file per input module, which is what makes
`@konopskidev/ui/components/button` resolve to a small file instead of the whole library:

```ts
// vite.config.ts
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

/**
 * Rollup drops module-level directives when it rewrites a module body. Every
 * Radix-backed component in this package needs `'use client'` to survive the
 * build, otherwise a React Server Component tree cannot render it.
 */
function preserveDirectives(): Plugin {
  const clientModules = new Set<string>();

  return {
    name: 'konopskidev-preserve-directives',
    transform(code, id) {
      if (/^\s*['"]use client['"]/.test(code)) clientModules.add(id);
      return null;
    },
    renderChunk(code, chunk) {
      if (chunk.moduleIds.some((id) => clientModules.has(id))) {
        return { code: `'use client';\n${code}`, map: null };
      }
      return null;
    },
  };
}

export default defineConfig({
  plugins: [react(), preserveDirectives()],
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      external: (id) => id.includes('node_modules') || (!id.startsWith('.') && !id.startsWith('/')),
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
      },
    },
    sourcemap: true,
    minify: false,
    emptyOutDir: true,
  },
});
```

Three details deserve explanation, because each one is a bug I would otherwise have shipped.

**`'use client'` does not survive bundling on its own.** Rollup rewrites module bodies, and a
module-level directive is a module-body statement. The plugin records every module whose source
starts with the directive, then re-emits it at the top of any output chunk containing one of those
modules. It runs at chunk level rather than per module, which is a deliberate simplification: a
chunk that mixes a client component with a server-safe helper gets the directive too. For this
package that is acceptable — the components are overwhelmingly interactive — but it is the kind of
thing to revisit if the ratio changes.

**The `external` predicate is deliberately blunt.** Anything that looks like a bare specifier is
external. That keeps React, Radix and every dependency out of the output, and it means the runtime
dependencies must actually be declared in `package.json`, which they are. If a dependency were
missing there, the import would fail at runtime in the consumer instead of failing at build time
here.

**Output is unminified and has source maps.** A component library is not shipped to a browser as
one file; it is bundled by the consumer, who will minify it themselves. Shipping minified files
just makes the tarball harder to debug when something goes wrong in a stack trace.

## Declarations, and the `.js` that is not a typo

The JavaScript comes from Vite. The types come from `tsc`, in a second pass:

```json
// tsconfig.build.json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": false,
    "declaration": true,
    "emitDeclarationOnly": true,
    "declarationMap": true,
    "outDir": "dist",
    "rootDir": "src",
    "types": []
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "exclude": [
    "node_modules",
    "dist",
    "src/**/*.test.ts",
    "src/**/*.test.tsx",
    "src/**/*.stories.ts",
    "src/**/*.stories.tsx"
  ]
}
```

`rootDir: src` keeps the output layout aligned with the source, so `dist/components/ui/card.js`
sits next to `dist/components/ui/card.d.ts`. `declarationMap` means "go to definition" in an editor
lands in the TypeScript source rather than in a `.d.ts`.

Then there is a gap that catches nearly everyone who ships declarations from `tsc`. `tsc` copies
relative specifiers verbatim, so `card.d.ts` says:

```ts
export * from './button';
```

while `card.js` — built by Rollup — says:

```js
export * from './button.js';
```

With `moduleResolution: "bundler"` nobody notices. With `node16` or `nodenext`, which is what
Node's ESM resolver actually requires and what `arethetypeswrong` checks, `./button` is not a file
name and the declarations do not resolve. The fix is a post-build pass:

```js
// scripts/fix-declarations.mjs
function resolveExtension(fromFile, specifier) {
  if (!specifier.startsWith('.')) return specifier;
  if (/\.[cm]?jsx?$|\.json$|\.css/.test(specifier)) return specifier;

  const target = path.resolve(path.dirname(fromFile), specifier);
  const candidates = [`${target}.d.ts`, path.join(target, 'index.d.ts')];

  return candidates.some((candidate) => fs.existsSync(candidate)) ? `${specifier}.js` : specifier;
}
```

It walks `dist`, rewrites only relative specifiers that actually resolve to a declaration, and
reports how many files it touched. No plugin, no aliasing, about forty lines, and it is the
difference between a package that type-checks for a `node16` consumer and one that does not.

## The export surface

Two artifacts define what a consumer can import: a generated barrel and the `exports` map.

The barrel is generated, not maintained:

```js
// scripts/generate-barrel.mjs
const names = readdirSync(UI_DIR)
  .filter((file) => file.endsWith('.tsx'))
  .map((file) => file.replace(/\.tsx$/, ''))
  .sort();

const body = names.map((name) => `export * from './components/ui/${name}';`).join('\n');
```

Sixty-three exports, regenerated by `pnpm barrel` after every `shadcn add`. A hand-maintained
barrel drifts the first week nobody is looking; a generated one cannot.

The `exports` map is where the deep-import promise is kept:

```json
{
  "type": "module",
  "sideEffects": false,
  "files": ["dist", "src/styles", "README.md", "LICENSE"],
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" },
    "./components/*": {
      "types": "./dist/components/ui/*.d.ts",
      "import": "./dist/components/ui/*.js"
    },
    "./lib/*": { "types": "./dist/lib/*.d.ts", "import": "./dist/lib/*.js" },
    "./hooks/*": { "types": "./dist/hooks/*.d.ts", "import": "./dist/hooks/*.js" },
    "./styles.css": "./src/styles/globals.css",
    "./package.json": "./package.json"
  }
}
```

`./styles.css` points at the stylesheet in `src`, not in `dist`, because the file is meant to be
imported by Tailwind's CSS pipeline, not executed. `files` includes `src/styles` for the same
reason. `sideEffects: false` tells bundlers it is safe to drop any module whose exports are unused —
true here because nothing registers globals, but only true as long as `'use client'` modules are
treated as modules, not as side effects.

Deep imports are the reason for `preserveModules`:

```tsx
import { Button } from '@konopskidev/ui/components/button';
import { cn } from '@konopskidev/ui/lib/utils';
```

A docs site can import a `Dialog` in one route and not pay for `recharts` in the bundle of the
other fifty.

## Dependencies: what is a peer, what is a dependency

The dependency list is the part of a component library that most affects the consumer's install,
and it is where a library can quietly do damage.

React, React DOM and Tailwind are peers. The consumer's copies must be the ones in the tree, or
hooks break and utility classes get generated twice:
`react@^19`, `react-dom@^19`, `tailwindcss@^4`.

`lucide-react` is a peer too, and optional:

```json
"peerDependencies": {
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "tailwindcss": "^4.0.0",
  "lucide-react": ">=0.4 <2"
},
"peerDependenciesMeta": {
  "tailwindcss": { "optional": true },
  "lucide-react": { "optional": true }
}
```

It started as a normal dependency at a newer range than the app's pinned version, which meant a
consumer ended up with two copies of the icon library: two `XIcon` component definitions, two
`Loader2Icon`s, two of every icon either side imports. Icons are cheap individually and not cheap
in aggregate, and duplicate copies also defeat any bundle-size analysis. A wide peer range and an
optional flag lets the app keep its version, and lets an app that never renders a dialog skip the
library entirely.

The primitives are the consolidated `radix-ui` package rather than granular `@radix-ui/react-*`
packages. That is a deliberate ownership decision: the package owns the primitive layer, so a
consumer should not add their own `@radix-ui/react-dialog` alongside it. Two Radix trees in one
bundle is not a correctness bug, but it is duplicate code and two places to bump for a security
release. The rule belongs in the README more prominently than it currently is.

The rest of the dependencies are heavy on paper: `recharts`, `shiki`, `embla-carousel-react`,
`vaul`, `react-day-picker`, `react-resizable-panels`, `cmdk`, `sonner`, `date-fns`, `input-otp`.
Only the components that use them import them, and `sideEffects: false` plus per-module output
means a consumer who never imports `Chart` never downloads Recharts. The install is heavier than
the bundle, which is the trade-off I accepted for a library that is "all of shadcn, in this style"
rather than a curated subset.

## Two test suites, two jobs

There is no single test runner configuration that does both of these well, so
`vitest.config.ts` defines two projects.

The first is jsdom, for behaviour that is not visual: what element is rendered, which attributes it
carries, what happens on click, whether a ref forwards, how classes merge.

```ts
// vitest.config.ts
projects: [
  {
    extends: true,
    test: {
      name: 'unit',
      environment: 'jsdom',
      setupFiles: ['./vitest.setup.ts'],
      include: ['src/**/*.test.{ts,tsx}'],
    },
  },
  {
    // Every story is a test: it must render, and axe must pass.
    extends: true,
    plugins: [storybookTest({ configDir: fileURLToPath(new URL('./.storybook', import.meta.url)) })],
    test: {
      name: 'storybook',
      browser: {
        enabled: true,
        headless: true,
        provider: playwright(),
        instances: [{ browser: 'chromium' }],
      },
    },
  },
],
```

The jsdom project asserts against the contracts the library actually promises. `Button`'s suite is
a good example because it encodes decisions, not markup:

```tsx
// src/components/ui/button.test.tsx (excerpts)
it('defaults to type="button" so it never submits a form by accident', () => {
  render(<Button>Safe</Button>);
  expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
});

it('renders its child instead of a button when asChild is set', () => {
  render(
    <Button asChild>
      <a href="/articles">Read more</a>
    </Button>,
  );
  const link = screen.getByRole('link', { name: 'Read more' });
  expect(link).toHaveAttribute('href', '/articles');
  expect(link.className).toContain('rounded-sm');
});

it('merges a caller className over the variant classes', () => {
  render(<Button className="mt-4 px-10">Merged</Button>);
  expect(screen.getByRole('button').className).toContain('px-10');
  expect(screen.getByRole('button').className).not.toContain('px-4');
});
```

That last assertion is the one I would keep if I could keep only one. It is the only test that
proves `cn()` is applied after the variant classes, which is the rule every consumer depends on
when they pass a `className` and expect it to win.

jsdom is not a browser, and Radix needs APIs it does not ship. `vitest.setup.ts` is a small,
well-commented list of stand-ins:

| Missing API                           | Why Radix needs it                     |
| ------------------------------------- | -------------------------------------- |
| `window.matchMedia`                   | media-query-driven primitives, theming |
| `ResizeObserver`                      | popover and tooltip positioning        |
| `IntersectionObserver`                | carousel (embla) and command (cmdk)    |
| `Element.prototype.hasPointerCapture` | pointer-driven menus                   |
| `document.elementFromPoint`           | `input-otp`'s caret measurement        |
| `window.DOMRect`                      | chart and carousel measurement         |

The second project is Storybook itself, running in Chromium. Every story renders, every story gets
an axe pass, and `a11y: { test: 'error' }` in `preview.tsx` means a violation fails the run rather
than printing a warning nobody reads:

```tsx
// .storybook/preview.tsx
parameters: {
  a11y: { test: 'error' },
  controls: { expanded: true, sort: 'requiredFirst' },
},
```

This is the suite that catches the things jsdom cannot see: a focus ring that is invisible against
the surface, a dialog that does not trap focus, a contrast failure in dark mode. It needs a browser
binary, so CI installs one:

```bash
pnpm exec playwright install --with-deps chromium
```

Coverage is a ratchet, not a target:

```ts
// vitest.config.ts
thresholds: {
  lines: 65,
  functions: 60,
  statements: 65,
  branches: 50,
  'src/hooks/**': { lines: 90, functions: 75, statements: 90, branches: 85 },
  'src/lib/**': { lines: 70, functions: 50, statements: 70, branches: 90 },
},
```

The number sits where the suite is today. Adding a component without tests lowers the percentage
and fails the build, which is the behaviour I want: a ratchet that only turns one way. The
per-directory floors exist because `hooks` and `lib` are small, load-bearing and easy to test
properly, while sixty-three class-string-heavy components will never be worth 90%.

## Checking the tarball

Tests prove the code works in this repository. They do not prove the published artifact is
importable, and those are different claims.

```bash
publint
attw --pack . --profile esm-only --exclude-entrypoints ./styles.css
```

[publint](https://publint.dev) checks the `exports` map, the `files` list and the module format
against what the package actually contains — a `types` path that does not exist, an entry point
that resolves to nothing, a CJS consumer pointed at ESM.

[arethetypeswrong](https://arethetypeswrong.github.io) resolves the package as a consumer would,
under each module-resolution mode, and reports where the types and the runtime disagree. This is
the check that fails without the declaration rewrite from earlier: the JS resolves, the types do
not, and `attw` says so precisely. `--profile esm-only` is honest about the package being ESM-only;
`--exclude-entrypoints ./styles.css` skips the one export that is a CSS asset rather than a module,
which publint validates instead.

Both run against the packed tarball, not the working tree, which is why the command is `attw --pack
.` and why CI runs them after `pnpm build`.

## CI, in order

```yaml
# .github/workflows/ci.yml (steps)
- run: pnpm ci --frozen-lockfile
- run: pnpm lint
- run: pnpm format:check
- run: pnpm tsc
- run: pnpm test:coverage
- run: pnpm exec playwright install --with-deps chromium
- run: pnpm test:stories
- run: pnpm build
- run: pnpm verify:package
- run: pnpm build:storybook
```

The order is cheap-to-expensive. Lint and formatting fail in seconds; type-checking in under a
minute; the browser suite is the slow one and only runs once the cheap checks pass. The build comes
after the tests because the tests read source, and `verify:package` comes after the build because
it reads `dist`. Storybook's static build is last because it is only there to catch a docs
regression, not to gate correctness.

Two smaller things that save time later: `--frozen-lockfile` in CI means a lockfile that drifted
from `package.json` fails instead of silently resolving, and the pnpm version is pinned in the
workflow rather than in `package.json`, because pnpm 12 rewrites the lockfile to embed its own
binaries when `packageManager` is set — churn that would otherwise land in every release commit.

## What this buys, and what it costs

The package is now something a stranger can install and use correctly without reading the source:
deep imports keep bundles small, declarations resolve under every resolver, the tarball is checked
before it exists, and a component without a story fails CI.

The cost is a build pipeline with four moving parts — Vite, `tsc`, the declaration fixer, the
barrel generator — and each one exists because removing it breaks a specific consumer. That is a
reasonable trade for a library with sixty-three entry points. It would be over-engineering for
five.

Part 3 is about the part that has no local test: putting a version number on it, publishing it, and
finding out what a real application does to it.

---

**Previous:** [Part 1 — One palette, sixty-three components](./01-style-foundation.md)
**Next:** [Part 3 — Release on autopilot, and the ten gaps a real app found](./03-release-and-field-test.md)
**References:** [Vite library mode](https://vite.dev/guide/build#library-mode),
[arethetypeswrong](https://arethetypeswrong.github.io), [publint](https://publint.dev),
[Vitest browser mode](https://vitest.dev/guide/browser/), [Storybook](https://storybook.js.org)
