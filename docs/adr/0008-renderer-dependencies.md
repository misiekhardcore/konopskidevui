# 0008 — What each renderer stands on

- **Status:** Accepted, amended by [0013](0013-inline-citations.md)
- **Date:** 2026-11-26

## Context

Three of the eleven modules need to render something that is not plain text: markdown for `response`,
JSON for `tool`, prose for `reasoning`. The house rule is that a heavy dependency is an optional peer,
never a bundled one, and a module that needs one is deep-import only — which the whole AI family
already is.

Two facts about the existing code decide most of this:

- `components/ui/code-block` is chrome only. It renders the styled `<pre>`/`<code>`, the header and
  footer and the copy button, and it imports nothing heavy. It does **not** highlight: the app passes
  highlighted nodes as children.
- The shiki-bearing modules are `lib/highlighter` and `hooks/use-highlighted-code`, and both are in
  `ESM_ONLY_MODULES` because shiki is ESM-only. A module that imports them cannot ship a
  `require()` path.

## Decision

1. **`response` depends on `react-markdown` + `remark-gfm`, as optional peers.** GFM is on because
   tables, strikethrough and task lists are ordinary model output. The module owns the streaming
   behaviour: an unterminated fence must not flash as plain text, a half-written link must not become
   a URL, and the caret must not remount the tree on every token.
2. **`tool` reuses `CodeBlock` for its JSON, without `useHighlightedCode`.** No shiki, no ESM-only
   constraint, and `require()` keeps working. Input during `input-streaming` is partial, so it is
   rendered as text rather than parsed.
3. **`reasoning` renders plain text with preserved line breaks.** No markdown peer, no escape hatch.
   It is a collapsed scratchpad, not a document.
4. **Nothing else in the family adds a rendering peer.** `sources`, `file-part`, `data-part`,
   `message-actions`, `prompt-input`, `chat-error` and `typing-indicator` compose `components/ui`
   primitives, all of which are already in the root barrel.

## Consequences

- Install cost is per module, not per family: `ai/response` needs the markdown peers, everything else
  needs only `ai` for its types. The README gets a row per module rather than one row per family.
- `ai/tool` stays in the CommonJS build. Adding highlighting later would mean joining
  `ESM_ONLY_MODULES` (losing `require()`) or shipping a second, highlighted module — a cost to
  weigh when someone asks, not a plan.
- The markdown edge cases are this library's code. That is the accepted price of choosing a parser
  over a streaming-specific renderer.
- `pnpm test:package` installs only React and Tailwind and never imports the family, so it proves
  nothing about these peers. A consumer smoke test for the family is a real gap; it is out of scope
  for this plan.
- Any future AI module that reaches shiki must be added to `ESM_ONLY_MODULES` in `scripts/entries.mjs`.
  In v1, none does.

## Alternatives considered

- **`streamdown`.** Purpose-built for streaming markdown and what the shadcn ecosystem uses. Rejected
  as the load-bearing dependency of the family's most visible component: younger than the ecosystem
  parser, and its styling assumptions have to be bent onto the house tokens anyway.
- **A parser written in-house.** Full control over streaming, no peer at all. Rejected: a markdown
  implementation is a project, and it would be the only part of this library with a correctness
  surface that large.
- **`tool` highlights by default.** Better looking, but it makes the family's most-imported module
  ESM-only and shiki-backed for JSON that is usually a few lines.
- **`reasoning` reuses the markdown peer.** Consistent, and correct for providers that emit lists in
  a reasoning summary. Rejected for v1: it re-parses a collapsed block on every token for very little.
