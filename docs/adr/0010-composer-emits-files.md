# 0010 — The composer emits `File`s, the app converts them

- **Status:** Accepted
- **Date:** 2026-11-26

## Context

`prompt-input` is the only module in the family that handles a browser input the SDK also has a
helper for. `sendMessage` takes `FileUIPart[]`, and `ai` provides the conversion from a `File`
(`fileToDataURL`). Calling that helper here would be a **value** import from `ai`, which
[ADR 0002](0002-type-only-sdk-coupling.md) rules out for the whole family.

The module still has to show what the user attached, remove an attachment, and report what should be
sent.

## Decision

1. **The composer's file boundary is `File[]`.** `onSubmit({ text, files })` with raw browser files;
   `onRemove(file)`, `onAdd(files)` for the picker and paste.
2. **Previews render from `File`**, through the existing `Attachment` component with its own object
   URLs, so an image attached in the composer looks like an image attached anywhere else.
3. **No value import from `ai`.** The app converts with the SDK helper before `sendMessage`. The
   family's dependency rule has no exceptions.
4. **The composer does not own the message list or the transport.** Submit and stop are events
   (`onSubmit`, `onStop`) driven by a `status` prop.
5. **No `get-placeholder`.** That helper appends " (optional)" to a placeholder for optional form
   fields; a composer's prompt is not an optional field.

## Consequences

- An app makes two calls instead of one: convert, then send. In exchange, the rule that keeps the SDK
  out of the library's runtime stays absolute, and the composer works with any transport.
- Object URLs have a lifecycle: the module must create and revoke them, and it therefore carries
  `'use client'`.
- The composer cannot report the SDK's own `files` array as truth; it reports what it picked. A
  resumed draft is the app's problem, and it can pass `defaultFiles`.
- File validation — size, type, count — is not decided here. If v1 needs it, it is a prop with a house
  default rather than a policy.

## Alternatives considered

- **Accept `FileUIPart[]`.** The purest separation, and no file reading in the library. Rejected: the
  picker, the conversion and the attachment state are exactly the code every app would rewrite.
- **Allow the SDK helper in this one module.** One call site, one exception, and the exception becomes
  the pattern. Rejected.
- **Accept both representations.** Handles a resumed draft and a fresh pick identically. Rejected as
  unnecessary surface for v1; `defaultFiles` covers the draft case.
