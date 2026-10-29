# Release on autopilot — and the ten gaps a real app found

**Series:** Building `@konopskidev/ui` — Part 3 of 3
**Audience:** intermediate React and Tailwind engineer
**Reading time:** ~11 minutes

A component library has two moments of truth. The first is the first `pnpm add` from a repository
that is not its own. The second is the first time a real application uses it in anger.

This part covers both: the release workflow that turns a green `main` into a provenance-signed
tarball without anyone typing a version number, and the afternoon I spent swapping a hand-written
design system for the package in the site it came from — which found ten gaps in about four hours.

The gaps are the more useful half. A library tested only inside its own Storybook is a library
tested in the environment it was designed for.

## The version is a bump, never a string

The first decision is that releasing is not a local ritual. There is no `npm version` in a terminal,
no hand-edited `package.json`, no "what was the last tag?" moment. There is one workflow with two
inputs:

```yaml
# .github/workflows/release.yml
on:
  workflow_dispatch:
    inputs:
      version_bump:
        description: 'Version bump type'
        required: true
        type: choice
        default: patch
        options:
          - patch
          - minor
          - major
      dry_run:
        description: 'Build, verify and preview the changelog without tagging or publishing'
        required: false
        type: boolean
        default: false
```

A free-text version field is a trap. It lets a release go backwards, skip a number, or reuse one
that already exists on npm — where versions are immutable and the mistake cannot be undone. A bump
enum makes the next version a function of the current one, and the only remaining decision is how
much changed.

The workflow also needs permissions that the default token does not have, and a concurrency group
because two releases must never interleave:

```yaml
permissions:
  contents: write
  id-token: write

concurrency:
  group: release
  cancel-in-progress: false
```

`id-token: write` is what mints the OIDC token npm trusted publishing uses. `cancel-in-progress:
false` is the difference between a queued second release and a second release that bumps an
already-bumped version and pushes a tag the first run is still creating.

One guard is worth calling out because it is a git problem rather than a CI problem: the dispatch
form lets you choose a branch, and releasing from anything but the default branch would tag and
publish a commit `main` never saw. The workflow refuses, except for dry runs, which are allowed
anywhere so the workflow can be exercised from a pull request branch.

## Ordering is the design

The steps are arranged so that nothing irreversible happens before everything verifiable has
happened. In order:

1. Bump `package.json`, without a commit or a tag.
2. Generate the changelog and the release notes.
3. Commit, tag, push both.
4. Build, then verify the tarball.
5. Publish.
6. Create the GitHub release.

Two of those steps have a reason that is easy to miss.

**The changelog is generated before the release commit exists.** `git-cliff` labels everything
since the previous tag with the new version, so if the notes were generated after the commit, every
release would list its own `chore: release vX.Y.Z` commit. Generating first means the notes describe
the changes, not the ceremony:

```yaml
- name: Bump the version
  id: version
  run: |
    pnpm version "${{ inputs.version_bump }}" --no-git-tag-version
    VERSION=$(node -p "require('./package.json').version")
    echo "version=$VERSION" >> "$GITHUB_OUTPUT"

- name: Generate the changelog
  uses: orhun/git-cliff-action@v4
  with:
    config: cliff.toml
    args: --verbose --tag "v${{ steps.version.outputs.version }}"

- name: Render the release notes
  uses: orhun/git-cliff-action@v4
  with:
    config: cliff.toml
    args: --tag "v${{ steps.version.outputs.version }}" --unreleased --strip header
  env:
    OUTPUT: .release-notes.md
```

`pnpm version --no-git-tag-version` rewrites `package.json` only. The root version is not recorded
in `pnpm-lock.yaml`, so there is no lockfile churn to commit — which is why the commit can happen
later, once the changelog for that version exists.

**The GitHub release is last.** If the publish fails, a release pointing at a version that is not
on the registry is worse than no release at all, because it is the thing people click. Creating it
after `pnpm publish` means a failed publish leaves a red run and nothing else.

The changelog configuration is small but opinionated:

