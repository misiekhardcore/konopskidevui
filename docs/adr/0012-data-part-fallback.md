# 0012 — `data-part` is a fallback with a render prop

- **Status:** Accepted
- **Date:** 2026-11-26

## Context

A `data-<name>` part is application-defined: `{ type: 'data-<name>', id?, data }`, where `data` is
whatever the app's stream sends. The library cannot type it, cannot know how many kinds exist, and
cannot know what any of them should look like.

A registry — `<DataPart renderers={{ weather: WeatherCard }} />` — would map names to components, and
it is genuinely the most useful shape for an app with several custom parts. It is also the dispatcher
in miniature, and the dispatcher is deliberately deferred
([ADR 0007](0007-dispatcher-deferred.md)) so it can be designed against components that exist.

## Decision

1. **`data-part` renders a fallback**: the part's name, humanised, and its payload as JSON text
   through `CodeBlock`, collapsed when the payload is long.
2. **It takes a `render` prop** — `(part) => ReactNode` — for a payload the app wants to draw. When
   it returns something, the fallback is not rendered.
3. **No registry keyed by `data-<name>` in v1.** The dispatcher will own that mapping, and it will be
   designed against the real renderers.
4. **The payload is never interpreted.** No schema, no coercion, no `eval`: unknown shapes are the
   normal case, not an error.

## Consequences

- An app with several data parts writes one switch inside its `render` prop. That is one switch in one
  place, owned by the app, instead of a mapping API this library would have to replace when the
  dispatcher lands.
- The fallback is also the debugging view: an unregistered part still shows what arrived, which is
  better than a blank space during development.
- The dispatcher's registry inherits a design constraint it did not have before: `render` already
  establishes the per-part escape hatch, so the registry is an ergonomic add-on rather than the only
  way in.
- `data-part` reuses `CodeBlock` without highlighting, so it adds no peer
  ([ADR 0008](0008-renderer-dependencies.md)).

## Alternatives considered

- **A registry in v1.** Better ergonomics for a multi-part app, but it is the deferred dispatcher's
  responsibility, designed early and against nothing.
- **Requiring `render`.** The library would ship no fallback at all, so an app that has not registered
  a renderer sees nothing — which is exactly when a developer most needs to see the payload.
