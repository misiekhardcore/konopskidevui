# Spec — AI components, v1

Synthesised from [ADRs 0001–0015](../adr/README.md). Vocabulary: [glossary](../glossary.md). Where
this document and an ADR disagree, the ADR wins.

## Problem Statement

This library can already render a conversation: bubbles, messages, a scroller, an execution trace,
attachments, a code block, a questionnaire. What it cannot render is an AI SDK `UIMessage`.

A `text` part arrives as markdown that nothing parses. A tool part arrives as one of seven states of
which the library can show a single line. An approval request has no component at all; the nearest
thing is a modal confirm, which takes over the screen to ask about one call. Citations, model-produced
files and app-defined data parts have nowhere to go and nothing to look like.

So every app building a chat on this library writes the same part switch, the same tool card and the
same approval prompt, and each writes them slightly differently. The gap is not visual — the house
tokens already cover it. The gap is semantic: the parts carry state and structure that no component
knows about, and the SDK is the source of that structure.

## Solution

Eleven presentational components, each taking one part and rendering it, in a new `ai` component
family with its own import path and its own Storybook group. An app composes them per part and keeps
`useChat`, the transport and the conversation.

The family covers every part type, so no consumer is left filling a hole the library skipped:
tool calls in all their states, each collapsed to a line until it is opened, an inline approval card,
streaming markdown with citation markers,
reasoning, sources, files, data parts, plus the surfaces around a transcript — message actions, the
composer, an error, and the wait before the first token.

The SDK enters as types only. Nothing in the family imports `@ai-sdk/react`, nothing reads runtime
values from `ai`, and an app that never builds a chat resolves none of it.

## User Stories

