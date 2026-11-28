# Architecture decisions

One file per decision, immutable once accepted. A decision that changes gets a new number and a
superseded pointer on the old one.

These cover the AI component family: what it is, what it may depend on, what it ships and how it is released. Vocabulary lives in [GLOSARY.md](../../GLOSSARY.md).

| ADR                                       | Decision                                                         | Status   |
| ----------------------------------------- | ---------------------------------------------------------------- | -------- |
| [0001](0001-ai-component-family.md)       | AI components are a separate source family, kind and import path | Accepted |
| [0002](0002-type-only-sdk-coupling.md)    | Components take parts; `ai` is coupled by type only              | Accepted |
| [0003](0003-one-sdk-major.md)             | Only the current SDK major (`^6`)                                | Accepted |
| [0004](0004-presentational-only.md)       | The family never calls `useChat`                                 | Accepted |
| [0005](0005-v1-inventory.md)              | v1 covers every part type; eleven modules, in build order        | Accepted |
| [0006](0006-module-naming.md)             | Kebab-case module names, named after the part                    | Accepted |
| [0007](0007-dispatcher-deferred.md)       | The dispatcher arrives after the leaves                          | Accepted |
| [0008](0008-renderer-dependencies.md)     | Markdown peer for `response`; `code-block` reuse in `tool`       | Accepted |
| [0009](0009-approval-is-inline.md)        | Approval is an inline card; `AlertDialog` is escalation          | Accepted |
| [0010](0010-composer-emits-files.md)      | The composer emits `File[]`; the app converts                    | Accepted |
| [0011](0011-release-and-guards.md)        | `0.10.0`, README section, both families guarded                  | Accepted |
| [0012](0012-data-part-fallback.md)        | `data-part` is a fallback plus a `render` prop, no registry      | Accepted |
| [0013](0013-inline-citations.md)          | Citations are a list and an inline marker (amends 0008)          | Accepted |
| [0014](0014-tool-call-is-a-disclosure.md) | One collapsed row per tool call, opened on demand                | Accepted |
| [0015](0015-streaming-motion.md)          | Streaming growth is eased in CSS; appended blocks fade in        | Accepted |

## Verification that gated the release

Nothing in the family was blocked on a decision. Three items were blocked on verification, and
`0.10.0` settles them:

- `attw --profile node16` now names every AI module as an entrypoint, because a wildcard subpath is
  reported as a wildcard: the published `.d.ts` that reference `ai` types are resolved rather than
  skipped ([ADR 0002](0002-type-only-sdk-coupling.md)).
- `check-build.mjs` samples `./components/ai/*` with `tool-approval` beside `./components/*` with
  `button`, so a stale or missing sample fails the build ([ADR 0011](0011-release-and-guards.md)).
- `test:package` still installs only the core dependencies and never imports the family, so it
  proves nothing about the family's peers. That remains the documented gap
  ([ADR 0008](0008-renderer-dependencies.md)).
