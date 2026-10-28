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

## Licence

MIT.
