# @konopskidev/ui

The konopskidev design system: every component the shadcn registry ships, rendered in the exact
visual language of the [konopskidev](../konopskidev) site, on Tailwind CSS v4 and React 19.

- **63 components** — the full `radix-nova` registry, plus the hand-written house primitives.
- **One style source** — tokens, theme, base layers and prose live in [`src/styles`](src/styles), so
  every app imports the same stylesheet instead of re-deriving the palette.
- **Documented in Storybook 10** with real controls for every prop, and every story runs as a test
  in a real browser (render + play function + axe accessibility checks).
- **Tested with Vitest** — behaviour in jsdom, markup and a11y in Chromium.

## Install

```bash
pnpm add @konopskidev/ui
```

Peer dependencies: `react@^19`, `react-dom@^19`, `tailwindcss@^4`.

## Wire up the styles

The package does **not** import `tailwindcss` itself — the app owns that, so its own `@theme`,
`@source` and `@utility` blocks keep working.

```css
/* app.css */
@import 'tailwindcss';
@import '@konopskidev/ui/styles.css';

/* Let Tailwind see the classes the components use. */
@source '../node_modules/@konopskidev/ui/dist';
```

Dark mode is the `.dark` class on any ancestor. The `--font-*` variables come from the app
(konopskidev sets them with `next/font`); every style has a sensible fallback.

## Use it

```tsx
import { Button, Card, CardContent, Dialog, DialogContent, DialogTitle } from '@konopskidev/ui';

export function PublishCard() {
  return (
    <Card>
      <CardContent>
        <Button variant="destructive">Publish</Button>
        <Dialog>
          <DialogContent>
            <DialogTitle>Confirm</DialogTitle>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
```

Deep imports keep a page from pulling in the whole library:

```tsx
import { Button } from '@konopskidev/ui/components/button';
import { cn } from '@konopskidev/ui/lib/utils';
```

Components that use hooks or state carry `'use client'`, so they render inside a React Server
Component tree.

## The style contract

The registry ships its own look (rounded-xl surfaces, ring borders, h-8 controls). Everything in
this package is normalised onto the house scale, and [`scripts/apply-house-style.mjs`](scripts/apply-house-style.mjs)
is the single place that says how:

| Registry                                 | konopskidev                       |
| ---------------------------------------- | --------------------------------- |
| `rounded-xl`, `rounded-lg`, `rounded-md` | `rounded-sm`                      |
| `rounded-t-xl`, `rounded-l-lg`, …        | `rounded-t-sm`, `rounded-l-sm`, … |
| `ring-1 ring-foreground/10` borders      | `border border-input`             |
| `h-8` controls                           | `h-10` controls                   |
| `rounded-[2px]`, `rounded-[4px]`         | `rounded-sm`                      |

It is idempotent — run `pnpm style` after pulling new registry components in, then `pnpm format`.

Conventions that are behaviour, not class strings:

- **Optional placeholders announce themselves.** `Input` and `Textarea` append ` (optional)` to a
  placeholder unless the field is `required` — see [`get-placeholder.ts`](src/lib/get-placeholder.ts).
- **Slider names live on the thumbs**, where focus goes; pass `thumbLabels` for ranges.
- **`Item` rows are list items** inside `ItemGroup`; with `asChild` the consumer's element keeps its
  own role.

## Storybook

```bash
pnpm dev            # storybook on http://localhost:6006
pnpm build:storybook
```

Every component has a `*.stories.tsx` with controls for each public prop, grouped by category
(Appearance / State / Behaviour / Accessibility / Styling), plus the compositions that are easy to
get wrong.

## Tests

```bash
pnpm test           # jsdom behaviour tests
pnpm test:stories   # every story rendered in Chromium, play functions + axe
pnpm test:coverage
```

`pnpm test:stories` needs a browser: `pnpm exec playwright install chromium`.

Coverage thresholds are a ratchet — the floor sits where the suite is today (65 % overall, 90 % for
hooks, 70 % for lib), so a new component without tests fails the run instead of sliding past.

## Quality gates

```bash
pnpm verify         # lint → tsc → tests → build → publint + attw
```

The build emits one ES module per source module (no barrel bundling), keeps `'use client'`, writes
per-module declaration files, and rewrites relative declaration specifiers to `.js` so
`moduleResolution: node16` consumers resolve them
([`scripts/fix-declarations.mjs`](scripts/fix-declarations.mjs)). `attw` runs with `--profile esm-only`
and skips `./styles.css`, which publint validates as a plain asset.

## Adding a component

```bash
pnpm dlx shadcn@latest add <component>   # components.json is already configured
pnpm style                                # apply the house style
pnpm format
```

Then write `src/components/ui/<component>.stories.tsx` and `<component>.test.tsx`, export it from
`src/components/ui/<component>.tsx` and regenerate the barrel with `pnpm barrel`.

## Releasing

Releases run from **Actions → Release → Run workflow**. The only choice is the bump — `patch`,
`minor` or `major` — applied to the version in `package.json`. There is no free-text version field,
so a release is always the next version in sequence.

In order, the workflow:

1. `pnpm version <bump> --no-git-tag-version` — rewrites `package.json` only, since the root version
   is not recorded in `pnpm-lock.yaml`.
2. `git-cliff --tag vX.Y.Z -o CHANGELOG.md` — regenerates the whole changelog from the tag history,
   labelling everything merged since the previous tag with the new version. This runs before the
   release commit exists, so a release never lists itself.
3. Commits `package.json` and `CHANGELOG.md`, tags `vX.Y.Z`, and pushes both to `main`.
4. `pnpm build` and `pnpm verify:package` — publint and attw gate the tarball before it can reach the
   registry.
5. `pnpm publish` with npm provenance, authenticated by trusted publishing (OIDC).
6. Creates the GitHub release from the generated notes — last, so a failed publish never leaves a
   release pointing at a version that is not on npm.

Ticking `dry_run` exercises steps 1–4 and prints the changelog plus the exact file list `npm pack`
would upload, without committing, tagging or publishing anything.

### One-time setup

`@konopskidev/ui` needs an npm organisation named `konopskidev`, and npm only exposes the trusted
publisher settings for a package that already exists. So the first publish is one of:

- create the organisation, publish `0.1.0` by hand, then add a trusted publisher on npmjs.com
  pointing at `misiekhardcore/konopskidevui` and the workflow file `release.yml`; or
- add a granular `NPM_TOKEN` repository secret and let the workflow do the first publish.

Every release after that needs no secrets. Provenance and trusted-publisher matching both key off
the `repository` field in `package.json`, which is why it is pinned to this repo.

### When a publish fails

npm versions are immutable, but the run has already pushed the tag. To retry the same version,
delete the tag, revert the `chore: release vX.Y.Z` commit on `main`, and dispatch the same bump
again. Otherwise accept the gap and dispatch the next bump.

## Licence

MIT.
