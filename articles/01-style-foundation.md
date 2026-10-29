# One palette, sixty-three components: building the style foundation

**Series:** Building `@konopskidev/ui` — Part 1 of 3
**Audience:** intermediate React and Tailwind engineer
**Reading time:** ~11 minutes

The site and the component library started with the same problem in opposite directions. The site
had a look I was happy with: a paper-white background, a deep blue primary, four typefaces doing
distinct jobs, one corner radius, borders instead of shadows. The library had sixty-three
components that needed to look like that, and no mechanism that would keep them looking like that
after the tenth pull request.

Copying a stylesheet into a package is easy. Keeping two copies in agreement is not. Every value I
duplicated was a value that could drift: a radius changed on the site, a colour tweaked for
contrast, a heading that reads one step larger in an article and one step smaller inside a card.
The interesting engineering in this project was not the components. It was making the palette a
single artifact that both the site and the package consume, and making the registry's visual
language get translated into mine mechanically instead of by memory.

This is how that layer was built. [Part 2](./02-packaging-and-tests.md) covers the build and
the tests; [Part 3](./03-release-and-field-test.md) covers releases and what a real app broke.

## What I skipped

Setting up the repository is ordinary work, so I will not walk through it. In short: a pnpm project
on Node 24, TypeScript in strict mode, Vitest, ESLint flat config with `eslint-plugin-import-x` for
import order, Prettier with `prettier-plugin-tailwindcss`, Storybook 10 on the Vite builder, and the
shadcn CLI pointed at the package's own stylesheet through `components.json`. The only unusual
choice in that list is Prettier's Tailwind plugin, which needs a stylesheet to know the class order
— and since the library deliberately does not import Tailwind itself, it is pointed at Storybook's
preview stylesheet, which does.

Everything below assumes that starting point.

## One colour, declared once

The token file is the contract. Every value in `src/styles/tokens.css` was copied from the site's
stylesheet verbatim, and the file opens with the three rules that keep it honest:

```css
/* src/styles/tokens.css
 *
 * 1. Values live unlayered so `.dark` can override them. Wrapping them in a
 *    layer would make the override lose against `@theme inline` utilities.
 * 2. Tokens are referenced, never redefined, by `theme.css`. A colour is
 *    declared exactly once, here.
 * 3. Dark mode is the `.dark` class on an ancestor (usually `<html>`), set by
 *    the consuming app.
 */

:root {
  --radius: 0.5rem;

  --background: #fbfbfa;
  --foreground: #1d2329;

  --primary: #1f4fa3;
  --primary-foreground: #ffffff;

  --success: #1f7a4d;
  --success-foreground: #ffffff;

  --destructive: #b4362f;
  --destructive-foreground: #ffffff;

  --border: #e1e4e7;
  --input: #d8dce0;
  --ring: #1f4fa3;
}

.dark {
  --background: #14181c;
  --foreground: #e6e9ec;

  --primary: #7aa7ee;
  --primary-foreground: #14181c;

  --success: #42be80;
  --success-foreground: #14181c;

  --destructive: #e07b73;
  --destructive-foreground: #14181c;

  --border: #2b333a;
  --input: #333c44;
  --ring: #7aa7ee;
}
```

Two details are load-bearing. The first is that the values are unlayered. Tailwind v4's `@layer`
ordering means a layered declaration loses to an unlayered one, so wrapping the palette in
`@layer base` would make `.dark` overrides lose against the utilities generated from `@theme
inline`. The second is that `.dark` is a plain class, not a media query: the app owns the theme
switch, and the library only has to respond to it.

The scale also carries the pieces a design system forgets it needs. There is a `--z-index-*` stack,
introduced because the site's dialog referenced `--z-index-modal` without it ever being defined,
which silently disabled its z-index. There is a syntax palette (`--tok-*`) shared by the code
blocks and the diff view, and the chart palette is derived from it by reference rather than
invented:

```css
/* One categorical colour language: a chart, a code block and a diff agree. */
--chart-1: var(--tok-keyword);
--chart-2: var(--tok-string);
--chart-3: var(--tok-number);
```

That is the whole point of a token file. It is not a list of colours. It is the set of decisions
that components are allowed to make without asking me again.

## Mapping tokens to utilities

`src/styles/theme.css` is the only place where a token becomes a class. It declares the dark
variant, the type scale, and a `--color-*` alias for every token:

