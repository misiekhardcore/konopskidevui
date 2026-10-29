# @konopskidev/ui

The konopskidev design system: every component the shadcn registry ships, rendered in the exact
visual language of the [konopskidev](../konopskidev) site, on Tailwind CSS v4 and React 19.

- **63 components** — the full `radix-nova` registry, plus the hand-written house primitives.
- **One style source** — tokens, theme, base layers and prose live in [`src/styles`](src/styles), so
  every app imports the same stylesheet instead of re-deriving the palette.
- **ESM and CommonJS** — both formats ship, with declarations for each, so `import`, `require` and a
  Jest suite all resolve the package without a transform.
- **Only what you install loads** — a component built on a heavy library (`recharts`, `shiki`,
  `vaul`, …) asks for it as an optional peer, and is never re-exported from the root barrel.
- **Documented in Storybook 10** with real controls for every prop, and every story runs as a test
  in a real browser (render + play function + axe accessibility checks).
- **Tested with Vitest** — behaviour in jsdom, markup and a11y in Chromium.

## Install

```bash
pnpm add @konopskidev/ui
```

Peer dependencies: `react@^19`, `react-dom@^19`, `tailwindcss@^4`, and `lucide-react` (optional).

Some components are built on a heavy library. Those are **optional peers**: they are not installed
with the package, and you add the one a component needs — the manual half of what `shadcn add` does
for a copied component.

| Component                                       | Install alongside                 |
| ----------------------------------------------- | --------------------------------- |
| `chart`                                         | `pnpm add recharts`               |
| `carousel`                                      | `pnpm add embla-carousel-react`   |
| `drawer`                                        | `pnpm add vaul`                   |
| `calendar`                                      | `pnpm add react-day-picker`       |
| `resizable`                                     | `pnpm add react-resizable-panels` |
| `command`                                       | `pnpm add cmdk`                   |
| `sonner`                                        | `pnpm add sonner`                 |
| `input-otp`                                     | `pnpm add input-otp`              |
| `combobox`                                      | `pnpm add @base-ui/react`         |
| `message-scroller`, `questionnaire`             | `pnpm add @shadcn/react`          |
| `lib/highlighter`, `hooks/use-highlighted-code` | `pnpm add shiki` (ESM only)       |

Those eleven components are **not** in the root barrel, because a barrel that re-exported them would
make every consumer resolve `recharts` on `import { Button } from '@konopskidev/ui'`. Import them
from their subpath:

```tsx
import { ChartContainer } from '@konopskidev/ui/components/chart';
```

> **Just released?** pnpm quarantines packages published in the last 24 hours. While you are the one
> publishing, add the package to `minimumReleaseAgeExclude` in `pnpm-workspace.yaml`.

## Wire up the styles

The package does **not** import `tailwindcss` itself — the app owns that, so its own `@theme`,
`@source` and `@utility` blocks keep working.

```css
/* app.css */
@import 'tailwindcss';
@import '@konopskidev/ui/styles.css';
```

No `@source` line is needed. Tailwind does not scan `node_modules`, so the published stylesheet
registers the package's own modules with `@source` — the path is relative to that file, so it cannot
drift from your install. Before that existed, a wrong consumer-side path failed silently: every
component rendered unstyled with no error in the build or the console.

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

Deep imports keep a page from pulling in the whole library, and they are the only way in for the
components in the peer table above:

```tsx
import { Button } from '@konopskidev/ui/components/button';
import { cn } from '@konopskidev/ui/lib/utils';
```

Every module that calls a hook, or wraps a primitive with no client boundary of its own, carries
`'use client'`, so it renders inside a React Server Component tree. Two kinds of module stay
unmarked on purpose:

- **`Slot`-only presentational components** — `Button`, `Card`, `Badge`, `Item`, `Breadcrumb` and the
  prose primitives. `Slot` is `asChild` plumbing with no behaviour, and Radix leaves it unmarked for
  the same reason. Because the directive is file-level, marking `button.tsx` would also make
  `buttonVariants` a client reference, and `buttonVariants()` from a server component would throw.