1. As an app developer, I want to pass a tool part straight from the message array into a component, so that I do not map SDK fields onto props.
2. As an app developer, I want a tool card that renders every state of a tool part, so that a streamed call does not disappear or change shape as it progresses.
3. As an app developer, I want the partial input of a still-streaming tool call shown safely, so that a half-written JSON payload never throws.
4. As an app developer, I want an error from a tool execution shown in place, so that a failure is visible where the call was rather than only in a console.
5. As an app developer, I want a tool marked as provider-executed to say so, so that a user does not wonder why it produced no local work.
6. As an app developer, I want one collapsed row per tool call rather than a card per call, so that a turn with ten calls stays scannable.
7. As an app developer, I want that row to open in place, so that a call's arguments, output or error are one click away without leaving the transcript.
8. As an app developer, I want the approval card to render a request, a pending decision and a recorded decision, so that a reloaded conversation still tells the truth.
9. As an app developer, I want to be told which approval id to answer, so that I can call the SDK's response function without guessing.
10. As an app developer, I want the approval card to stay inline in the message, so that several approvals in one turn can be read and answered in order.
11. As an app developer, I want the opaque approval descriptor shown as-is, so that the reason a call needs review is visible without the library pretending to understand it.
12. As an app developer, I want an automatic approval to be read-only with its reason, so that a user is informed rather than asked a question that is already answered.
13. As an app developer, I want to pass my own renderer for a tool's input or output, so that a known tool looks like a product rather than a JSON dump.
14. As an app developer, I want assistant text rendered as markdown while it streams, so that a response does not flash through raw syntax before settling.
15. As an app developer, I want a half-written code fence to stay a code block, so that the layout does not jump on the last token.
16. As an app developer, I want fenced code to use the library's code block chrome and copy button, so that a chat and a docs page look like the same product.
17. As an app developer, I want reasoning to stream visibly and then collapse, so that the thinking is available without dominating the answer.
18. As an app developer, I want reasoning's duration shown once it finishes, so that a slow model's cost is legible.
19. As an app developer, I want citations as both a list and inline markers, so that a claim in prose can point at its source.
20. As an app developer, I want citation numbering to be stable for a message, so that a marker cannot silently point at a different source after a re-render.
21. As an app developer, I want to override how a citation marker is parsed, so that a provider with its own syntax works without forking a component.
22. As an app developer, I want an image or a PDF the model produced to render with open and download, so that generated output is usable immediately.
23. As an app developer, I want audio and video parts to play natively, so that a generated clip does not require a bespoke player.
24. As an app developer, I want an unregistered data part to show its name and payload, so that I can see what arrived during development.
25. As an app developer, I want to render my own data part, so that a weather payload or a plan looks like part of the product.
26. As an app developer, I want message actions that appear only when I wire them, so that I do not ship buttons that do nothing.
27. As an app developer, I want copy to confirm itself and announce the confirmation, so that the action is trustworthy without a toast.
28. As an app developer, I want a regenerate and an edit action that report intent, so that I can call the SDK's own functions.
29. As an app developer, I want feedback as a pressed toggle rather than two buttons, so that the state of a rating is unambiguous.
30. As an app developer, I want a composer that switches between submit and stop by itself, so that I do not hand-wire the streaming status.
31. As an app developer, I want the composer to report the files the user attached as browser files, so that I convert them with the SDK helper I already use.
32. As an app developer, I want attachments previewed the way they are previewed elsewhere in the library, so that a picked image looks like an uploaded one.
33. As an app developer, I want object URLs cleaned up by the composer, so that a long session does not leak memory.
34. As an app developer, I want a conversation error rendered with retry and dismiss as events, so that my app decides the retry policy.
35. As an app developer, I want a waiting affordance for the gap before the first token, so that a slow first token does not look like a hang.
36. As an app developer, I want every one of these components to work without a provider or a transport, so that I can render a transcript from stored messages.
37. As an app developer, I want to import one component without pulling in the rest, so that a single tool card does not cost the whole family.
38. As an app developer, I want the SDK to be a type-only dependency, so that installing the family does not add a runtime dependency I cannot audit.
39. As an app developer, I want the family to work with the one SDK major it is tested against, so that a part shape I read in the docs is the shape I get.
40. As an app developer, I want the markdown renderer to be the library's, so that I do not add a parser and then fight its defaults.
41. As an app developer, I want a JSON view that does not require a syntax-highlighting engine, so that the tool card does not drag shiki into my bundle.
42. As a chat user, I want to read a tool call's arguments before approving it, so that I am deciding about something I can see.
43. As a chat user, I want to deny with a reason, so that the model can respond to why I refused.
44. As a chat user, I want several pending approvals to be answerable in sequence, so that a multi-tool turn does not trap me in a modal.
45. As a chat user, I want to stop a response mid-stream, so that a wrong direction does not have to finish.
46. As a chat user, I want a growing answer to ease into its new height rather than jump, so that a line arriving does not shove the text I am already reading.
47. As a chat user, I want Shift+Enter to add a line, so that I can write a prompt with structure.
48. As a chat user, I want my attached files to be removable before sending, so that a wrong file does not have to be re-sent.
49. As a chat user, I want a citation marker to be a real link with a source name, so that I can jump to the claim's evidence.
50. As a screen reader user, I want each citation marker to announce its source title, so that a number is not read out as a meaningless digit.
51. As a screen reader user, I want the waiting state announced once, so that I know the assistant is working without a stream of repeated noise.
52. As a screen reader user, I want a collapsed tool row to say which tool ran and how it ended, so that I need not open ten rows to learn whether the turn succeeded.
53. As a keyboard user, I want reasoning and tool details to be real disclosures, so that I can open them without a mouse.
54. As a keyboard user, I want a tool row to open with the keyboard and tell me its state, so that reviewing a call does not depend on a pointer.
55. As a motion-sensitive user, I want the waiting animation to respect my reduced-motion preference, so that the affordance does not cost me comfort.
56. As a motion-sensitive user, I want a streaming answer to stop animating when I ask for reduced motion, so that the text settles immediately instead of sliding.
57. As a non-English app, I want every user-facing string to be a label prop, so that the family can be translated without a fork.
58. As a consumer of this package, I want the existing components untouched, so that a minor upgrade adds the family without breaking an import.
59. As a maintainer, I want each module to have stories and tests as a condition of shipping, so that the family cannot grow unevenly.
60. As a maintainer, I want one visual snapshot per module, so that a state that renders nothing is caught by a diff rather than a bug report.
61. As a maintainer, I want each decision recorded and cited from the spec, so that the next change argues with a decision instead of a preference.

