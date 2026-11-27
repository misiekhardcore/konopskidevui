# 0014 — A tool call is a one-line disclosure

- **Status:** Accepted
- **Date:** 2026-11-27

## Context

A tool part carries a score of fields: the call's input, its partial input while streaming, its output
or its error, an optional provider-execution flag, and — in the approval states — an approval id, a
request reason, an opaque descriptor and the recorded decision. [ADR 0005](0005-v1-inventory.md) says
`tool` renders all of it, and [ADR 0009](0009-approval-is-inline.md) says the approval is a card in
the message.

Rendered literally, that is a card per call. An agent turn that calls ten tools then fills the
transcript with ten panels whose content nobody reads after the fact, and the answer the user came
for is pushed off screen. The information is worth having, not worth showing by default: what a
reader needs at a glance is _which_ tool ran and _how it ended_.

The library already has the shape this wants. `Trace` and `TraceCollapsible` render an execution
trace as one line per step — a trigger, a chevron, a status, a shimmer while running, a detail region
that animates open — and they are real disclosures, not styled `div`s.

## Decision

1. **One row per tool part.** A tool call renders as a single line, in every state, including
   `output-available` and `output-error`. There is no card-per-call layout and no second variant.
2. **Collapsed by default.** Nothing about a call is expanded until the reader asks. The expanded
   state is uncontrolled — the row starts collapsed and remembers its own state — with `open` and
   `onOpenChange` available for an app that wants to drive it.
3. **The row is a disclosure, not a button that looks like one.** It is built on the existing
   `Trace` / `TraceCollapsible` primitives, so it is a keyboard-operable trigger with `aria-expanded`
   and `aria-controls`, its detail region is inside the trigger's disclosure, and it inherits the
   house's chevron rotation, hover and focus treatment. The body animates open with the same
   accordion animation; the module opts out of that animation and of the running shimmer under
   `prefers-reduced-motion`.
4. **The collapsed row is a summary, not a preview.** It carries the tool's name and the one fact
   that state has to offer, on one line, truncating with the detail region still reachable. Arguments,
   partial input, output, error text and the approval card all live in the body: while collapsed they
   are not in the accessibility tree.
5. **A pending approval opens itself and stays open.** `approval-requested` is the one state where
   the body is not optional: the decision is the point, and a one-line "approve?" row hides the
   arguments the reader is being asked to judge. The row opens on its own in that state and its
   trigger does not collapse it while the request is unanswered. Once `approval-responded`, it
   collapses like any other state, and the summary states the decision.
6. **`tool-approval` stays a module of its own.** [ADR 0005](0005-v1-inventory.md) is unchanged: the
   card can be imported and rendered alone, and `tool` renders it as the `approval-requested` body.
   This answers, at the leaf level, the routing question left open in
   [ADR 0007](0007-dispatcher-deferred.md); whether a dispatcher answers it the same way is still
   that ADR's problem.
7. **One row per call is not grouping.** Runs of calls, step boundaries and any collapsed summary of
   several calls remain the dispatcher's business ([ADR 0007](0007-dispatcher-deferred.md)). Each row
   speaks for exactly one part.

### What the collapsed row says

| `state`              | Summary                                                    |
| -------------------- | ---------------------------------------------------------- |
| `input-streaming`    | tool name, running, shimmer on the label                   |
| `input-available`    | tool name                                                  |
| `approval-requested` | tool name, awaiting approval — and it opens itself         |
| `approval-responded` | tool name, approved or declined                            |
| `output-available`   | tool name, plus a provider-executed marker when applicable |
| `output-error`       | tool name, failed, in the destructive colour               |

The state's wording is a label, so it is translatable like every other string in the family.

## Consequences

- A long agent turn stays scannable: ten calls are ten lines, and the answer keeps its place. Reading
  the detail is one click, and the detail is where the same call's arguments were always going to be.
- The tool card and the trace now share one visual language, so an app that already shows execution
  traces gets a consistent transcript without styling either.
- The collapsed row cannot show arguments, which is a real loss for a one-line call where the
  arguments are the answer. The app's own renderer for a known tool (story 13) is the escape hatch,
  and it renders in the body like everything else.
- The disclosure owns state, so `tool` is a client component; the directive decision follows from the
  trigger, as with every other disclosure in the library.
- The pending-approval exception is the one place where the component refuses an interaction: a
  trigger that opens and will not close reads as a bug unless the card is visibly the reason. The card
  is the body, so the reason is in view.

## Alternatives considered

- **A card per call, always expanded.** Every field visible without interaction, and unusable past
  three calls in a turn.
- **A card collapsed to a header, expanded by default once output exists.** The transcript grows as
  the turn progresses and then has to be read past; nothing about "finished" makes the arguments more
  interesting than "running" did.
- **Collapse the pending approval too.** Consistent, and it hides the arguments at the exact moment
  a person has to judge them. Rejected: it optimises the layout at the expense of the decision.
- **A new `tool-row` primitive in `ui`.** `Trace` is already this row; a second one would exist only
  to avoid the word "trace", and the two would drift.
