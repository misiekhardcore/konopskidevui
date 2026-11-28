# 0001 — AI components ship as their own source family

- **Status:** Accepted
- **Date:** 2026-11-26

## Context

The library has one flat component family. Every module lives in `src/components/ui/`, is
published as `@konopskidev/ui/components/<name>` through the wildcard export
`"./components/*" → ./dist/components/ui/*`, and is re-exported from the generated root barrel
unless it needs an optional peer.

The work this plan covers is a set of components that render an AI SDK `UIMessage`: a tool call in
each of its states, an approval request, reasoning, citations, the part dispatcher. They differ from
the existing primitives on one axis that packaging cares about — they are meaningless without the
SDK's part shape, and the set will keep growing as that shape changes. A `Bubble` is useful to
anyone; a `Tool` is only useful to an app that has tool parts.

Three constraints decide the layout:

- An app that imports `Button` must never resolve `ai` or `@ai-sdk/react`. That is the same rule
  that keeps `recharts` out of the root barrel.
- The build emits one file per source module, with entries discovered by walking `src`
  (`scripts/entries.mjs`), and `scripts/check-build.mjs` fails when an `exports` target does not
  exist in `dist`.
- Every component is documented in Storybook, and `src/story-coverage.test.ts` enforces a stories
  file, a minimum number of stories and a Chromatic opt-in.

## Decision

1. **A second source family.** AI components live in `src/components/ai/`, one module per file, and
   are imported as `@konopskidev/ui/components/ai/<name>`. They are never re-exported from the root
   barrel.
2. **An explicit export family.** `package.json` gains its own entry rather than relying on the
   existing wildcard:

   ```json
   "./components/ai/*": {
     "import": {
       "types": "./dist/components/ai/*.d.ts",
       "default": "./dist/components/ai/*.js"
     },
     "require": {
       "types": "./dist/components/ai/*.d.cts",
       "default": "./dist/components/ai/*.cjs"
     }
   }
   ```

   This is mandatory, not cosmetic: `./components/*` maps its `*` to `dist/components/ui/*`, so
   `components/ai/tool` would resolve to `dist/components/ui/ai/tool`. Node picks the longest
   matching pattern, so the specific entry wins once it exists.

3. **The Storybook kind matches the family one to one.** A module in `components/ai/` is documented
   as `AI/<Name>`; a module in `components/ui/` stays `Components/<Name>`. No module appears in two
   groups.
4. **The family means "needs the AI SDK's part shape", not "used in a chat".** `Message`, `Bubble`,
   `MessageScroller`, `Trace` and `Marker` stay in `components/ui/` and under `Components/*`. No
   existing module moves, so no import path breaks and no consumer needs a major version.

## Consequences

**Free:**

- The build. `discoverEntries()` walks `src` recursively, so `dist/components/ai/*` is emitted for
  ESM and CJS with no change to `vite.config.ts` or `scripts/entries.mjs`.
- The root barrel. `scripts/generate-barrel.mjs` reads `src/components/ui` only, so exclusion is
  automatic.
- The `'use client'` contract. `src/client-directive.test.ts` walks all of `src` and covers the new
  family on day one.
- Styling. `src/styles/globals.css` registers `@source '../components'`, which already reaches the
  new directory, and `check-build` asserts that exact string.

**Paid:**

- `scripts/check-build.mjs` must learn the family. `checkExports` samples a wildcard export by
  looking up `samples[subpath.split('/')[1]]`, which is `components` for both families; for
  `./components/ai/*` it would substitute `button` and then look for
  `dist/components/ai/button.js`. The sample map has to key off the family segment instead.
- `src/story-coverage.test.ts` hardcodes `components/ui`. It must scan both families, or an AI
  module can ship with no stories and silently drop out of the visual suite.
- The README needs a row for the family in the install table and a sentence in "Adding a component"
  saying which family a new module belongs to.
- Two families can drift in conventions (story categories, doc voice). The story-coverage guard
  covers the enforceable part; the rest is review.

## Alternatives considered

- **A Storybook kind only, modules staying in `components/ui/`.** Rejected: the group would mean
  nothing outside Storybook, nothing would stop a future barrel from carrying an SDK-coupled module,
  and a consumer could not tell an AI component from a primitive.
- **Moving the chat primitives into the family.** Rejected: it breaks four published subpaths, needs
  a major version, and files modules with no SDK dependency under a family defined by that
  dependency.
- **One `@konopskidev/ui/ai` entry point for the whole suite.** Rejected: it loses per-module deep
  imports, which every other family provides, and makes tree-shaking the bundler's problem.
- **Modules move, old paths survive as re-export shims.** Rejected: two names for one module, and
  the shims would have to survive every future refactor and the publint/attw gate.

## Follow-ups for the implementation plan

- Add the `./components/ai/*` export family and update the `checkExports` sample map.
- Extend `story-coverage.test.ts` to both families.
- Add the README rows and the `generate-barrel.mjs` comment explaining why `ai` is not included.
- The first module to land is `tool`, per the inventory decision.
