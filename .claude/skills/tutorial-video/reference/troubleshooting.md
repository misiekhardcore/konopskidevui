# Troubleshooting

Symptom first. Every entry below was hit while making episode 1.

## `voice.mjs` dies on `onnxruntime-node` / "Ignored build scripts"

pnpm refuses dependency build scripts by default. Kokoro reaches the CPU backend through
`onnxruntime-node`, whose postinstall extracts the native libraries.

`pnpm-workspace.yaml` must allow it:

```yaml
allowBuilds:
  onnxruntime-node: true
  protobufjs: true
```

Then `pnpm install` (not `--frozen-lockfile`; the allow-list changes what gets built).

## "No such file" under `~/.cache/huggingface`

`voice.mjs` sets `HF_HOME` to `video/build/hf-cache`. If weights appear in your home directory,
something bypassed the script (an ad-hoc `node -e` import of kokoro-js). Delete the stray cache;
it is not used.

## `shadcn add` writes to a literal `./@/components/ui` directory

The CLI resolves the `@/` alias from the **root** `tsconfig.json`. `create-vite` generates a
solution-style root tsconfig with no `compilerOptions`, so the alias cannot resolve and the CLI
treats `@` as a directory name. Put `baseUrl` and `paths` in the root tsconfig _and_ the app one:

```json
"compilerOptions": { "baseUrl": ".", "paths": { "@/*": ["./src/*"] } }
```

If the directory already exists, delete it before re-running, or the fallback copy in
`sandbox.mjs` will mask the problem.

## `sandbox.mjs` fails parsing `tsconfig.app.json`

`create-vite` writes JSONC (comments, trailing commas in older versions). Strip comments before
`JSON.parse`; `sandbox.mjs` has `stripJsonc` for exactly this.

## The style script reports "0/N components" and the beat is boring

It is idempotent, so a translated tree has nothing to change. The transcript is only interesting
when the registry output is still untranslated: registry first, script second, script again for
the 0. If `sandbox.mjs` copied pre-translated files instead of pulling the registry, the demo
loses its before/after.

## The recorder times out waiting for `__STAGE_DONE`

The stage threw. Serve the same beat by hand and read the console:

```sh
node video/scripts/cli.mjs serve --episode 01-palette
open "http://127.0.0.1:4517/?beat=05-unlayered&duration=20"
```

Usual causes: a scene field the renderer does not read (`type_prefill` vs `prefill`), a figure
name that does not exist under `articles/images`, or a missing `logs/<name>.json`.

## First frames of a clip are blank, or the beat starts mid-animation

The head trim. Playwright starts recording when the context is created, before the stage is
ready; `record.mjs` stores that gap as `head` and `assemble.mjs` trims it. If a clip is blank at
the start, the recording and the trim disagree — re-record that beat rather than adjusting the
number.

## Video is ~0.12 s short per cut

That is an `xfade`. It consumes its own duration. Use the fade-in/fade-out baked into each
segment instead (what the pipeline does), or pay the cost on the audio too with `acrossfade`.

## Audio out of sync but the video looks right

Check the beat's audio against `timeline.json`: the WAV is the authority, and a re-voice without
a re-record is the usual cause. Recording is cheap per beat — just redo the clip.

## `preview` beat shows a blank Storybook pane

`serve.mjs` copies `storybook-static` to `video/build/storybook`, building it first if missing.
A blank pane usually means Storybook was copied mid-build, or the static build uses absolute
asset paths. Re-run `pnpm build-storybook` and delete `video/build/storybook` so it re-copies.

## The app pane shows unstyled content

`index.html`'s entry must import `src/app.css`, which imports Tailwind _before_ the package
stylesheet. Tailwind first is not cosmetic: `@source` and `@theme` ordering depend on it.
