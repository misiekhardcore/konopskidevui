# 0011 — Minor release, README section, the same guards as `ui`

- **Status:** Accepted
- **Date:** 2026-11-26

## Context

The family adds a public surface without changing any existing one: the root barrel is untouched, no
`components/ui` module moves, no import path changes. Semver therefore puts it in a minor.

The repository also enforces its documentation and visual coverage with tests rather than review
notes: `story-coverage.test.ts` requires a stories file, at least three stories and a Chromatic
opt-in per component; `client-directive.test.ts` decides `'use client'` per module; `check-build.mjs`
verifies every `exports` target.

## Decision

1. **`0.10.0`.** A minor, because nothing that exists breaks.
2. **The guards extend to both families.** `story-coverage.test.ts` scans `components/ai` as well as
   `components/ui`, with the same minimum, the same Chromatic opt-in and the same "a part with its own
   prop gets its own story" rule. Every one of the eleven modules lands with its own jsdom suite.
3. **The README gains an "AI components" section** — the install command including `ai@^6`, a row per
   module that needs a peer (`response`, and `tool` only when highlighting arrives), the deep-import
   example, and one sentence in "Adding a component" saying which family a new module belongs to.
4. **The README links to `docs/adr/`**, so the decisions are reachable from the place a consumer and a
   contributor both start.
5. **`check-build.mjs` learns the family** (its wildcard sample map currently assumes one
   `components` family), and `generate-barrel.mjs` gets a comment explaining that `ai` is excluded by
   design rather than by omission.

## Consequences

- Eleven new stories files, eleven jsdom suites, eleven Chromatic baselines. The first visual build that
  contains them fails until the snapshots are accepted — that is the existing workflow, not a new one.
- `pnpm test:stories` and `pnpm test:coverage` grow in proportion. The coverage floors are a ratchet,
  so the new modules cannot ship untested without the run going red.
- Two peer rows in the README rather than one, because install cost differs per module
  ([ADR 0008](0008-renderer-dependencies.md)).
- A family documented only in Storybook would have hidden the `^6` constraint from anyone installing.
- The `attw` question from [ADR 0002](0002-type-only-sdk-coupling.md) has to be answered inside this
  release, before the version is published.

## Alternatives considered

- **`1.0.0`.** A statement rather than a compatibility requirement: nothing breaks, and the family is
  still missing its dispatcher.
- **Minor with no README until the dispatcher ships.** Keeps documentation honest about a partial
  family, but leaves the install constraint and the peer rows unpublished.
- **Skipping the Chromatic opt-in for AI modules** because they are mostly containers. Rejected: the
  visual suite is where a `Tool` state that renders nothing gets caught.
