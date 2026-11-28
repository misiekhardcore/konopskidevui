# Changelog

All notable changes to this project are documented in this file.

## [0.11.0] - 2026-11-28

### Bug Fixes

- **ai:** Message actions that honour the #29 contract (#44)


### Features

- **ai:** Render tool approval as the AI family's first subpath (#36)
- **ai:** Render a tool part across its lifecycle as one disclosure row (#37)
- **ai:** Render the reasoning part as a collapsing thought row (#38)
- **ai:** Resolve source parts into a citation list and markers (#25) (#39)
- **ai:** Render a file part by its media type (#40)
- **ai:** Render a text part as streaming markdown with citations (#41)
- **ai:** Render an app-defined data part as named JSON (#42)
- Message actions component (#43)
- **ai:** Prompt input composer with attachments, voice and auto-read (#30) (#45)
- **ai:** Chat error as a destructive alert (#46)
- **ai:** Typing indicator before the first token (#32) (#47)
- **ai:** Release the AI component family as 0.10.0 (#49)


### Testing

- **ai:** Share typed part fixtures and keep them out of the build (#35)
- **ai:** Composed assistant transcript (#48)

## [0.9.1] - 2026-11-25

### Chores

- Bump deps (#19)
- Release v0.9.1

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