## Implementation Decisions

- **A new family, not a folder.** AI components live in a separate source family with their own import
  subpath and their own Storybook kind, and are never re-exported from the root barrel. The family
  means "needs the AI SDK's part shape", not "used in a chat" — the existing message, bubble,
  scroller, trace and marker primitives stay where they are, under `Components`, and no import path
  breaks (ADR 0001).
- **An export family is required, not cosmetic.** The existing component wildcard resolves into the
  `ui` directory, so the new family needs its own entry; the build's export check must learn to sample
  it, and the story-coverage guard must scan it (ADRs 0001, 0011).
- **Props are the part.** Components take the SDK part object and switch on its type and state; no
  flattened `state`/`input`/`output` props, and no wrapper interfaces around the SDK's types, so an
  SDK change becomes a compile error here (ADR 0002).
- **Types only, one major.** `ai` is an optional peer and a devDependency, imported exclusively with
  `import type`, peer range `^6`. A future SDK major is a major of this package (ADRs 0002, 0003).
- **Presentational, always.** No `@ai-sdk/react` import anywhere; no message state, transport,
  streaming, retry or classification. Data in, events out. A returned promise only drives a local
  pending state (ADR 0004).
- **Every part type gets a renderer**: approval, tool, response, reasoning, sources, file, data, plus
  message actions, composer, error, waiting indicator. `step-start` renders nothing until the
  dispatcher groups steps. Provider-specific `custom` parts and the experimental steering part are
  rejected rather than deferred (ADR 0005).
- **One-way dependency.** A family module may import from the `ui` family and from its siblings;
  nothing in `ui` may import from the family (ADR 0005).
- **Approval is inline.** It takes the approval-bearing tool part, emits approve and deny with the
  approval id, renders request, pending, automatic and responded states, treats the descriptor as
  opaque, and never imports the modal dialog. Escalating to a modal is the app's composition
  (ADR 0009).
- **A tool call is one collapsed disclosure row.** `tool` renders one row per part in every state,
  built on the trace disclosure primitives, showing the tool's name and the state's one fact while
  the arguments, output and error stay in the body. A pending approval opens itself and holds the row
  open; grouping several calls into one row remains the dispatcher's job (ADR 0014).
- **Tool delegates its approval states** to the approval card, resolves its name from the static tool
  type or the dynamic tool's name, surfaces provider execution, and renders partial input as text
  rather than parsing it (ADRs 0005, 0014).
- **Markdown is a peer; highlighting is not.** The response component depends on the ecosystem parser
  with GFM, owns the streaming edge cases, and renders fenced code through the existing code block
  chrome. The tool and data components reuse that chrome without highlighting, so the family adds no
  syntax engine and stays in the CommonJS build. Reasoning is plain text (ADRs 0008, 0012).
- **Citations are a list and a marker.** Numbering follows document order of the message's source
  parts, deduplicated, with an override for a provider's own syntax; unresolved and partial markers
  render as literal text. The marker's accessible name is the source title (ADR 0013).
- **Streaming motion is CSS only.** While a part streams, its height eases towards its new size where
  the engine can interpolate to `auto`, and each appended block enters with a fade and a short rise;
  a finished part paints at rest, and reduced motion turns both off. No layout is measured and no
  timer runs (ADR 0015).
- **The composer emits browser files.** It reports what was picked and previews it through the
  existing attachment component; conversion to message parts stays in the app, which keeps the
  runtime import ban absolute (ADR 0010).
- **Naming is part-first and kebab-case**, exported as PascalCase components with sub-parts in the
  parent module. The dispatcher's name is reserved and unused (ADR 0006).
- **Strings are props.** Every user-facing string lives under a `labels` prop, following the theme
  switcher's precedent.
