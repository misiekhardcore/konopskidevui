# 0005 — The v1 inventory covers every part type

- **Status:** Accepted, amended by [0012](0012-data-part-fallback.md)
- **Date:** 2026-11-26

## Context

The family exists to render an AI SDK `UIMessage`. A family that covers half the union is worse than
none: every app fills the same gaps and the library inherits the reputation of the parts it skipped.
So the first release is defined by the union, not by convenience.

## Decision

One release, one module per part family, in this build order:

| #   | Module             | Renders                                                                                                                                    |
| --- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | `tool-approval`    | A tool part in `approval-requested`: the request reason, the call's arguments, approve / deny, an optional denial reason, a pending state. |
| 2   | `tool`             | A tool part in every state: `input-streaming` (partial input), `input-available`, the approval states, `output-available`, `output-error`. |
| 3   | `response`         | A `text` part: streaming-safe markdown, with a caret while `state: 'streaming'`.                                                           |
| 4   | `reasoning`        | A `reasoning` part: live while streaming, collapsed once `done`, with its duration.                                                        |
| 5   | `sources`          | `source-url` and `source-document` parts as a citation list, plus the inline marker that points at one.                                    |
| 6   | `file-part`        | A `file` part the model produced: image, audio, PDF, with open and download.                                                               |
| 7   | `data-part`        | A `data-<name>` part: a labelled fallback, plus the app's `render` prop.                                                                   |
| 8   | `message-actions`  | Copy, regenerate, edit-and-resend, feedback — events out, no state.                                                                        |
| 9   | `prompt-input`     | The composer: submit and stop, attachments, a disabled and an error state.                                                                 |
| 10  | `chat-error`       | A conversation-level error as data: message, retry, dismiss. No policy.                                                                    |
| 11  | `typing-indicator` | "Waiting for the first token", with the conversation's status as a prop.                                                                   |

`step-start` renders nothing. It is a step boundary, and grouping belongs to the dispatcher, which is
a later release ([ADR 0007](0007-dispatcher-deferred.md)).

**Deliberately not in v1, and not promised:** `message-parts` (the dispatcher), `structured-output`
(`useObject`), `completion` (`useCompletion`), `suggestions`, `context-meter`, a `chat-shell` layout.
Each is a real candidate; none of them is about rendering a part.

**Rejected, not deferred:** a `custom` part renderer (provider-specific by definition — an app knows
its provider, the library does not), the experimental `steering-message`, speech and transcription
components, artifact/canvas panes, and message-branch navigation. These are not gaps in a
part-rendering family; they are a different product.

## Consequences

- The release is large. Each module is small and independent, and the build order is the review
  order: `tool-approval` before `tool` because `tool` renders it as the `approval-requested` body.
- **Dependency direction is one way.** A module in `components/ai/` may import from `components/ui/`;
  nothing in `components/ui/` may import from `components/ai/`. The primitives stay usable by apps
  that never install the SDK.
- Reusing a `ui` module can import a heavy optional peer transitively. That is decided per component,
  not by this ADR, because it changes what installing the AI family costs.
- Eleven modules means eleven Chromatic opt-ins, eleven jsdom suites and eleven stories files, all
  subject to the guards in ADR 0001.
- "Every part type" is a claim that has to stay true: when the SDK adds a part, this table is the
  place that notices.

## Alternatives considered

- **A working chat first** (`tool`, `tool-approval`, `prompt-input`, `message-actions`, `response`).
  Smaller and coherent, but it leaves `source-*`, `file` and `data-*` to per-app forks, which is the
  state the family exists to end.
- **`tool` and `tool-approval` only.** Proves the contract cheaply, and leaves the family unusable
  for a real conversation.
- **`tool` alone as a pilot.** Cheapest review, slowest to value, and it tests one component's
  contract rather than the family's.