```toml
# cliff.toml
[git]
conventional_commits = true
# Unconventional subjects are still worth recording; the catch-all parser below
# files them under "Other" instead of dropping them.
filter_unconventional = false
commit_parsers = [
  { message = "^feat", group = "Features" },
  { message = "^fix", group = "Bug Fixes" },
  { message = "^refactor", group = "Refactoring" },
  { message = "^docs", group = "Documentation" },
  { message = "^chore", group = "Chores" },
  { message = ".*", group = "Other" },
]
sort_commits = "oldest"

[remote.github]
owner = "misiekhardcore"
repo = "konopskidevui"
```

`filter_unconventional = false` with a catch-all parser is deliberate. The alternative — dropping
anything that is not a conventional commit — produces a changelog that silently omits real work,
which is worse than a slightly untidy "Other" section. The GitHub remote block adds PR numbers and
links, because a changelog entry without a link is a rumour.

## Publishing with OIDC, not a token

The publish step uses npm trusted publishing. There is no `NPM_TOKEN` secret in the steady state;
GitHub mints an OIDC token, npm verifies that the workflow, repository and branch match the trusted
publisher configured on the package, and the publish is authorised:

```yaml
- name: Publish to npm
  run: |
    # Trusted publishing (OIDC) is the default and needs no secret. A granular
    # NPM_TOKEN is the fallback for the first publish, before a trusted
    # publisher for this workflow exists on npmjs.com.
    if [ -n "${NODE_AUTH_TOKEN:-}" ]; then
      echo "//registry.npmjs.org/:_authToken=${NODE_AUTH_TOKEN}" >> "$HOME/.npmrc"
    fi
    pnpm publish --access public --provenance --no-git-checks
  env:
    NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

`--provenance` attaches a signed statement that this tarball was built from this commit in this
repository by this workflow. It is the difference between "a package called `@konopskidev/ui`
exists" and "this package was built from `misiekhardcore/konopskidevui` at `v0.1.2`". Provenance
matching keys off the `repository` field in `package.json`, which is why that field is pinned
rather than filled in by the publisher.

The one-time bootstrap is the awkward part, and there is no clever way around it: npm only exposes
trusted-publisher settings for a package that already exists. So the first release is either a
manual `0.1.0` followed by configuring the trusted publisher, or a granular `NPM_TOKEN` secret used
once and then deleted. Every release after that needs no secret at all.

## Dry runs and the failure mode nobody plans for

`dry_run` exists because "trust me, the workflow is right" is not a testing strategy. With it on,
the workflow bumps the version in the workspace, generates the changelog and notes, builds,
verifies the tarball, and prints the file list `npm pack` would upload — then exits without
committing, tagging, publishing or releasing.

The failure mode worth writing down is a publish that fails after the tag is pushed. npm versions
are immutable, so the version that failed cannot be reused. Two options, both manual: delete the
tag and revert the release commit on `main`, then dispatch the same bump again; or accept the gap
and dispatch the next bump. The workflow cannot do this for you, and pretending otherwise would be
worse than a documented manual step.

> **Image placeholder — “Release dispatch form”**
> Screenshot of GitHub's _Run workflow_ panel for `release.yml`, showing the branch selector, the
> `version_bump` dropdown open on `patch | minor | major`, and the `dry_run` checkbox. 1200×700.

## The field test

Then the package went into the site it came from. Not a toy integration — the real thing: article
pages, project lists, topic grids, a contact form, prose tables rendered from CMS content.

The swap took an afternoon and produced ten gaps. Three were blockers: the package could not be
adopted without regressing something visible. The rest were packaging and quality items that only
show up when a consumer with different constraints installs the thing.

| #   | Gap                                                         | Resolution                                             |
| --- | ----------------------------------------------------------- | ------------------------------------------------------ |
| U1  | `--success` token declared nowhere                          | Added to `tokens.css` + `theme.css`                    |
| U2  | `CardTitle` renders a `div`, losing heading levels          | `asChild` via `Slot.Root`                              |
| U3  | `CardImage` cannot use `next/image`                         | Children-based aspect box                              |
| U4  | `Badge` has no variant matching the house tag               | `tag` variant added                                    |
| U5  | `TableCell` is `whitespace-nowrap`, breaking prose tables   | Nowrap kept on `TableHead` only                        |
| U6  | `lucide-react` is a hard dependency at a different range    | Optional peer, `>=0.4 <2`                              |
| U7  | Consolidated `radix-ui` alongside granular Radix packages   | Documented as a consumer rule                          |
| U8  | Install surface includes recharts, shiki, embla, vaul, …    | Per-module output makes it safe; optional peers remain |
| U9  | Doubled `'use client'` and a stray `import 'react'` in dist | Directive removed where unnecessary                    |
| U10 | `@source` recipe is app-root relative, not file relative    | Documented with the caveat                             |

Four of them are worth walking through, because each one is a category of mistake rather than a
one-off.

### U1: a token that was never declared

The contact form renders a success message with `text-success`. The site had `--success`; the
package did not. In Tailwind v4, a utility whose theme variable does not exist is simply not
generated — no error, no warning, no fallback. The message rendered in inherited body colour, which
looked almost right and was therefore easy to miss.

```css
/* src/styles/tokens.css */
:root {
  --success: #1f7a4d;
  --success-foreground: #ffffff;
}