- **Nothing is hidden behind an empty frame.** A module with nothing to render returns nothing, so it
  can be mounted unconditionally.
- **The dispatcher waits.** No part switch ships in v1; consumers map parts themselves until the
  leaves exist to design a registry against (ADR 0007).
- **Release shape.** A minor, additive only, with a README section carrying the install command, the
  SDK's major constraint, a peer row per module that needs one, a link to the decisions, and one
  sentence about choosing a family (ADR 0011).

## Testing Decisions

- **Only external behaviour is tested.** A test mounts a module with a part and asserts what a person
  sees, what they can do, and what the component reports back through its event props. No assertion
  reaches into internal state, class names or component structure; a refactor that keeps behaviour
  must keep the suite green.
- **One primary seam, already used in this repository.** Every module renders from a plain part
  object in jsdom with the testing library, with no provider, transport or network. A state
  transition is the same seam: mount the streaming part, rerender with the finished one, assert the
  difference. Prior art: every existing component suite, which compose primitives and assert visible
  text and roles.
- **One secondary seam, also existing.** A stories file per module is the accessibility and visual
  seam: the Chromium story project renders every story and fails on an axe violation, and one story
  per module opts into the visual snapshot. Prior art: every existing stories file and its Chromatic
  opt-in.
- **One new composed seam.** A single transcript test mounts a full assistant message — response,
  reasoning, a tool call and its approval, sources — to prove the modules read as a conversation and
  do not fight over spacing, order or focus. It asserts composition, not any module's internals.
- **Shared part fixtures.** The loading suites need the same part shapes, and a fixture module placed
  in the source tree would be published as a build entry. The fixtures go in a test-only directory
  that the build's entry discovery excludes, added as a small prefactor before the first module.
- **The guards extend, they do not multiply.** The story-coverage and client-directive checks already
  walk directories; the family joins their list, keeping the three-story minimum, the per-part story
  rule, the single visual opt-in and the directive decision per module.
- **Streaming is tested as data, not time.** No fake timers and no token intervals: a suite renders
  the before and after part and asserts both, which is the same behaviour the app's stream produces.
- **Motion is asserted as a switch, not as time.** jsdom computes neither starting styles nor
  transitions, so a suite asserts the streaming flag that enables the motion and that a finished part
  does not carry it. The settled frame is the visual snapshot; the movement itself is a review item,
  and this spec does not claim a test proves it (ADR 0015).

## Out of Scope

- The part dispatcher and its override registry. Reserved by name, designed in a later release
  (ADR 0007).
- Grouping tool calls into one row, or a visible step boundary: v1 renders one row per part, and
  grouping arrives with the dispatcher (ADRs 0007, 0014).
- `useObject` and `useCompletion` surfaces: structured-output viewing and inline completion.
- Prompt suggestions, context or token meter, and a chat shell layout.
- Provider-specific `custom` parts and the experimental steering message: an app knows its provider,
  the library does not.
- Speech and transcription components, artifact or canvas panes, and message-branch navigation.
- Any ownership of conversation state, transport, error policy or retry.
- Shipping the family from the root barrel, or publishing SDK types as this package's own.
- A consumer smoke test that installs the family's peers; it is a known gap, noted below.

## Further Notes

- Three items gate the release and are verification rather than design: the type-resolution check
  against declarations that reference the SDK, the build's wildcard export sampling for a second
  family, and the absence of any test that actually installs the markdown peer.
- Implementation may settle these without a new decision: the tool-name humanising rules, the exact
  summary wording per state within [ADR 0014](../adr/0014-tool-call-is-a-disclosure.md)'s table, and
  the default wording of each module's labels.
- The height ease in [ADR 0015](../adr/0015-streaming-motion.md) is progressive enhancement; an engine
  without `interpolate-size` gets the appended block's fade, which is the floor that decision
  promises.
- The decisions are the argument; this spec is the plan. A later change should cite the ADR it
  contradicts, and supersede it rather than quietly diverge.
