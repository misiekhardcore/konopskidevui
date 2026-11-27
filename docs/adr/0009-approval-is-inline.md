# 0009 — Approval is an inline card, not a modal

- **Status:** Accepted
- **Date:** 2026-11-26

## Context

A tool part in `approval-requested` carries `approval.id`, an optional `requestReason`, an optional
opaque `descriptor`, an optional `isAutomatic`, and the call's `input`. The answer goes back through
the app, which calls `addToolApprovalResponse({ id, approved, reason })`.

Two things about the situation matter. The decision is about one call inside a conversation, so the
person deciding wants to see the call's arguments and the surrounding messages. And a single turn can
request several approvals, so anything that takes over the screen queues badly.

`AlertDialog` already exists in `components/ui` and is the house's blocking confirm.

## Decision

1. **`tool-approval` renders inline**, in the message, where the tool part sits.
2. **It takes the part and emits events** — `onApprove({ id })`, `onDeny({ id, reason })` — and never
   calls `addToolApprovalResponse` itself ([ADR 0004](0004-presentational-only.md)).
3. **It renders every approval-bearing state, not just the request.** `approval-requested`,
   `approval-responded` (approved or denied, with the reason) and `output-available` carrying an
   approval are all renderable, because a reloaded conversation arrives mid-lifecycle. A request with
   `isAutomatic` is read-only: the decision is already made, and the card says so with its reason.
4. **`descriptor` is opaque.** If present it is shown as-is in a secondary region, never interpreted,
   never used to decide anything.
5. **`AlertDialog` is not imported by the module.** Escalating a destructive tool to a modal is the
   app's composition, shown once in the stories.
6. **A pending state belongs to the component, the promise belongs to the app.** While the app's
   `onApprove` promise is unsettled the buttons are disabled; the component does not invent a timeout
   or a retry.

## Consequences

- Focus never leaves the transcript, several approvals can be read and answered in order, and the
  arguments are visible next to the conversation they belong to.
- The card has more states than a modal would: request, submitting, automatic, approved, denied. Each
  is a story, and each is a Chromatic candidate.
- Denial reasons are optional text the app forwards as `reason`; nothing is validated here.
- Because the component is interactive and holds a typed reason, it carries `'use client'` — the
  contract test decides that, not this ADR.
- A tool with no arguments still needs a sensible card; the arguments region has to degrade rather
  than render an empty code block.

## Alternatives considered

- **A modal built on `AlertDialog`.** Impossible to miss and reuses a primitive wholesale, but it
  takes focus and reading position, stacks badly when a turn asks three times, and hides the
  conversation the decision depends on.
- **Inline with a `modal` prop.** One component covering both. Rejected: two layouts, two focus
  behaviours and two test surfaces in the component that already has the most states.
- **A generic `confirmation` module.** Would serve non-tool confirmations too, but it could not answer
  an approval id or render an already-responded state, so every real use would wrap it anyway.