- **Thin wrappers over a dependency that declares the boundary itself** — `cmdk`, `sonner`,
  `react-resizable-panels`, `@shadcn/react`. The client graph already starts inside the dependency,
  so marking the wrapper only moves its own few lines into the client bundle.

A test enforces both directions and re-checks that every package in the second group still ships the
directive, so a new component cannot silently regress the rule:

```bash
pnpm test src/client-directive.test.ts
```

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
- **`CardImage` requires content.** The aspect box exists to frame media, so `children` is required
  rather than every call site guarding an empty frame.
- **`DialogContent` composes.** `variant="bare"` gives a full-viewport layer with no card chrome and
  no entrance animation (image viewers, canvases); `overlayClassName` reaches the backdrop,
  `showOverlay={false}` removes it, and `closeButton` takes `false` or your own element when the
  default ghost button would be unreadable. `DialogContentPrimitive` is exported for layouts the
  props cannot express.

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
pnpm test:package   # packs the tarball and consumes it, both formats + Tailwind
pnpm test:coverage
```

`pnpm test:stories` needs a browser: `pnpm exec playwright install chromium`.

`pnpm test:package` is the check the metadata validators cannot make: it `npm pack`s the package,
installs it into a scratch consumer with only React and Tailwind, then `import`s and `require`s it,
asserts the barrel resolves without any optional peer, and runs a Tailwind build to prove the shipped
stylesheet styles the components with no consumer configuration.

**Jest.** Because the package ships CommonJS alongside ESM, `require` resolves it directly: no
`moduleNameMapper`, no transform for the package, no `transformIgnorePatterns` exception. One
`moduleNameMapper` per export family (`components/*`, `lib/*`, `hooks/*`) is enough if you need to
point at the files explicitly.

Coverage thresholds are a ratchet — the floor sits where the suite is today (65 % overall, 90 % for
hooks, 70 % for lib), so a new component without tests fails the run instead of sliding past.

## Quality gates

```bash
pnpm verify         # lint → tsc → tests → build → package smoke test → publint + attw
```

The build is [`scripts/build.mjs`](scripts/build.mjs): every publishable source module is a Rollup
entry ([`scripts/entries.mjs`](scripts/entries.mjs)), so one file is emitted per module and nothing
that a wildcard export can reach is left out. Vite runs twice — ESM, then CommonJS — `tsc` writes the
declarations, and the post-steps copy `src/styles` into `dist/styles`, add the CommonJS `.d.cts`
declarations, and normalise relative specifiers so `moduleResolution: node16` consumers resolve them
([`scripts/fix-declarations.mjs`](scripts/fix-declarations.mjs)).

[`scripts/check-build.mjs`](scripts/check-build.mjs) then fails the build on any of the ways this
package has broken before: a module with declarations but no JavaScript, a `'use client'` that is
missing or duplicated, an `exports` target that does not exist, or a stylesheet that is not in `dist`.
`attw` runs with `--profile node16`, so both the `import` and `require` branches are validated;
`./styles.css` and the two ESM-only modules are excluded, and publint validates the stylesheet as a
plain asset.

## Adding a component

```bash
pnpm dlx shadcn@latest add <component>   # components.json is already configured
pnpm style                                # apply the house style
pnpm format
```

Then write `src/components/ui/<component>.stories.tsx` and `<component>.test.tsx`, export it from
`src/components/ui/<component>.tsx` and regenerate the barrel with `pnpm barrel`.

Two rules are enforced by tests rather than convention:

- **Client or server?** A module that calls a hook, or wraps a primitive that does not declare its
  own client boundary, needs `'use client'` as its first line; `pnpm test` fails both when it is
  missing and when it is unnecessary, and the build fails if the directive is emitted twice or not at
  all. `Slot`-only modules stay unmarked — see the client/server section above.
- **Heavy peer?** If the component needs a library the core does not already have, add it to
  `peerDependencies` + `peerDependenciesMeta` (optional) + `devDependencies` and to
  `OPTIONAL_PEER_COMPONENTS` in [`scripts/generate-barrel.mjs`](scripts/generate-barrel.mjs), so it
  stays out of the root barrel. Add the row to the install table above.

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
