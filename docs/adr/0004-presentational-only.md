# 0004 — The AI family is presentational only

- **Status:** Accepted
- **Date:** 2026-11-26

## Context

This repository already ships components that own behaviour: `message-scroller` wraps
`@shadcn/react`'s scroller, `questionnaire` wraps its questionnaire. So "presentational only" is not
an existing invariant, and it needs an argument rather than an appeal to precedent.

The distinction is what the wrapper would be wrapping. Those wrappers take a dependency whose props
are the app's data and whose behaviour is local — scroll position, step state. `useChat` is not
local: it owns the message array, the transport, the stream lifecycle, the error object, the status
machine and the approval callbacks. A component that takes its return value has that whole API as
its prop surface, versioned by someone else's major.

There is also nothing to gain. The parts arrive as data; rendering data does not need the hook.

## Decision

1. **No import from `@ai-sdk/react` anywhere in the family.** `ai` stays a type-only peer
   ([ADR 0002](0002-type-only-sdk-coupling.md)).
2. **No component owns message state, transport, streaming or retry.** Data in, events out:
   `onApprove`, `onDeny`, `onSubmit`, `onRegenerate`. The app wires those to
   `addToolApprovalResponse`, `sendMessage` and `regenerate`.
3. **Local UI state is allowed** where it is genuinely local — a disclosure open or closed, a denial
   reason being typed. What is ruled out is conversation state.
4. **Error, retry and rate-limit policy stay in the app.** A component may render an error it is
   given; it may not decide to retry.

## Consequences

- Every component is testable in Storybook and jsdom with plain objects, no provider and no fake
  transport. That is also what makes the Chromatic opt-in cheap.
- `@ai-sdk/react` never joins the peer list, so the family's install story stays "`ai` for the types".
- Consumers wire a handful of props themselves. The alternative — a `<Chat>` that does it for them —
  is a product, not a primitive.
- The family cannot smooth over a hook's rough edges. If `useChat` reports something awkward, the app
  sees it.

## Alternatives considered

- **Thin wrappers allowed.** Consistent with `message-scroller`, and a `<ChatTranscript>` taking the
  `useChat` result would be convenient. Rejected because the wrapper's props would _be_ that hook's
  return value, so every hook change becomes a breaking change here, and the library would be
  re-exporting a state machine it does not own.
- **One high-level `<Chat>`.** Fastest path to a working screen, but it makes composer behaviour,
  approval handling, scrolling, error policy and retry all props or overrides of one component. The
  design decisions this plan is making would collapse into that component's API.

## Follow-ups

- `'use client'` for each module is decided by the existing contract test, not by this ADR: an
  approval card that holds a typed denial reason is interactive and gets the directive; a purely
  static `Tool` body does not.
