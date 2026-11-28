# 0002 — AI components take parts, coupled by type only

- **Status:** Accepted
- **Date:** 2026-11-26

## Context

The family in [ADR 0001](0001-ai-component-family.md) renders AI SDK `UIMessagePart`s. That shape is
the input: a `Tool` switches on seven `state` values, a dispatcher has to name the union, and a
`Sources` list reads `sourceId` and `url` off the part.

Two forces pull against each other. Fidelity says the SDK is the data source, so the components
should consume its types directly. The package's own rule says an app that imports `Button` must
never resolve an optional peer, and a new peer is exactly what the SDK would be.

They do not actually conflict, because the reference can be type-only. `import type` is erased
before the build sees it, so nothing can be pulled in at runtime, and any app that has tool parts
already has `ai` installed — it is a dependency of `@ai-sdk/react`.

## Decision

1. **`import type` from `ai` is the only permitted form.** No value import from `ai` anywhere in the
   family, and no import from `@ai-sdk/react` at all.
2. **`ai` is an optional peer and a devDependency.** It is named in the README install table like
   every other optional peer, and the family stays deep-import only.
3. **Props are the part, not its fields.** `<Tool part={part} />`, `<MessageParts message={message} />`.
   Rendering switches on `part.type` and `part.state`; the library never re-declares the state union
   or flattens the part into `state`/`input`/`output` props.
4. **Anything the part does not carry is a prop with a house default** — an icon per tool name, the
   labels, a renderer override. The SDK stays the data source; the library stays the presentation.
5. **Public types are the SDK's own types.** No wrapper interfaces around `ToolUIPart`,
   `UIMessage`, `FileUIPart`. An SDK change becomes a type error in this repository instead of a
   silent behavioural drift.

## Consequences

- A consumer passes exactly what `useChat` hands them. No mapping layer, no adapter to keep in sync.
- When the SDK changes a part, the breakage lands in `pnpm tsc` here rather than in a consumer's app.
- The published `.d.ts` references `ai`. An app that imports the family without `ai` gets a type
  error, which is correct: it has no parts to pass.
- `pnpm tsc` needs `ai` installed, so it is a real devDependency and its version here decides which
  part union ships.
- `pnpm test:package` installs only React and Tailwind and never imports the family, so it stays
  green. `attw --profile node16` inspects every entrypoint and may object to the unresolvable `ai`
  types. Verify this in the first implementation PR. If it objects, exclude the family's entrypoints
  the way `video`, `lib/highlighter` and `hooks/use-highlighted-code` already are, or install `ai`
  in the scratch consumer. Do not inline copies of the types to make the check pass.
- The family is unusable from an app with no AI SDK. That app uses the `components/ui` primitives,
  which is what they are for.

## Alternatives considered

- **Structural types only.** The library declares its own state union and takes fields. No peer and
  no drift from the SDK's release cycle, but the union becomes a copy that lags, every app writes
  the mapping, and a typed dispatcher is impossible without an `unknown[]` parts prop.
- **Both APIs.** Primitives take fields, part-shaped wrappers take the part. Most flexible, and the
  only option a non-SDK consumer could use. Rejected as the default because the wrappers are what
  people import, so the surface doubles for a benefit few consumers see.
- **Runtime coupling.** Import `getToolName` and `isToolUIPart` for real, so tool-name parsing lives
  in one place. Rejected: it makes the SDK a runtime requirement of every module in the family, and
  the parsing it saves is a single string slice.

## Follow-ups

- The supported SDK version line is its own decision, because the part union differs between majors.
- Whether the family may ship hook-bound components is its own decision; this ADR only rules out
  `@ai-sdk/react` inside the components described here.
