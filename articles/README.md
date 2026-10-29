# Building `@konopskidev/ui`

A three-part write-up of how a design system went from a stylesheet on a personal site to a
published React package: the token layer, the build and test machinery, and the release workflow
plus the ten gaps a real application found on day one.

The package itself lives at
[misiekhardcore/konopskidevui](https://github.com/misiekhardcore/konopskidevui): sixty-three
shadcn components on Tailwind CSS v4 and React 19, styled with the konopskidev tokens, documented
in Storybook and tested in both jsdom and Chromium.

## The series

| Part                                                              | What it covers                                                                                                              | Read if you want to…                                               |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| [1 — One palette, sixty-three components](01-style-foundation.md) | Tokens, the `@theme inline` mapping, base rules, house utilities, prose, the registry import, and the style-contract script | Define a palette once and make the registry's components obey it   |
| [2 — Turning it into a package](02-packaging-and-tests.md)        | `preserveModules`, `'use client'`, declarations for `node16`, the export map, peers, two test suites, `publint`/`attw`, CI  | Ship an ESM component library that tree-shakes and type-checks     |
| [3 — Release and the field test](03-release-and-field-test.md)    | The dispatch-driven release, `git-cliff`, OIDC provenance, dry runs, and the ten gaps a real app exposed                    | Automate publishing, and see what breaks when a consumer adopts it |

Each part stands on its own; the series is meant to be read in order if you are building something
similar, or dipped into if you have one specific problem.

## Conventions in these articles

Code is quoted from the repository, trimmed to the part that teaches something. Paths are given in
the surrounding prose, so a snippet can be read on its own. Where a fix replaced an earlier attempt,
both are shown — the discarded version is usually the more instructive one.

## License

The articles are MIT, same as the package.