.dark {
  --success: #42be80;
  --success-foreground: #14181c;
}
```

```css
/* src/styles/theme.css */
@theme inline {
  --color-success: var(--success);
  --color-success-foreground: var(--success-foreground);
}
```

The fix is four lines. The lesson is not: a token that exists in one copy of a design system and not
the other is invisible until a component asks for it. The durable fix is a test that asserts every
`--color-*` the components reference has a value in both themes, so a missing token fails CI instead
of a contact form.

### U2: the card title that was not a heading

On the articles page, every card title is the only heading inside a list item. The package rendered
`CardTitle` as a `<div>`, which meant the page had no heading outline at all for a screen reader
user navigating by heading — and nothing for a search engine to anchor on.

`asChild` is the right shape for this because the visual style and the semantic level are separate
decisions. The page decides the level; the component supplies the type step:

```tsx
<CardTitle asChild>
  <h2>{article.title}</h2>
</CardTitle>
```

```tsx
/* src/components/ui/card.tsx */
const Comp = asChild ? Slot.Root : 'div';

return (
  <Comp
    data-slot="card-title"
    className={cn('font-display text-h3 font-semibold tracking-tight', className)}
    {...props}
  />
);
```

The default stays a `div` for compatibility, but the option exists, and the consuming app uses it
everywhere a card is a list item.

### U3: the image that could not be optimised

This one deserves the most detail, because my first fix was wrong.

The package's `CardImage` was a plain `<img loading="lazy">` and its props were image props, so
there was no supported way to pass `next/image`. Adopting it as-is would have silently dropped
responsive `srcset`, WebP negotiation and `sizes` from every card on the home, articles, projects
and topics pages — a performance regression that no test would catch.

My first patch added an `imageComponent` prop:

```tsx
// The first attempt — do not ship this.
<CardImage src={cover} alt="" imageComponent={Image} className="object-cover" />
```

It worked, and it was the wrong abstraction. The prop forced the package to know which props a
framework image accepts (`fill`, `sizes`, `priority`), to pass `fill` through correctly, and to
guess what `className` meant in a component whose class list also controls the wrapper. Every
framework image would need a new special case.

The design that shipped inverts it: `CardImage` owns the box and nothing else.

```tsx
/* src/components/ui/card.tsx */
function CardImage({ className, aspect = 'aspect-video', children }: CardImageProps) {
  return (
    <div
      data-slot="card-image"
      className={cn('relative overflow-hidden rounded-t-sm', aspect, className)}
    >
      {children}
    </div>
  );
}
```

```tsx
/* The consumer brings its own image element. */
<CardImage aspect="aspect-[16/9]">
  <Image src={cover} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
