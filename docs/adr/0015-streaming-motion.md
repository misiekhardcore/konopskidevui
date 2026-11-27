# 0015 — A streaming answer reflows, it does not pop

- **Status:** Accepted
- **Date:** 2026-11-27

## Context

A `text` part arrives in chunks. Each chunk can finish a line or add a block, and the message's box
grows to fit. With no motion the box jumps between heights — at reading speed that is a small shove
every few hundred milliseconds, and it is the most noticeable thing about a chat that is otherwise
calm.

Two mechanisms are available, and neither is free:

- Animating the height itself needs the browser to interpolate to and from `auto`. That is
  `interpolate-size: allow-keywords`, which is not everywhere yet.
- Animating the arrival of the new content needs to know which content is new. The obvious answer is
  to diff blocks and re-render the newest one with an animation, which means state and keys in a
  component whose whole contract is "render this part" ([ADR 0004](0004-presentational-only.md)).

The constraint that decides this: the family is presentational. No `ResizeObserver`, no `rAF` loop,
no timers, no measuring the transcript to animate it.

## Decision

1. **Ease the box where the engine can.** The response's own box transitions `height` while the part
   is streaming, under `@supports (interpolate-size: allow-keywords)`, at 200ms with the house's
   ease-out — the same duration as every disclosure in the library. The bubble around it follows for
   free, because its height is `auto` and it tracks its child every frame; the family never touches
   the app's bubble.
2. **Fade in what was appended, everywhere else.** Each rendered block of the answer carries
   `@starting-style` styles — opacity `0`, translated down a hair — with a 200ms transition. A block
   that is inserted runs it; a block that is already in the DOM simply updates its text and does not.
   This is the floor, it needs no measurement, and it works in every engine the library supports.
3. **Only while streaming.** The classes that enable both are gated on the part's
   `state: 'streaming'`. A finished part, a reloaded conversation and a transcript rendered on the
   server paint at rest: opening a conversation must not cascade eleven animations.
4. **What does not animate.** The first block of a message (the wait belongs to `typing-indicator` and
   its own reduced-motion story), text inside a block that already exists (only whole blocks enter,
   so a growing paragraph never flickers), and any detail region the reader opened themselves.
5. **Reduced motion turns both off**, leaving no transition and no starting style. The caret stops
   blinking and the reasoning shimmer is already still.
6. **No new keyframes, no new tokens.** Both mechanisms are CSS properties and utilities the library
   already uses; the vendored Tailwind layer is not touched.
7. **No motion prop.** How the answer grows is not configuration in v1. An app that wants a different
   arrangement composes its own bubble and body; it does not pass a duration.

## Consequences

- The growth reads as the answer being revealed rather than the page being bumped, and it costs one
  CSS property per block.
- The height ease is progressive enhancement with an honest fallback: an engine without
  `interpolate-size` still jumps in layout, but the appended block arrives fading, which is what
  bridges the jump. The fallback is the floor this ADR promises; the ease is the bonus.
- While the box eases towards its new height, its content briefly outruns it. Where the app's bubble
  clips (the `BubbleContent` default) that reads as a curtain revealing the new line; where it does
  not, the last line can overlap the next element for a frame or two. The fade is what keeps that
  acceptable, and it is why the ease is scoped to the streaming state only.
- Nothing here is testable as time. jsdom computes neither starting styles nor transitions, so the
  suite asserts the streaming flag that switches the motion on, and the settled frame is what the
  visual snapshot covers. A motion regression is caught in review, not in CI, and this ADR says so
  rather than pretending otherwise.
- The added block is the unit of motion, which quietly constrains the markdown renderer: it has to
  keep block identity stable across chunks (no remounting the tree per chunk, as the spec already
  requires for selection and scroll). That requirement now has a second reason.

## Alternatives considered

- **Animate height with a `ResizeObserver` and explicit pixel heights.** Works in every engine, and
  puts measurement, state and a frame loop in a presentational component — it also fights the
  scroller's follow-the-end behaviour and can drop text selection mid-animation.
- **Animate every chunk** (a pulse, a per-token fade). Reads as noise at 30 tokens a second, and the
  reader is trying to read the text that keeps moving.
- **A typewriter reveal that hides the tail.** Turns streaming into theatre: the data has already
  arrived and the component would be pretending it has not.
- **No motion at all.** Cheapest and honest, and it leaves the jump this ADR exists to remove.
- **Ship the ease only.** Nothing visible on engines without `interpolate-size`, which is a large
  share of them today.