```css
/* src/styles/theme.css */

/* `&:is(.dark *)` is the only form that matches every element inside `.dark`. */
@custom-variant dark (&:is(.dark *));

@theme inline {
  /* The app sets --font-*; the fallback matters outside next/font. */
  --font-sans: var(--font-lato, 'Lato'), ui-sans-serif, system-ui, sans-serif;
  --font-display: var(--font-playfair, 'Playfair Display'), ui-serif, Georgia, serif;
  --font-serif: var(--font-lora, 'Lora'), ui-serif, Georgia, serif;
  --font-mono: var(--font-jetbrains, 'JetBrains Mono'), ui-monospace, monospace;

  --text-h1: clamp(2rem, 4.8vw, 2.75rem);
  --text-h1--line-height: 1.12;
  --text-h2: 1.75rem;
  --text-h2--line-height: 1.2;

  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-success: var(--success);
  --color-success-foreground: var(--success-foreground);

  --radius-sm: calc(var(--radius) - 4px);
}
```

`inline` is the important word. With a plain `@theme` block, Tailwind would treat `--color-success:
var(--success)` as a variable defined once on `:root`; with `inline`, the `var(--success)`
reference is written into the utility itself, so the token is resolved where the class is used and
a `.dark` override on any ancestor wins without the theme file knowing dark mode exists. It is the
difference between "the palette is copied into the theme" and "the theme points at the palette".

The same block owns the type scale, including line heights. That is not decoration: heading sizes
live in exactly one place, and both the base element rules and the `text-h*` utilities read them.
I do not have to remember that an `h2` is 1.75rem in three files.

## Base rules, a utility vocabulary, and prose

The rest of the stylesheet splits into three files with different jobs, which keeps each one small
enough to reason about.

`base.css` styles elements, not components. Its job is that no semantic tag can be unstyled or
out of scale:

```css
/* src/styles/base.css */
@layer base {
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    @apply font-display font-semibold tracking-tight;
  }

  h1 {
    @apply text-h1;
  }
  /* …through h6 */

  *:focus-visible {
    @apply focus-ring;
  }

  img {
    @apply block h-auto max-w-full;
  }
}
```

The heading block is what makes composition safe. A consumer can write `<h2>` inside a card and get
the site's display face and the site's `h2` step for free. When a component needs a different
visual step than its semantic level — a card title that should read as `h3` while remaining
whatever element the page needs — it overrides with `text-h3` and the semantic level stays the
page's business. That split, visual step versus document outline, is the thing that later saved the
article cards from losing a heading level in Part 3.

`utilities.css` holds the house vocabulary: `card`, `focus-ring`, `container-page`,
`container-prose`, `stack`, `eyebrow`, `page-title`. These exist because the site was already
written in them. Shipping them with the components means a consumer does not reinvent "the card"
with four utility classes and get the radius wrong:

```css
/* src/styles/utilities.css */
@utility card {
  @apply rounded-sm border border-border bg-card text-card-foreground;
}

/* An outline, not a ring: it sits outside the box and never shifts layout. */
@utility focus-ring {
  @apply focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring;
}

@utility eyebrow {
  @apply font-sans text-xs font-medium tracking-[0.08em] text-muted-foreground uppercase;
}
```

`prose.css` is the exception that proves the rule. Long-form typography needs descendant
selectors — every paragraph inside an article, every list item, every table cell — so it is a
component class (`.prose-article`) rather than a set of utilities. It also sets its own
`font-serif`, unlike the site, where `<body>` supplied it: a library cannot assume anything about
the app shell around it. And its links are always underlined, because `--primary` on body copy is
about 2:1 against the surrounding text and colour alone cannot mark a link (WCAG 1.4.1).

> **Image placeholder — “The token pipeline”**
> A simple three-box diagram: `tokens.css` (raw values, light + dark) → `theme.css`
> (`@theme inline` mapping) → `base.css` / `utilities.css` / `prose.css` (element rules, house
> utilities, long-form). Export at 1600×600, transparent background, the site's blue `#1f4fa3` for
> arrows. One caption line: “A colour is declared once, mapped once, used anywhere.”

## Pulling sixty-three components from the registry

I did not write sixty-three components. I pulled the `radix-nova` registry through the shadcn CLI and
made the result mine. `components.json` is the whole configuration:

```json
{
  "style": "radix-nova",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "css": "src/styles/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

```bash
pnpm dlx shadcn@latest add dialog
```

Two things break immediately, and both are predictable.

The first is the aliases. The registry writes `import { Button } from "@/components/ui/button"`,
which works in an app with a `paths` mapping and not at all in a published package, whose
declarations have to resolve from `dist/`. Every generated file has to be rewritten to relative
specifiers before it can be built.

The second is the visual language. The registry ships a coherent look of its own: `rounded-xl`
surfaces, `ring-1 ring-foreground/10` borders, focus rings that shift the layout, `h-8` controls,
small drop shadows. None of that is wrong; it is just not mine. Left alone, the package would look
like shadcn with a blue primary, which is exactly the "two design languages" problem I was trying
to avoid.

## The style contract as a script

Translating class strings by hand across sixty-three files is a task you do once and then stop
doing, which is how drift starts. So the mechanical half of the translation is a script:
[`scripts/apply-house-style.mjs`](https://github.com/misiekhardcore/konopskidevui/blob/main/scripts/apply-house-style.mjs).

```js
/* scripts/apply-house-style.mjs — ordered: directional radii first, so
   `rounded-t-xl` is not caught by `rounded-xl`. */
const RULES = [
  // Imports: the package ships relative specifiers, not the @/ alias.
  { find: /from "@\/components\/ui\/([a-z0-9-]+)"/g, replace: 'from "./$1"' },
  { find: /from "@\/hooks\/([a-z0-9-]+)"/g, replace: 'from "../../hooks/$1"' },

  // Radius: one step, everywhere. konopskidev has exactly one corner radius.
  { find: /rounded-(t|b|l|r|tl|tr|bl|br)-(xl|lg|md)/g, replace: 'rounded-$1-sm' },
  { find: /rounded-\[(?:2|4|6)px\]/g, replace: 'rounded-sm' },
  { find: /rounded-(xl|lg|md)/g, replace: 'rounded-sm' },

  // Focus: an outline via the `focus-ring` utility, never a ring.
  { find: /focus-visible:ring-\d+ focus-visible:ring-ring\/\d+/g, replace: 'focus-ring' },
  { find: /focus-visible:ring-destructive\/\d+/g, replace: 'focus-visible:outline-destructive' },

  // Depth: borders instead of shadows, one shadow for floating surfaces.
  { find: /\bshadow-(?:xs|sm|md)\b/g, replace: '' },
  { find: /\bshadow-xl\b/g, replace: 'shadow-lg' },

  // Ring borders on surfaces become real borders.
  { find: /ring-1 ring-foreground\/\d+/g, replace: 'border border-border' },

  // Controls are 16px, not responsive 16→14px.
  { find: /\btext-base md:text-sm\b/g, replace: 'text-sm' },

  // House rule: buttons are clickable, disabled controls are not.
  {
    find: /disabled:pointer-events-none disabled:opacity-50/g,
    replace: 'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
  },
];
```

The rules are ordered, and the order is the tricky part. Directional radii (`rounded-t-xl`) have to
be rewritten before the generic `rounded-xl`, or the left side of the first regex matches the
second. After the substitutions, a whitespace pass collapses the double spaces the removals leave
inside string literals — but only inside double-quoted strings, so indentation survives.

The script is idempotent. Running it twice changes nothing, which means it can run on every pull,
after every `shadcn add`, without a diff to review. It produces the mechanical translation:

| Registry                                 | konopskidev                       |
| ---------------------------------------- | --------------------------------- |
| `rounded-xl`, `rounded-lg`, `rounded-md` | `rounded-sm`                      |
| `rounded-t-xl`, `rounded-l-lg`, …        | `rounded-t-sm`, `rounded-l-sm`, … |
| `ring-1 ring-foreground/10` borders      | `border border-input`             |
| `h-8` controls                           | `h-10` controls                   |
| `rounded-[2px]`, `rounded-[4px]`         | `rounded-sm`                      |

And the rest is handwritten, deliberately. Surface composition, control heights, and the
konopskidev-only props need judgement, and a regex that tries to make judgement calls is a regex
that eventually mangles a component nobody was looking at. The split is the point: automate what
has one correct answer, review what does not.

## Conventions that are behaviour, not class strings

After the script runs, the components still have to agree on a few things that a class list cannot
express.

**Every part carries a `data-slot`.** The wrapper, the header, the title, the footer: each one is
addressable from CSS and from a test without depending on class names that change with the design.

**`cn()` is always last.** Class merging is right-to-left, so the caller's `className` wins over the
variant's:

```tsx
/* src/components/ui/button.tsx */
const Comp = asChild ? Slot.Root : 'button';

