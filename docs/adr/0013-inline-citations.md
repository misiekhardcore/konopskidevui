# 0013 — Citations are a list and an inline marker

- **Status:** Accepted
- **Date:** 2026-11-26 — amends [ADR 0008](0008-renderer-dependencies.md)

## Context

[ADR 0008](0008-renderer-dependencies.md) treated `response` as a markdown renderer with no knowledge
of source parts. The requirement is the opposite: a claim in the prose should be able to point at its
source, otherwise a citation list is a footnote nobody connects to anything.

The SDK gives `source-url` and `source-document` parts a `sourceId`, a `url` or `filename`, and a
title. It does **not** standardise how the text refers to them: providers emit different marker
syntaxes, and some emit none at all, leaving the association to `providerMetadata`. So the mapping
from a marker to a source is partly the app's knowledge.

## Decision

1. **`sources` exports two things**: the citation list (`Sources`, deduplicated by url or filename)
   and the marker (`SourceCitation`).
2. **`response` renders markers for one documented default syntax**, `[n]`, resolved against the
   message's source parts in the order they appear in `message.parts`, deduplicated. Numbering is
   therefore stable for a given message rather than dependent on arrival order.
3. **`resolveCitation` overrides the default** for a provider with its own syntax, so a custom marker
   is a prop rather than a fork of the component.
4. **Unresolved and half-written markers render as literal text.** A `[` at the end of a stream, or a
   marker whose source has not arrived yet, must not flash, throw, or render an empty chip. When the
   source arrives the marker upgrades on the next render.
5. **The marker is a link into the list**, with the source title in its accessible name — a bare
   number is not a label, and a screen reader announcing "1" is worse than announcing nothing.
6. **`response` imports the marker from `sources`.** Both modules stay independently importable; the
   dependency is within the family and changes no peer.

## Consequences

- `response` gains a remark transform and a second concern: text in, markers resolved against the
  message's sources, nodes out. That is the amendment to ADR 0008 — the markdown renderer is no longer
  source-agnostic.
- The streaming rule is the hard part: the transform runs on every token, so a partially typed marker
  has to be detected and left alone until it is complete.
- Numbering has to survive deduplication and sources that arrive mid-stream. Document order in
  `message.parts` is the definition; an app that reorders sources gets different numbers.
- An app whose provider emits no markers gets the list and no markers, which degrades to ADR 0008's
  original shape without a prop to turn anything off.
- The Chromatic opt-in for `response` should be a story that includes both a resolved marker and an
  unresolved one, since the failure mode is visual.

## Alternatives considered

- **List only.** Simplest, and it keeps `response` source-agnostic. Rejected: a citation list that the
  prose cannot point at is a bibliography with no superscripts.
- **Markers only, no list.** Cleanest reading, but no place for a title, a domain or a preview, and a
  message with three citations becomes unreadable.
- **A `remark` plugin shipped separately for each provider syntax.** Correct long-term, and far too
  much surface for a first release; `resolveCitation` covers the same need with one prop.
