# 0007 — The part dispatcher ships after the leaves

- **Status:** Accepted
- **Date:** 2026-11-26

## Context

A dispatcher — `message-parts` — would own the `message.parts.map(...)` switch and an override
registry keyed by tool name and data-part name. It is the component that turns eleven leaf renderers
into a system, and the type-only coupling in [ADR 0002](0002-type-only-sdk-coupling.md) makes it
possible: the family can name `UIMessage` and `UIMessagePart` without a runtime dependency.

It is also the component most exposed to SDK churn, and its override registry is an API that is hard
to get right in the abstract. Designing it before the renderers exist means designing against
imagined components.

## Decision

The first release ships **leaves only**. `message-parts` is reserved by name
([ADR 0006](0006-module-naming.md)) and deliberately absent from the v1 inventory
([ADR 0005](0005-v1-inventory.md)).

The dispatcher is revisited once its inputs exist, and it is expected to need:

- the part switch, including `step-start` grouping (nothing in v1 renders a step boundary),
- a registry keyed by tool name for typed inputs and outputs, and by `data-<name>` for data parts,
- a decision about what an unknown part renders as,
- an answer to whether `Tool` and `ToolApproval` are dispatched together or the approval is the
  tool's own `approval-requested` body.

## Consequences

- Every consumer writes the part switch in the first release. That is the one piece of boilerplate
  this plan accepts, and it is the price of not shipping an override API nobody has used yet.
- The leaves cannot assume a parent. Each must render standalone with just its part, which is also
  what makes the Storybook stories honest.
- There is no dispatcher API to deprecate when the real one is designed, because there is no v1
  dispatcher.
- `step-start` renders nothing until the dispatcher groups steps. An app that wants step visuals
  composes `Trace` around the parts itself.

## Alternatives considered

- **Ship it in v1.** One import for a whole message, and the switch lives in one place. Rejected:
  the registry would be designed against components that did not exist yet, and it is the component
  most likely to need a breaking change the year after.
- **Never ship it.** Every app writes the switch forever, which is the boilerplate this family is
  supposed to remove.

## Trigger for revisiting

Two independent consumers repeating the same switch, or the second data-part renderer, whichever
comes first. At that point the registry has real entries to be designed against.