return (
  <Comp
    data-slot="button"
    data-variant={variant}
    data-size={size}
    type={type}
    className={cn(buttonVariants({ variant, size }), className)}
    {...props}
  />
);
```

**`asChild` is the escape hatch.** When a button needs to be an anchor — a card CTA, a link that
looks like a control — `Slot.Root` merges the styles onto the child instead of nesting an
interactive element inside another. The library uses the same pattern for `CardTitle` and `Badge`,
because the alternative is a `div` where a heading belongs.

**House props sit on top of upstream, never instead of it.** `Button` keeps every shadcn variant
and adds `primary`, `ghost-primary`, `ghost-destructive` and the `icon-*` sizes. Sizing is
padding-based rather than fixed-height, so the default button lines up with the 40px `Input`
instead of matching a number in two places.

**Some conventions are pure behaviour.** `Input` appends `(optional)` to a placeholder unless the
field is required, so a form never has to say it twice:

```ts
/* src/lib/get-placeholder.ts */
export function getPlaceholder(placeholder?: string, required?: boolean) {
  if (!placeholder || required) return placeholder;

  return `${placeholder} (optional)`;
}
```

`useIsMobile` is a `useSyncExternalStore` subscription with a server snapshot, not a resize
listener with `useState`, because a `useState` version renders the desktop layout first and then
snaps on hydration:

```ts
/* src/hooks/use-mobile.ts */
const MOBILE_BREAKPOINT = 768;
const QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}

export function useIsMobile() {
  return React.useSyncExternalStore(
    subscribe,
    () => window.innerWidth < MOBILE_BREAKPOINT,
    () => false,
  );
}
```

And `CardImage` owns the aspect box, not the image. It is a `div` with `aspect-video` and
`overflow-hidden` that takes children, so a Next app can pass `next/image` and a Vite app can pass
an `<img>`; the package never imports a framework-specific image component. That decision looked
obvious in hindsight and took a detour to reach, which Part 3 describes.

## Storybook as the design surface

Storybook is where the design system is actually reviewed. That only works if its stylesheet is
compiled the way a consumer compiles it, so the preview CSS imports Tailwind first and the package
stylesheet second, exactly like an app would:

```css
/* .storybook/preview.css */
@import 'tailwindcss';
@import '../src/styles/globals.css';

/* Storybook is the app shell: it supplies the <body> the library leaves to apps. */
body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}
```

The four typefaces come from `@fontsource` as dev dependencies, because consuming apps bring their
own fonts. Dark mode is a class on `<html>`, applied by the themes addon, so the
`&:is(.dark *)` variant sees the same ancestor an app would provide.

The one non-default setting that mattered was docgen:

```ts
/* .storybook/main.ts */
typescript: {
  // react-docgen cannot see through class-variance-authority, so variant
  // unions would degrade to `string`. The TypeScript-based docgen reads the
  // real prop types, which is what makes the Controls panel accurate.
  reactDocgen: 'react-docgen-typescript',
  reactDocgenTypescriptOptions: {
    shouldExtractLiteralValuesFromEnum: true,
    savePropValueAsString: true,
    propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
  },
},
```

Without it, every CVA component shows `variant: string` and the Controls panel is a text box. With
it, `variant` is a select with nine options, which is the difference between documentation and a
prop list. Stories group their controls by category — Appearance, State, Behaviour, Accessibility,
Styling — and every story doubles as a rendering test in Part 2.

> **Image placeholder — “Storybook, light and dark”**
> A two-up screenshot of the same component page (Card or Button) in light and dark theme, captured
> from `pnpm dev` at `http://localhost:6006`. Show the sidebar with the component groups on the
> left and the Controls panel on the right. 1600×900 each, placed side by side in the post.

> **Image placeholder — “Controls that know the variants”**
> Close crop of the Storybook Controls panel for `Badge`, with the `variant` select open showing
> `default / secondary / destructive / outline / ghost / tag / link`. This is the visual proof that
> `react-docgen-typescript` is doing its job. 1200×800.

## What the layer buys

Three things, and they are the reason the rest of the project went quickly.

A colour is declared once, in one file, for both themes. A heading is styled once, and a component
that needs a different visual step says so without breaking the document outline. A component
pulled from the registry gets translated by a script that has one correct answer per rule, and the
parts that need judgement are small enough to review in a pull request.

The palette is the product. Everything else — the build, the tests, the release workflow — exists
to deliver this file and the components that read it. Part 2 is about that delivery.

---

**Next:** [Part 2 — Turning it into a package: ESM output, declarations, two test suites](./02-packaging-and-tests.md)
**Repository:** [misiekhardcore/konopskidevui](https://github.com/misiekhardcore/konopskidevui)
**References:** [Tailwind v4 theme variables](https://tailwindcss.com/docs/theme),
[custom variants](https://tailwindcss.com/docs/adding-custom-styles#adding-custom-variants),
[shadcn registry](https://ui.shadcn.com/docs/registry), [Radix Slot](https://www.radix-ui.com/primitives/docs/utilities/slot)