</CardImage>
```

The package keeps the layout contract — aspect ratio, overflow, radius — and the app keeps the
element it knows how to optimise. No framework detection, no prop forwarding, no second API to
maintain. The general lesson: when a wrapper starts accepting configuration for the thing inside
it, the wrapper probably wants children instead.

### U5: the table that stopped wrapping

The registry adds `whitespace-nowrap` to both `TableHead` and `TableCell`. That is right for data
tables and wrong for prose. Article tables are rendered from CMS rich text, and a long sentence in a
cell became a horizontally scrolling strip instead of wrapping onto three lines.

Keeping the rule on `TableHead` and dropping it from `TableCell` gives the default that matches
both uses: headers are short and benefit from not wrapping, cells can contain prose, and a consumer
who wants a no-wrap column says so per cell:

```tsx
<TableCell className="whitespace-nowrap">{row.status}</TableCell>
```

### The packaging half

The remaining items are less dramatic and more likely to bite a consumer.

`lucide-react` moved from a dependency to an optional peer with a wide range, because two copies of
an icon library means two definitions of every icon and no way for either side to deduplicate.
The consolidated `radix-ui` package is the primitive layer now; a consumer adding
`@radix-ui/react-dialog` next to it gets two Radix trees, which is duplicate code rather than a
bug, but it should be a documented rule rather than a discovery. The heavy dependency list —
`recharts`, `shiki`, `embla-carousel-react`, `vaul` and friends — is safe because output is per
module and `sideEffects: false`, but the install is still heavier than the bundle, and moving the
genuinely optional ones to optional peers is the obvious next step.

The build blemishes were exactly what they looked like: a doubled `'use client'` from the source
directive plus the preserve plugin, and a bare `import 'react'` in every module. The doubled
directive came from a component that does not need one, and removing it fixed the output. The
stray import is Rollup's handling of the JSX runtime; it is harmless, but it is the kind of thing
that makes `sideEffects: false` look like a lie when someone reads `dist`.

And the documentation gap: the README's `@source '../node_modules/@konopskidev/ui/dist'` is
relative to the file containing it, not to the app root. An app whose global stylesheet lives in
`src/app/` needs `../../../node_modules/…`. It works today only because the example file sits at the
root. That sentence belongs in the README next to the snippet.

> **Image placeholder — “The pull request that closed the gaps”**
> Screenshot of PR #3 on GitHub: the green `verify` check, the files-changed summary, and the commit
> title listing U1–U9. 1400×900. This is the visual proof that the field test ended in a merged fix
> rather than a list of issues.

> **Image placeholder — “Provenance on npm”**
> Screenshot of the `@konopskidev/ui` page on npmjs.com, cropped to the version panel showing the
> green provenance badge and the linked source commit. 1200×700. If the package is not published
> yet, capture the first release after this series and use that.

## The checklist

If I started another library tomorrow, this is the list I would want, in order:

1. **One palette, one file.** Unlayered values, one dark block, referenced everywhere else.
2. **A semantic scale separate from visual steps.** A heading level is the page's decision; the type
   step is the component's.
3. **Script the mechanical translation.** Radius, focus, shadows, ring borders. Review the rest.
4. **Generate the barrel and keep the export map explicit.** Deep imports are a feature, and they
   only work with per-module output.
5. **Preserve `'use client'` deliberately.** It disappears in a bundler unless you put it back.
6. **Ship declarations that resolve under `node16`.** Rewrite relative specifiers to `.js`, then
   prove it with `attw`.
7. **Test behaviour in jsdom and rendering in a browser.** They catch different classes of bug, and
   axe in a real browser is not optional for a design system.
8. **Ratchet coverage, do not chase it.** Set the floor where the suite is and let new code raise
   it or fail.
9. **Verify the tarball, not the tree.** `publint` and `attw` run against `npm pack`, which is what
   the consumer gets.
10. **Release from a workflow, with a bump enum and a dry run.** No version strings, no local tags,
    no secrets where OIDC will do.
11. **Adopt it somewhere real before calling it v1.** Every blocker in this article was invisible
    from inside the package.

That last one is the whole story. The library was "ready" when Storybook was green and the tests
passed. It became usable when a site with different constraints installed it and broke it in ten
places.

`0.1.2` carries these fixes. After that, the obvious work is publishing Storybook so the components
are browsable without cloning, adding the token test from U1, and deciding which of the heavy
dependencies deserve to become optional peers.

---

**Previous:** [Part 2 — Turning it into a package](./02-packaging-and-tests.md)
**Repository:** [misiekhardcore/konopskidevui](https://github.com/misiekhardcore/konopskidevui)
**References:** [npm trusted publishing](https://docs.npmjs.com/trusted-publishers),
[npm provenance](https://docs.npmjs.com/generating-provenance-statements),
[git-cliff](https://git-cliff.org), [Radix Slot](https://www.radix-ui.com/primitives/docs/utilities/slot)
