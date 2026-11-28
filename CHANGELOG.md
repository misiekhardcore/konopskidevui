# Changelog

All notable changes to this project are documented in this file.

## [0.10.0] - 2026-11-28

### Features

- **ai:** Release the AI component family: a renderer for every AI SDK part type — tool calls and their approvals, reasoning, streamed responses with citations, sources, files, data parts, message actions, the composer, an error and a waiting indicator
- **ai:** The family is deep-import only and type-coupled to `ai@^6`, which every module needs for its types; `response` also needs `react-markdown` and `remark-gfm`, and `file-part` needs `@videojs/react` (both ESM only)

### Documentation

- **ai:** Document the family's install command, supported SDK major, import subpath and per-module peers, and link the decisions behind it

## [0.9.1] - 2026-11-25

### Chores

- Bump deps (#19)

## [0.9.0] - 2026-11-25

### Chores

- Release v0.9.0


### Features

- **video:** List chapters under the player (#18)

## [0.8.0] - 2026-11-23

### Chores

- Release v0.8.0


### Features

- **ui:** Add GFM table styling to prose-article (#17)

## [0.7.0] - 2026-11-23

### Chores

- **deps:** Upgrade all dependencies to latest (#15)
- Release v0.7.0


### Features

- **video:** Ship a Video.js 10 player as a deep import (#16)

## [0.6.0] - 2026-11-12

### Bug Fixes

- **ui:** Draw outline variants with a label-coloured border (#13)


### Chores

- Release v0.6.0

## [0.5.1] - 2026-11-04

### Chores

- Release v0.5.1


### Features

- **pagination:** Let links render through the consumer's router

## [0.5.0] - 2026-11-04

### Chores

- Release v0.5.0


### Features

- **ui:** Skin sonner from page tokens and normalise control heights (#12)

## [0.4.0] - 2026-11-03

### Chores

- Release v0.4.0


### Features

- **theme:** Add ThemeSwitcher and put the library on next-themes (#11)

## [0.3.0] - 2026-11-03

### Bug Fixes

- Remove duplicated prop


### Chores

- Release v0.3.0


### Documentation

- Draft the library and packaging articles (#7)


### Features

- **sonner:** Export toast so a consumer never imports sonner


### Other

- Revert "docs: draft the library and packaging articles (#7)"


### Testing

- Give every part real controls, and make the test suite enforce it (#8)
- Fail a pull request when Chromatic sees a visual change (#9)

## [0.2.1] - 2026-10-30

### Bug Fixes

- **storybook:** Let the component types drive the docs controls (#6)


### Chores

- Release v0.2.1

## [0.2.0] - 2026-10-29

### Chores

- Release v0.2.0


### Features

- A package consumers can resolve, theme and tree-shake (0.2.0) (#5)

## [0.1.2] - 2026-10-28

### Bug Fixes

- Fix 10 UI library gaps: U1 success tokens, U2 CardTitle asChild, U3 CardImage imageComponent, U4 badge tag variant, U5 table whitespace, U6 lucide-react peer dep, U9 dialog blemishes
- Fix 10 UI library gaps: U1 success tokens, U2 CardTitle asChild, U3 CardImage imageComponent, U4 badge tag variant, U5 table whitespace, U6 lucide-react peer dep, U9 dialog blemishes (#3)


### Chores

- Release v0.1.2

## [0.1.1] - 2026-10-28

### Bug Fixes

- Breadcrumb divider


### Chores

- Tsconfig
- Fix dom warning
- Release v0.1.1


### Other

- Scaffold the @konopskidev/ui package
- Ship the konopskidev design system (#1)
- Add a release workflow with a generated changelog (#2)


