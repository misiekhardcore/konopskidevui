# 0003 — Only the current AI SDK major

- **Status:** Accepted
- **Date:** 2026-11-26

## Context

The part union is not the same across majors. The 5.x reference documents four tool states —
`input-streaming`, `input-available`, `output-available`, `output-error`. The current reference adds
`approval-requested` and `approval-responded`, and adds `steering-message` and `custom` on the
message side. Those additions are not decoration: the approval states are the reason a `ToolApproval`
component exists at all.

Because [ADR 0002](0002-type-only-sdk-coupling.md) publishes the SDK's own types in the `.d.ts`, the
supported union is not an internal detail. Whatever this package compiles against is what its
consumers' type checker sees.

The family is new, so no installed base is owed an older line.

## Decision

- The peer range is **`ai: ^6`** — the current major, and only that major.
- `ai` is pinned inside that range as a devDependency, so the union this repository compiles against
  is the union the declarations describe.
- Upgrading the SDK is a deliberate event, gated by `pnpm tsc`. It is not a floating range that
  resolves to a newer part shape on someone else's install.
- A future SDK major is a breaking change for this family, and therefore a major of this package,
  because the published types move with it.

## Consequences

- Components render one state set. No branch for a state that may not exist, no locally widened
  union, no second test matrix.
- An app on the 5.x line cannot use the family until it upgrades. That is the accepted cost.
- The README row for the family states `^6` next to the install command, so the constraint is
  visible before install rather than at the type checker.
- The peer range has to be kept honest: when `@ai-sdk/react` moves to a new major, this package
  needs a major too, even if not one line of component code changed.

## Alternatives considered

- **`^5 || ^6`.** Reaches every current app, but forces either defensive branches for a missing
  approval state or a local union that duplicates the SDK's — the drift ADR 0002 exists to prevent.
- **Pin nothing until the first component compiles.** Defers a decision that changes the props of
  every tool component, and leaves the peer range as an accident of install order.

## Follow-ups

- The README install table must carry the `^6` constraint next to `pnpm add ai`.
- The release that introduces the family is a minor of this package; the first SDK major bump after
  it is a major of this package.
