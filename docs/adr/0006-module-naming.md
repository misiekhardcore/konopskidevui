# 0006 — Module names follow the part, in kebab-case

- **Status:** Accepted
- **Date:** 2026-11-26

## Context

An import path is the longest-lived decision in a component library. `@konopskidev/ui/components/ai/tool`
will be typed by people and pinned by lockfiles long after the component's internals have changed
twice. The house already has a pattern: `code-block`, `message-scroller`, `alert-dialog`,
`input-group` — kebab-case, named after the thing rendered.

## Decision

- **Kebab-case file names**, matching the rest of `components/ui`.
- **Named after what renders, not after the SDK's internal vocabulary or the hook that produces the
  data.** `tool`, not `tool-call`; `tool-approval`, not `confirmation` or `tool-approval-request`;
  `file-part` and `data-part`, not `media` and `payload`.
- **`tool` and `tool-approval` stay adjacent** in an alphabetised import list and an alphabetised
  Storybook sidebar, which is where someone looking for approval will look first.
- **Exported names are PascalCase versions of the module**: `Tool`, `ToolApproval`, `PromptInput`,
  `MessageActions`, `Response`, `Reasoning`, `Sources`, `FilePart`, `DataPart`, `ChatError`,
  `TypingIndicator`.
- **Sub-parts live in the parent's module** and are exported from it: `ToolHeader`, `ToolInput`,
  `ToolOutput`, `ToolError`, `ToolStatus`. A second module is only justified when the sub-part is
  independently useful, which is why `tool-approval` is its own file rather than `ToolApproval`
  inside `tool`.
- **No `ai` prefix.** The family is already in the path; `ai/ai-tool` would be noise.
- **`message-parts` is reserved** for the deferred dispatcher ([ADR 0007](0007-dispatcher-deferred.md)),
  so the name is not available for anything else in the meantime.
- **Storybook titles are `AI/<PascalName>`**, one kind segment, per [ADR 0001](0001-ai-component-family.md).

## Consequences

- A consumer reading `@konopskidev/ui/components/ai/sources` knows what it renders without opening
  docs.
- The SDK's prose and this package's names differ in places (`tool invocation` vs `tool`). That is
  deliberate: the library is not an SDK glossary, and `tool` is what a person types.
- Renaming a module after release is a breaking change, so the list in [ADR 0005](0005-v1-inventory.md)
  is the commitment, not a draft.

## Alternatives considered

- **SDK prose** (`tool-call`, `tool-approval-request`, `part-renderer`). More precise, longer, and
  `tool-approval-request` is a poor name for a component imported often.
- **`confirmation` for approvals**, matching the shadcn ecosystem. Reads as a general primitive, but
  the component answers a specific tool part's approval id and cannot serve a general confirmation
  use — `AlertDialog` already does that.
